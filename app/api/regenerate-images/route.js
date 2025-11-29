import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
async function generateImage(prompt) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhanced prompt for photorealism with Indian context
        const enhancedPrompt = prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi";

        console.log('Generating image with Google Gemini:', enhancedPrompt);

        // Generate image
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        });

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error('No image candidate returned from Google');
        }

        const imageBase64 = response.candidates[0].content.parts[0].inlineData.data;
        const buffer = Buffer.from(imageBase64, 'base64');

        // Upload to Vercel Blob
        const filename = `generated-image-${Date.now()}.jpg`;
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: 'image/jpeg'
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
            const buffer = Buffer.from(imageRes.data);
            const filename = `dalle-fallback-${Date.now()}.png`;
            const blob = await put(filename, buffer, {
                access: 'public',
                contentType: 'image/png'
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
        const { hook, productUrl, productImages, productTitle } = await request.json();

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

        // Generate Images
        const imagePromises = prompts.map(prompt => generateImage(prompt));
        const images = await Promise.all(imagePromises);
        const validImages = images.filter(img => img !== null);

        return NextResponse.json({ success: true, images: validImages });

    } catch (error) {
        console.error('Regeneration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
