import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import axios from 'axios';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Scrape product page (simplified version)
async function scrapeProductPage(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);

        // Basic extraction
        const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim();

        return { title };
    } catch (error) {
        console.error('Scraping error:', error.message);
        return { title: 'Product' };
    }
}

// Helper: Generate Image
async function generateImage(prompt, referenceImages = null) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhanced prompt for photorealism with Indian context
        const enhancedPrompt = prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi";

        console.log('Generating image with Google Gemini:', enhancedPrompt);

        // Prepare content parts
        const parts = [{ text: enhancedPrompt }];

        // Add reference images if available (for Image 2/Solution)
        if (referenceImages) {
            const imagesToProcess = Array.isArray(referenceImages) ? referenceImages : [referenceImages];

            console.log(`📸 Processing ${imagesToProcess.length} reference images...`);

            for (const imgUrl of imagesToProcess) {
                if (!imgUrl) continue;

                try {
                    const refImageRes = await axios.get(imgUrl, {
                        responseType: 'arraybuffer',
                        timeout: 5000
                    });

                    const refBase64 = Buffer.from(refImageRes.data).toString('base64');
                    const mimeType = refImageRes.headers['content-type'] || 'image/jpeg';

                    parts.push({
                        inlineData: {
                            mimeType,
                            data: refBase64
                        }
                    });
                } catch (e) {
                    console.warn(`⚠️ Failed to attach reference image (${imgUrl}):`, e.message);
                }
            }
            console.log(`✅ Added ${parts.length - 1} reference images to Gemini request`);
        }

        // Generate image
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: parts }],
        });

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error('No image candidate returned from Google');
        }

        const imageBase64 = response.candidates[0].content.parts[0].inlineData.data;
        const buffer = Buffer.from(imageBase64, 'base64');

        // Convert to WebP using Sharp
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Vercel Blob as WebP
        const filename = `generated-image-${Date.now()}.webp`;
        const blob = await put(filename, webpBuffer, {
            access: 'public',
            contentType: 'image/webp'
        });

        return { url: blob.url, engine: 'google' };

    } catch (error) {
        console.error('Google Image Gen Error:', error);
        console.log('Falling back to DALL-E 3...');

        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi",
                n: 1,
                size: "1792x1024", // Landscape (closest to 4:3)
                quality: "standard",
            });

            const imageUrl = response.data[0].url;

            // Download and upload to Blob
            const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            // Convert to WebP using Sharp
            const webpBuffer = await sharp(imageRes.data)
                .webp({ quality: 80 })
                .toBuffer();

            const filename = `dalle-fallback-${Date.now()}.webp`;
            const blob = await put(filename, webpBuffer, {
                access: 'public',
                contentType: 'image/webp'
            });

            return { url: blob.url, engine: 'dalle' };

        } catch (dalleError) {
            console.error('DALL-E Error:', dalleError);
            return null;
        }
    }
}

export async function POST(request) {
    try {
        const { hook, productUrl, productImages, productTitle, productDescription, productMainImage, imageIndex, visualBrief } = await request.json();

        if (!hook) {
            return NextResponse.json({ success: false, error: 'Hook is required' }, { status: 400 });
        }

        // Get product title if not provided
        let title = productTitle;
        if (!title && productUrl) {
            const productData = await scrapeProductPage(productUrl);
            title = productData.title;
        }

        // Generate Prompts using GPT-4o-mini
        const systemPrompt = `You are an expert art director. Create 2 distinct, dramatic image prompts based on the provided hook and product info.
        
        STRUCTURE:
        - Image 1: THE PROBLEM (Pain point, frustration, mess - NO product)
        - Image 2: THE SOLUTION (Transformation, product in action, before/after)
        
        CONTEXT:
        - Product: ${title}
        ${productDescription ? `- Physical Description: "${productDescription}" (Adhere strictly to this)` : ''}
        - Setting: Indian household
        - Style: Photorealistic, dramatic lighting, candid
        
        ${productImages && productImages.length > 0 ? 'IMPORTANT: You have seen the product images. Describe the product accurately in Image 2.' : ''}
        
        Return ONLY a JSON array of 2 strings: ["prompt 1", "prompt 2"]`;

        const userPrompt = `HOOK: "${hook}"`;

        const messages = [{ role: "system", content: systemPrompt }];

        // Add vision if images provided
        if (productImages && productImages.length > 0) {
            const contentParts = [{ type: "text", text: userPrompt }];
            productImages.forEach(img => {
                contentParts.push({ type: "image_url", image_url: { url: img } });
            });
            messages.push({ role: "user", content: contentParts });
        } else {
            messages.push({ role: "user", content: userPrompt });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.9,
            max_tokens: 500,
        });

        let prompts;
        try {
            prompts = JSON.parse(completion.choices[0].message.content);
        } catch (e) {
            // Fallback parsing if not pure JSON
            const content = completion.choices[0].message.content;
            const match = content.match(/\[.*\]/s);
            if (match) {
                prompts = JSON.parse(match[0]);
            } else {
                throw new Error('Failed to parse prompts');
            }
        }

        // OVERRIDE Image 1 prompt if Visual Brief is provided
        if (visualBrief && (imageIndex === 0 || imageIndex === undefined)) {
            prompts[0] = `${visualBrief}. Create a similar image with the same composition, mood, lighting, and visual style. Indian household setting. CRITICAL: Do NOT include any text overlays, captions, headlines, buttons, or call-to-action elements. Focus purely on the visual scene, people, emotions, and environment. Photorealistic, candid photography, dramatic lighting.`;
            console.log('🎨 Using Visual Brief for Image 1 regeneration');
        }

        // Prepare reference images for Image 2
        const image2Refs = [];
        if (productMainImage) image2Refs.push(productMainImage);
        if (productImages && Array.isArray(productImages)) image2Refs.push(...productImages);

        // Generate Images
        const imagePromises = prompts.map((prompt, index) => {
            // If imageIndex is specified, skip other images
            if (typeof imageIndex === 'number' && imageIndex !== index) {
                return Promise.resolve(null);
            }
            return generateImage(prompt, index === 1 ? image2Refs : null);
        });
        const images = await Promise.all(imagePromises);
        // Do NOT filter nulls here, so we preserve indices for the frontend
        // The frontend expects images[1] to be the second image

        return NextResponse.json({ success: true, images: images });

    } catch (error) {
        console.error('Regeneration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
