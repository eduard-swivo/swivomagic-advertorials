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

// Generate image using Google Gemini 3 Pro Image (Nano Banana Pro)
async function generateImage(prompt) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Key is missing');

        // Initialize Google AI with Gemini 3 Pro Image
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhanced prompt for photorealism with Indian context
        const enhancedPrompt = prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi";

        // Generate image
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: enhancedPrompt }]
            }],
            generationConfig: {
                temperature: 0.4,
                candidateCount: 1,
            }
        });

        // Extract image data
        const response = await result.response;
        const imageData = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imageData || !imageData.inlineData) {
            throw new Error('No image data returned from Gemini');
        }

        const base64Image = imageData.inlineData.data;
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
                prompt: prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi",
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
// Generate article from product link
async function generateFromProductLink(productUrl, productImages = null, productDescription = null, angle = 'before-after') {
    const productData = await scrapeProductPage(productUrl);

    // Build the prompt with product image context if available
    let promptAddition = '';

    if (productDescription) {
        promptAddition += `\n\nPHYSICAL PRODUCT DESCRIPTION: "${productDescription}"\n(Use this EXACT description for all visual details in the story and image prompts. Do not hallucinate colors or features.)`;
    }

    if (productImages && productImages.length > 0) {
        promptAddition += `\n\nPRODUCT IMAGES PROVIDED: You have access to ${productImages.length} product image(s). Use them to create more accurate image prompts that show the real product in before/after scenarios.`;
    }

    // Angle Instructions
    const angleInstructions = {
        'in-use': "ANGLE: Product In Use. Focus on the MECHANISM and ACTION. The story should describe exactly how the product works. Image 1: Show the problem in action. Image 2: Show the product being used and working perfectly.",
        'before': "ANGLE: The Before. Focus on the PAIN POINT and FRUSTRATION. The story should dwell on the struggle before finding the solution. Image 1: A dramatic, high-emotion shot of the problem (mess, pain, etc.). Image 2: The relief of finding the solution.",
        'before-after': "ANGLE: Before & After. Focus on the TRANSFORMATION. The story should contrast the 'old way' vs the 'new way'. Image 1: Split screen showing the problem (left) and the result (right). Image 2: The product sitting next to the perfect result.",
        'in-hand': "ANGLE: Product In Hand. Focus on the DISCOVERY and the OBJECT. The story should feel like a personal review of a new gadget. Image 1: Holding the product in hand, showing its size/quality. Image 2: The product in its environment.",
        'story': "ANGLE: Story Related. Focus on the NARRATIVE and EMOTION. The story should be about a person (e.g., grandmother, busy mom) and their journey. Image 1: An emotional shot related to the story (e.g., tired mom). Image 2: Happy family/person using the product.",
        'after': "ANGLE: The After. Focus on the RESULT and RELIEF. The story should start with the happy ending and explain how they got there. Image 1: The perfect, pristine result. Image 2: The person enjoying the result with the product nearby."
    };

    const selectedAngleInstruction = angleInstructions[angle] || angleInstructions['before-after'];

    const prompt = `Create a high-converting advertorial for this product:

PRODUCT INFO:
- URL: ${productData.url}
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price}
- Additional context: ${productData.bodyText.substring(0, 500)}${promptAddition}

GENERATION ANGLE: ${selectedAngleInstruction}
(IMPORTANT: Follow this angle strictly for both the story narrative and the image prompts.)

Generate a complete advertorial with:

1. HEADLINE: Aggressive, clickbaity, curiosity-driven (use numbers, questions, or shocking statements)

2. SLUG: Generate a URL-friendly slug from the headline
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (₹, ?, !, etc.)
   - Keep only 5-8 words (max 60 characters)
   - Example: "This ₹699 Cloth Replaced My Entire Cleaning Cabinet" → "this-699-cloth-replaced-my-cleaning-cabinet"

3. HOOK PARAGRAPH: Bold opening that grabs attention and creates intrigue (will be displayed in bold)
   - DO NOT use asterisks or markdown formatting
   - Write in plain text only
   - Make it dramatic and compelling

4. STORY (5-8 paragraphs): 
   - Start with a relatable problem/pain point
   - Build tension and frustration
   - Introduce the "discovery" moment with a **BOLD SUBHEADING** (e.g., "**It was the Swivo Magic Cloth.**")
   - Show transformation
   - Use specific details and scenarios
   - Make it feel real and authentic
   
   **FORMATTING RULES FOR STORY:**
   - Use **bold** for product names, key phrases, and dramatic reveals
   - Use **bold subheadings** to break up the story (e.g., "**The Turning Point:**", "**Why This ₹699 Cloth Is Viral:**")
   - Use *italics* for asides or parenthetical thoughts (e.g., *(Imagine a split screen here: Left: Common rag. Right: Swivo Magic finish.)*)
   - Bold important numbers and prices (e.g., "**₹699**", "**5x its weight**")
   - Keep paragraphs short (2-4 sentences max)
   - Use conversational, punchy language

5. BENEFITS (3-4 items):
   - Each with a catchy, **BOLD** title (e.g., "**Reason #1: It's Not Toxic (But It Works)**")
   - Detailed description of the benefit
   - Use "could", "may", "might" for claims
   - Focus on transformation, not features
   - Bold key phrases and product names in descriptions

6. URGENCY BOX:
   - Title: Create FOMO
   - Text: Scarcity, urgency, or social proof

7. CTA TEXT: Action-oriented, benefit-driven button text

8. COMMENTS SECTION (5-7 comments):
   - Create realistic user comments
   - Use "Hinglish" style (mix of Hindi and English)
   - Approx 10% Hindi words/phrases, 90% English
   - Examples: "Bhai, this is amazing", "Maine order kiya tha, delivery fast thi", "Iska price kya hai?"
   - Make them sound authentic and varied (some questions, some praise)
   - TIMESTAMPS: Must be random DAYS apart (e.g., "2 days ago", "5 days ago", "1 week ago"), NOT minutes or hours.

9. HERO IMAGE PROMPTS: Create 2 DRAMATIC, attention-grabbing image prompts that DIRECTLY relate to the selected ANGLE (${angle}).
   
   **IMAGE 1 - PRIMARY ANGLE SHOT:**
   - Follow the instruction: "${selectedAngleInstruction.split('Image 1: ')[1].split(' Image 2:')[0]}"
   - Make it relatable and dramatic
   
   **IMAGE 2 - SECONDARY/SUPPORTING SHOT:**
   - Follow the instruction: "${selectedAngleInstruction.split('Image 2: ')[1]}"
   - Reference the actual product: "${productData.title}"
   
   **GENERAL RULES:**
   - IMPORTANT: If showing people, specify "Indian household" or "Indian family"
   - Use dramatic lighting, close-ups, or striking scenarios
   ${productImages && productImages.length > 0 ? '- You have seen the product images, so describe the product accurately in the prompts' : ''}
   - Focus on evoking emotion and curiosity

Also suggest:
- CATEGORY: "Lifestyle" or "Health & Family"
- AUTHOR NAME: Realistic Indian woman's name with abbreviated surname (e.g., "Priya S.", "Anjali M.", "Sneha K.")
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
    {"name": "User Name", "text": "Comment text here", "time": "2 days ago"}
  ],
  "cta_text": "CTA BUTTON TEXT >>",
  "image_prompts": ["prompt 1", "prompt 2"]
}`;

    // If product images are provided, use vision model
    const messages = [
        { role: "system", content: SYSTEM_PROMPT }
    ];

    if (productImages && productImages.length > 0) {
        const contentParts = [{ type: "text", text: prompt }];

        // Add all product images to the content
        productImages.forEach(imageData => {
            contentParts.push({
                type: "image_url",
                image_url: { url: imageData }
            });
        });

        messages.push({
            role: "user",
            content: contentParts
        });
    } else {
        messages.push({ role: "user", content: prompt });
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
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

IMPORTANT:
- Generate a URL-friendly slug from the headline (lowercase, hyphens, 5-8 words max)
- Hook paragraph must be plain text (NO asterisks or markdown formatting)
- Image prompts must follow the PROBLEM → SOLUTION structure:
  * IMAGE 1: Focus on the problem/pain point from the hook (NO product shown unless before/after)
  * IMAGE 2: Show the solution/transformation with the product
- Make images attention-grabbing with dramatic lighting, close-ups, or striking scenarios
- If showing people, specify "Indian household" or "Indian family"
- For before/after scenarios, reference the product: "${productData.title}"

Include 2 detailed DRAMATIC image prompts in the 'image_prompts' array that relate to the hook.
Generate the same JSON structure as before with headline, slug, hook, story, benefits, urgency box, comments (Hinglish), and CTA.
- AUTHOR NAME: Realistic Indian woman's name with abbreviated surname (e.g., "Priya S.")`
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
        const { mode, productUrl, productImages, productDescription, imageUrl, angle } = await request.json();

        console.log('Generating article in mode:', mode, 'with angle:', angle);

        if (!productUrl) {
            return NextResponse.json(
                { success: false, error: 'Product URL is required' },
                { status: 400 }
            );
        }

        let articleData;

        if (mode === 'product') {
            articleData = await generateFromProductLink(productUrl, productImages, productDescription, angle);
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
