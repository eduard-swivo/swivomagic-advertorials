import { NextResponse } from 'next/server';
import { getArticleBySlug, getArticleBySlugForAdmin, updateArticle, deleteArticle } from '@/lib/db';
import { del } from '@vercel/blob';

// GET single article by slug
export async function GET(request, { params }) {
    try {
        const article = await getArticleBySlug(params.slug);

        if (article) {
            return NextResponse.json({ success: true, article });
        } else {
            return NextResponse.json(
                { success: false, error: 'Article not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT update article
export async function PUT(request, { params }) {
    try {
        const articleData = await request.json();
        const result = await updateArticle(params.slug, articleData);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE article
export async function DELETE(request, { params }) {
    try {
        // 1. Fetch article to get image URLs (using Admin function to find even if unpublished)
        const article = await getArticleBySlugForAdmin(params.slug);

        if (!article) {
            return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
        }

        // 2. Delete from DB
        const result = await deleteArticle(params.slug);

        if (result.success) {
            // 3. Delete images from Blob
            const imagesToDelete = [];
            if (article.hero_image) imagesToDelete.push(article.hero_image);
            if (article.second_image) imagesToDelete.push(article.second_image);
            if (article.product_main_image) imagesToDelete.push(article.product_main_image);

            // Filter for Vercel Blob URLs only
            const blobUrls = imagesToDelete.filter(url => url && url.includes('public.blob.vercel-storage.com'));

            if (blobUrls.length > 0) {
                try {
                    await del(blobUrls);
                    console.log('Deleted images:', blobUrls);
                } catch (blobError) {
                    console.error('Error deleting images from Blob:', blobError);
                }
            }

            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
