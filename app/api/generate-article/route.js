import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { put } from '@vercel/blob';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Direct-response copywriting system prompt
const SYSTEM_PROMPT = `You are an elite direct-response copywriter specializing in aggressive, conversion-optimized advertorials for cold Facebook traffic.

CORE PRINCIPLES:
- Focus on old-school direct response tactics
- Be aggressive and clickbaity (but legal)
- Use subjunctive mood (could/may/might) to avoid concrete claims
- Create urgency and FOMO
- Target pain points aggressively
- Use social proof and authority
- Create desire through storytelling
- Make it feel like editorial content, not an ad

STYLE GUIDELINES:
- Write like a real person sharing a discovery
- Use conversational, relatable language
- Include specific details and scenarios
- Build credibility before the pitch
- Use pattern interrupts
- Create emotional resonance
- End with strong, clear CTAs

LEGAL COMPLIANCE:
- Never make unsubstantiated health claims
- Use "could", "may", "might" for benefits
- Include disclaimers where needed
- Avoid absolute guarantees
- Don't make income claims

Your goal: Create an advertorial that an elite CRO expert would consider their magnum opus.`;

// Scrape product page
async function scrapeProductPage(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Extract product info
        const title = $('h1').first().text().trim() ||
            $('title').text().trim() ||
            $('[property="og:title"]').attr('content') || '';

        const description = $('[name="description"]').attr('content') ||
            $('[property="og:description"]').attr('content') ||
            $('p').first().text().trim() || '';

        const price = $('[class*="price"]').first().text().trim() ||
            $('[data-price]').first().text().trim() || '';

        // Get main content
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 2000);

        return {
            title,
            description,
            price,
            bodyText,
            url
        };
    } catch (error) {
        console.error('Scraping error:', error);
        return {
            title: '',
            description: '',
            price: '',
            bodyText: '',
            url
        };
    }
}

// Generate image using Google Imagen 3 via SDK
async function generateImage(prompt) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Key is missing');

        // Initialize Google AI
        const genAI = new GoogleGenerativeAI(apiKey);

        // Note: As of late 2025, image generation might still use a specific model ID
        // We'll try the latest Imagen model available via the SDK
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

        // The SDK method for images might differ slightly based on version
        // If standard generateContent doesn't work for images, we fallback to REST but with better error handling
        // However, let's try the REST endpoint again but with the exact correct format for Imagen 3

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
            {
                instances: [
                    { prompt: prompt + " photorealistic, 4k, highly detailed, editorial photography style, natural lighting" }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "4:3",
                    outputOptions: { mimeType: "image/jpeg" }
                }
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.data.predictions || !response.data.predictions[0]) {
            throw new Error('No predictions returned from Google');
        }

        const base64Image = response.data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Image, 'base64');

        // Upload to Vercel Blob
        const filename = `ai-generated-${Date.now()}.jpg`;
        const blob = await put(filename, buffer, {
            access: 'public',
        });

        return { url: blob.url, engine: 'google' };

    } catch (error) {
        console.error('Google Imagen generation error:', error.response?.data || error.message);

        // Fallback to DALL-E 3
        console.log('Falling back to DALL-E 3...');
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt + " photorealistic, 4k, highly detailed, editorial photography style, natural lighting",
                n: 1,
                size: "1792x1024", // Landscape (closest to 4:3)
                quality: "standard",
            });

            const dalleUrl = response.data[0].url;

            // Fetch DALL-E image and upload to Blob
            const imageRes = await axios.get(dalleUrl, { responseType: 'arraybuffer' });
            const filename = `dalle-fallback-${Date.now()}.png`;
            const blob = await put(filename, imageRes.data, {
                access: 'public',
            });

            return { url: blob.url, engine: 'dalle' };
        } catch (dalleError) {
            console.error('DALL-E 3 fallback error:', dalleError);
            return null;
        }
    }
}

// Generate article from product link
async function generateFromProductLink(productUrl) {
    const productData = await scrapeProductPage(productUrl);

    const prompt = `Create a high-converting advertorial for this product:

PRODUCT INFO:
- URL: ${productData.url}
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price}
- Additional context: ${productData.bodyText.substring(0, 500)}

Generate a complete advertorial with:

1. HEADLINE: Aggressive, clickbaity, curiosity-driven (use numbers, questions, or shocking statements)

2. HOOK PARAGRAPH: Bold opening that grabs attention and creates intrigue (will be displayed in bold)

3. STORY (5-8 paragraphs): 
   - Start with a relatable problem/pain point
   - Build tension and frustration
   - Introduce the "discovery" moment
   - Show transformation
   - Use specific details and scenarios
   - Make it feel real and authentic

4. BENEFITS (3-4 items):
   - Each with a catchy title
   - Detailed description of the benefit
   - Use "could", "may", "might" for claims
   - Focus on transformation, not features

5. URGENCY BOX:
   - Title: Create FOMO
   - Text: Scarcity, urgency, or social proof

6. CTA TEXT: Action-oriented, benefit-driven button text

7. COMMENTS SECTION (5-7 comments):
   - Create realistic user comments
   - Use "Hinglish" style (mix of Hindi and English)
   - Approx 10% Hindi words/phrases, 90% English
   - Examples: "Bhai, this is amazing", "Maine order kiya tha, delivery fast thi", "Iska price kya hai?"
   - Make them sound authentic and varied (some questions, some praise)

8. SUPPORTING IMAGES: Create 2 distinct, detailed prompts for photorealistic images that would support this story (e.g., "close up of dirty vs clean window", "happy family in living room").

Also suggest:
- CATEGORY: "Lifestyle" or "Health & Family"
- AUTHOR NAME: Realistic Indian name
- ADVERTORIAL LABEL: Short catchy label (e.g., "BREAKING DISCOVERY" or "HEALTH ALERT")
- EXCERPT: One-line teaser for homepage

Return ONLY valid JSON in this exact format:
{
  "title": "headline here",
  "slug": "url-friendly-slug",
  "category": "Lifestyle",
  "author": "Name Here",
  "advertorial_label": "LABEL HERE",
  "excerpt": "teaser here",
  "hook": "hook paragraph",
  "story": ["paragraph 1", "paragraph 2", ...],
  "benefits": [
    {"title": "Benefit 1", "description": "details"},
    {"title": "Benefit 2", "description": "details"}
  ],
  "urgency_box": {
    "title": "urgency title",
    "text": "urgency text"
  },
  "comments": [
    {"name": "User Name", "text": "Comment text here", "time": "2 min ago"}
  ],
  "cta_text": "CTA BUTTON TEXT >>",
  "image_prompts": ["prompt 1", "prompt 2"]
}`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 3000,
        response_format: { type: "json_object" }
    });

    const articleData = JSON.parse(completion.choices[0].message.content);

    // Generate images in parallel
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const imagePromises = articleData.image_prompts.map(prompt => generateImage(prompt));
        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);
    }

    return articleData;
}

// Generate article from ad creative
async function generateFromAdCreative(imageUrl, productUrl) {
    const productData = await scrapeProductPage(productUrl);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Analyze this ad creative and create a congruent advertorial that matches its messaging and tone.

PRODUCT INFO:
- URL: ${productData.url}
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price}

Create an advertorial that:
1. Matches the ad's messaging and angle
2. Continues the narrative from the ad
3. Maintains the same emotional tone
4. Delivers on the ad's promise

Include 2 detailed prompts for supporting images in the 'image_prompts' array.
Generate the same JSON structure as before with headline, hook, story, benefits, urgency box, comments (Hinglish), and CTA.`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl
                        }
                    }
                ]
            }
        ],
        temperature: 0.9,
        max_tokens: 3000,
        response_format: { type: "json_object" }
    });

    const articleData = JSON.parse(completion.choices[0].message.content);

    // Generate images in parallel
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const imagePromises = articleData.image_prompts.map(prompt => generateImage(prompt));
        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);
    }

    return articleData;
}

// API Route Handler
export async function POST(request) {
    try {
        const { mode, productUrl, imageUrl } = await request.json();

        if (!productUrl) {
            return NextResponse.json(
                { success: false, error: 'Product URL is required' },
                { status: 400 }
            );
        }

        let articleData;

        if (mode === 'product') {
            articleData = await generateFromProductLink(productUrl);
        } else if (mode === 'creative') {
            if (!imageUrl) {
                return NextResponse.json(
                    { success: false, error: 'Image URL is required for creative mode' },
                    { status: 400 }
                );
            }
            articleData = await generateFromAdCreative(imageUrl, productUrl);
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid mode' },
                { status: 400 }
            );
        }

        // Add CTA link
        articleData.cta_link = productUrl;
        articleData.published_date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return NextResponse.json({
            success: true,
            article: articleData
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate article' },
            { status: 500 }
        );
    }
}
