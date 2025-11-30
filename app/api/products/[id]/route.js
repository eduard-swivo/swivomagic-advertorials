import { NextResponse } from 'next/server';
import { deleteProduct, updateProduct } from '@/lib/db';
import { put } from '@vercel/blob';

import sharp from 'sharp';

export async function PUT(request, { params }) {
    try {
        const data = await request.json();

        if (!data.name || !data.url) {
            return NextResponse.json({ success: false, error: 'Name and URL are required' }, { status: 400 });
        }

        // Handle image uploads if they are base64 strings
        let processedImages = [];
        if (data.images && Array.isArray(data.images)) {
            const uploadPromises = data.images.map(async (img) => {
                if (img.startsWith('data:image')) {
                    // Convert base64 to buffer
                    const base64Data = img.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');

                    // Convert to WebP
                    const webpBuffer = await sharp(buffer)
                        .webp({ quality: 80 })
                        .toBuffer();

                    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

                    const blob = await put(filename, webpBuffer, {
                        access: 'public',
                        contentType: 'image/webp'
                    });
                    return blob.url;
                }
                return img; // Already a URL
            });
            processedImages = await Promise.all(uploadPromises);
        }

        // Handle main_image upload
        let mainImageUrl = data.main_image;
        if (mainImageUrl && mainImageUrl.startsWith('data:image')) {
            const base64Data = mainImageUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');

            // Convert to WebP
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 80 })
                .toBuffer();

            const filename = `product-main-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

            const blob = await put(filename, webpBuffer, {
                access: 'public',
                contentType: 'image/webp'
            });
            mainImageUrl = blob.url;
        }

        const productData = {
            ...data,
            images: processedImages,
            main_image: mainImageUrl
        };

        const product = await updateProduct(params.id, productData);
        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const success = await deleteProduct(params.id);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
