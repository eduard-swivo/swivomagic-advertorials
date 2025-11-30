import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { put } from '@vercel/blob';
import sharp from 'sharp';

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
async function generateImage(prompt, productDescription = '', isImage1 = false, referenceImages = null) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Key is missing');

        // Initialize Google AI with Gemini 3 Pro Image
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhanced prompt for photorealism with Indian context + Product Description Enforcement
        let enhancedPrompt = prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi";

        // Note: Removed aggressive negative prompts - now following visual brief exactly
        // The visual brief should already describe what to include/exclude

        if (productDescription && !isImage1) {
            enhancedPrompt += `. IMPORTANT PRODUCT DETAILS: ${productDescription}. Ensure the product in the image matches this description EXACTLY.`;
        }

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
            contents: [{
                role: 'user',
                parts: parts
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

        // Convert to WebP using Sharp
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Vercel Blob as WebP
        const filename = `ai-generated-${Date.now()}.webp`;
        const blob = await put(filename, webpBuffer, {
            access: 'public',
            contentType: 'image/webp'
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
            console.error('DALL-E 3 fallback error:', dalleError);
            return null;
        }
    }
}

// Generate article from product link
// Generate article from product link
async function generateFromProductLink(productUrl, productImages = null, productDescription = null, angle = 'before-after', productMainImage = null) {
    const productData = await scrapeProductPage(productUrl);

    // Build the prompt with product image context if available
    let promptAddition = '';

    if (productDescription) {
        promptAddition += `\n\nPHYSICAL PRODUCT DESCRIPTION: "${productDescription}"\n(Use this EXACT description for all visual details in the story and image prompts. Do not hallucinate colors or features.)`;
    }

    if (productMainImage) {
        promptAddition += `\n\n**PRODUCT MAIN IMAGE PROVIDED**: You have access to the main product image. For IMAGE 2, you MUST base the product appearance on this exact image. Describe the product as it appears in the main image with precise visual details.`;
    }

    if (productImages && productImages.length > 0) {
        promptAddition += `\n\nADDITIONAL PRODUCT IMAGES: You have access to ${productImages.length} additional product image(s). Use them for context.`;
    }

    // Angle Instructions
    const angleInstructions = {
        'in-use': "ANGLE: Product In Use. Focus on the MECHANISM and ACTION. The story should describe exactly how the product works. Image 1: Show the problem in action. Image 2: Show the product being used and working perfectly.",
        'before': "ANGLE: The Before. Focus on the PAIN POINT and FRUSTRATION. The story should dwell on the struggle before finding the solution. Image 1: A dramatic, high-emotion shot of ONLY the problem (mess, pain, frustration) - ABSOLUTELY NO PRODUCTS OR SOLUTIONS VISIBLE. Image 2: The relief of finding the solution.",
        'before-after': "ANGLE: Before & After. Focus on the TRANSFORMATION. The story should contrast the 'old way' vs the 'new way'. Image 1: Split screen showing the problem (left) and the result (right). Image 2: The product sitting next to the perfect result.",
        'in-hand': "ANGLE: Product In Hand. Focus on the DISCOVERY and the OBJECT. The story should feel like a personal review of a new gadget. Image 1: Holding the product in hand, showing its size/quality. Image 2: The product in its environment.",
        'story': "ANGLE: Story Related. Focus on the NARRATIVE and EMOTION. The story should be about a person (e.g., grandmother, busy mom) and their journey. Image 1: An emotional shot related to the story (e.g., tired mom, struggling person) - NO PRODUCTS VISIBLE, ONLY THE EMOTIONAL SITUATION. Image 2: Happy family/person using the product.",
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
   - **CRITICAL: NEVER use em dashes (—). Use regular hyphens (-) or commas instead.**

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

8. COMMENTS SECTION (Generate 5-10 random comments):
   - Create between 5 and 10 realistic user comments (random number each time)
   - Use "Hinglish" style (mix of Hindi and English)
   - Approx 10% Hindi words/phrases, 90% English
   - Examples: "Bhai, this is amazing", "Maine order kiya tha, delivery fast thi", "Iska price kya hai?"
   - Make them sound authentic and varied (some questions, some praise, some testimonials)
   - TIMESTAMPS: Must be random DAYS apart, spread across 1-14 days
   - Use varied formats: "2 days ago", "5 days ago", "1 week ago", "3 days ago", "10 days ago", "2 weeks ago"
   - Each comment should have a DIFFERENT timestamp
   - Sort comments by recency (most recent first)

9. HERO IMAGE PROMPTS: Create 2 DRAMATIC, attention-grabbing image prompts that DIRECTLY relate to the selected ANGLE (${angle}).
   
   **IMAGE 1 (HERO IMAGE):**
   - Follow the instruction: "${selectedAngleInstruction.split('Image 1: ')[1].split(' Image 2:')[0]}"
   - Make it relatable and dramatic
   ${['before-after', 'in-use', 'in-hand', 'after'].includes(angle)
            ? `- For this angle (${angle}), you MAY show the product as specified in the angle instruction`
            : `- **CRITICAL PROHIBITION: Image 1 must NOT contain:**
     * NO product bottles, containers, or packaging
     * NO cleaning supplies or tools
     * NO branded items or product names
     * NO solutions of any kind
   - **ONLY SHOW: The problem, mess, frustration, or emotional pain**
   - Focus on the person's frustration and the messy/problematic situation ONLY`}
   - Show the emotional impact ${['before-after', 'in-use', 'in-hand', 'after'].includes(angle) ? 'and/or the product in action' : '(frustrated person, messy situation, etc.)'}
   ${!['before-after', 'in-use', 'in-hand', 'after'].includes(angle) ? `- CORRECT Example: "Close-up of exhausted Indian woman with head in hands, looking at dirty kitchen counter covered in stains and spills"
   - WRONG Example: "Woman with cleaning products" (NO! No products in Image 1!)` : ''}
   
   **IMAGE 2 - SOLUTION/PRODUCT:**
   - Follow the instruction: "${selectedAngleInstruction.split('Image 2: ')[1]}"
   - Reference the actual product: "${productData.title}"
   ${productMainImage ? '- **CRITICAL: You have seen the MAIN PRODUCT IMAGE. Describe the product in Image 2 EXACTLY as it appears in that main image. Match colors, shape, size, packaging, and all visual details precisely.**' : ''}
   - This is where you show the product and the solution
   
   **GENERAL RULES:**
   - IMPORTANT: If showing people, specify "Indian household" or "Indian family"
   - Use dramatic lighting, close-ups, or striking scenarios
   ${productMainImage || (productImages && productImages.length > 0) ? '- You have seen the product image(s), so describe the product accurately in the prompts' : ''}
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

    // Prioritize productMainImage, then add additional productImages
    const allImages = [];
    if (productMainImage) allImages.push(productMainImage);
    if (productImages && productImages.length > 0) allImages.push(...productImages);

    if (allImages.length > 0) {
        const contentParts = [{ type: "text", text: prompt }];

        // Add all product images to the content
        allImages.forEach(imageData => {
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
        // Prepare reference images for Image 2
        const image2Refs = [];
        if (productMainImage) image2Refs.push(productMainImage);
        if (productImages && Array.isArray(productImages)) image2Refs.push(...productImages);

        const imagePromises = articleData.image_prompts.map((prompt, index) =>
            generateImage(
                prompt,
                productDescription,
                index === 0, // isImage1
                index === 1 ? image2Refs : null // Pass all reference images for Image 2
            )
        );
        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);
    }

    return articleData;
}

// Generate article from ad creative
async function generateFromAdCreative(imageUrl, productUrl, productDescription = null, productMainImage = null, visualBrief = null) {
    console.log('🎬 generateFromAdCreative called');
    console.log('Product URL:', productUrl);
    console.log('Has productDescription:', !!productDescription);
    console.log('Has productMainImage:', !!productMainImage);
    console.log('Has visualBrief:', !!visualBrief);

    const productData = await scrapeProductPage(productUrl);

    // If no visual brief provided, generate one
    if (!visualBrief) {
        console.log('📸 No visual brief provided, generating one...');
        const visualBriefCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert visual analyst specializing in extracting the PHOTOGRAPHIC ESSENCE of images.

Your task: Describe the underlying photographic scene and mood, NOT the marketing elements.

FOCUS ON:
- Real photographic setting (home, kitchen, living room, etc.)
- Real people: their genuine expressions, emotions, body language
- Lighting style (natural, dramatic, soft, harsh, etc.)
- Camera angle and composition (close-up, wide shot, eye-level, etc.)
- Color mood (warm tones, cool tones, muted, vibrant)
- Atmosphere and emotional tone (worried, happy, tense, calm)
- Photography style (candid, professional, documentary, etc.)

IGNORE COMPLETELY:
- Product bottles, packages, or branded items
- Graphic overlays, illustrations, or stylized elements
- Text, headlines, buttons, or CTAs
- Warning symbols, icons, or infographics
- Any marketing or advertising elements
- Transparent figures or anatomical diagrams

EXAMPLE:
Bad: "Cluttered countertop with cleaning bottles, graphic overlays of people with anatomical features"
Good: "Warm-lit Indian kitchen with concerned family members, natural window light, close-up composition, serious expressions, documentary-style photography"

Your description will be used to create a REAL PHOTOGRAPH with similar mood and composition.`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Look past the marketing elements and describe the PHOTOGRAPHIC SCENE:

1. What is the REAL setting? (Ignore products/graphics, focus on the environment)
2. Are there REAL PEOPLE visible? (Not graphic overlays - actual photographed people)
   - What are their expressions and emotions?
   - What is their body language?
3. What is the LIGHTING like? (Natural, dramatic, soft, etc.)
4. What is the CAMERA COMPOSITION? (Close-up, wide, angle, framing)
5. What is the COLOR MOOD? (Warm, cool, muted, vibrant)
6. What is the EMOTIONAL ATMOSPHERE? (Worried, tense, happy, calm)
7. What PHOTOGRAPHY STYLE does it use? (Candid, professional, documentary)

Describe this as if you're directing a photographer to recreate the SCENE (not the ad).

Return ONLY a JSON object:
{
  "visual_brief": "Concise photographic description focusing on real scene, people, lighting, mood, and composition - NO products or graphics"
}`
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageUrl }
                        }
                    ]
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const visualBriefData = JSON.parse(visualBriefCompletion.choices[0].message.content);
        visualBrief = visualBriefData.visual_brief || "Ad creative with dramatic composition";
        console.log('✅ Visual Brief Generated:', visualBrief);
    } else {
        console.log('✅ Using provided visual brief:', visualBrief);
    }

    // STEP 2: Generate the advertorial content based on the ad creative
    console.log('📝 Generating advertorial content...');

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `**ANALYZE THE UPLOADED AD CREATIVE AND CREATE A MATCHING ADVERTORIAL**

You are looking at an ad creative image. Your job is to:
1. **ANALYZE** the ad creative's headline, messaging, angle, and emotional tone
2. **EXTRACT** the core problem/pain point being highlighted
3. **IDENTIFY** the promise or transformation being offered
4. **CREATE** a full advertorial that continues this exact narrative

PRODUCT INFO (The Solution):
- URL: ${productData.url}
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price}
${productDescription ? `- Physical Description: "${productDescription}"` : ''}

**CRITICAL INSTRUCTIONS:**

**HEADLINE & HOOK:**
- The headline should echo or expand on the ad creative's main message
- The hook should feel like a natural continuation of what the ad promised
- Match the emotional intensity and urgency of the ad

**STORY:**
- Start with the EXACT problem/pain point shown in the ad creative
- Build on the fear, frustration, or desire the ad triggered
- Introduce "${productData.title}" as the solution the ad was hinting at
- Use the same tone (scientific, emotional, urgent, etc.) as the ad
- If the ad mentions specific dangers, statistics, or claims, reference them in the story

**IMAGE GENERATION:**
- **IMAGE 1 (HERO)**: Based on the HOOK/TITLE you generated from the ad creative
  * The hook/title describes the PROBLEM - Image 1 must visualize ONLY that problem
  * **CRITICAL PROHIBITION - Image 1 must NOT contain:**
    - NO product bottles, containers, or packaging
    - NO cleaning supplies or solutions
    - NO branded items or product names
    - NO "after" scenes or solutions
  * **ONLY SHOW**: The danger, fear, problem, or emotional pain from the hook/title
  * Examples:
    - If hook is "The Silent Danger Lurking in Your Home" → Image 1 = "Worried Indian family in dimly lit home with toxic warning symbols on walls, child coughing, NO products visible"
    - If hook is "Why Indian Mothers Are Switching" → Image 1 = "Frustrated Indian mother looking at messy kitchen, exhausted expression, NO cleaning products visible"
    - If hook is "Scientists Discover Hidden Toxins" → Image 1 = "Indian household with danger/radiation symbols, concerned parents, NO products visible"

- **IMAGE 2**: Show the SOLUTION with the actual product
  * Show "${productData.title}" as the answer to the problem from the ad
  ${productMainImage ? '* **CRITICAL: Base the product appearance on the MAIN PRODUCT IMAGE provided. Match it exactly.**' : ''}
  * Show relief, transformation, or safety WITH the product

**FORMATTING:**
- Generate a URL-friendly slug from the headline (lowercase, hyphens, 5-8 words max)
- Hook paragraph must be plain text (NO asterisks or markdown formatting)
- **CRITICAL: NEVER use em dashes (—). Use regular hyphens (-) or commas instead.**
- Use **bold** for product names and key phrases in the story
- Keep paragraphs short (2-4 sentences)
- Use conversational language

**COMMENTS:**
- Create 5-10 Hinglish comments (random number, 10% Hindi, 90% English)
- Timestamps must be random DAYS apart, spread across 1-14 days
- Use varied formats: "2 days ago", "5 days ago", "1 week ago", "3 days ago", "10 days ago", "2 weeks ago"
- Each comment should have a DIFFERENT timestamp
- Make them sound authentic (questions, praise, testimonials)
- Sort by recency (most recent first)

**AUTHOR:**
- Realistic Indian woman's name with abbreviated surname (e.g., "Priya S.")

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
}`
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

    // NOTE: Skipping the post-processing regeneration step because we're using the visual brief
    // directly for Image 1. The visual brief approach is more accurate for matching the ad creative.

    // POST-PROCESSING: Use regenerate API's proven approach for Image 1
    // DISABLED: This was overriding the visual brief. We now use visual brief directly.
    /*
    if (articleData.hook) {
        console.log('🔄 Regenerating image prompts using proven method...');

        try {
            // Use the EXACT same approach as /api/regenerate-images which works perfectly
            const imageSystemPrompt = `You are an expert art director. Create 2 distinct, dramatic image prompts based on the provided hook and product info.
        
STRUCTURE:
- Image 1: THE PROBLEM (Pain point, frustration, mess - NO product)
- Image 2: THE SOLUTION (Transformation, product in action, before/after)

CONTEXT:
- Product: ${productData.title}
${productDescription ? `- Physical Description: "${productDescription}" (Adhere strictly to this)` : ''}
- Setting: Indian household
- Style: Photorealistic, dramatic lighting, candid

${productMainImage ? 'IMPORTANT: You have seen the product main image. Describe the product accurately in Image 2.' : ''}

Return ONLY a JSON array of 2 strings: ["prompt 1", "prompt 2"]`;

            const imageUserPrompt = `HOOK: "${articleData.hook}"`;

            const imageCompletion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: imageSystemPrompt },
                    { role: "user", content: imageUserPrompt }
                ],
                temperature: 0.9,
                max_tokens: 500,
            });

            let regeneratedPrompts;
            try {
                regeneratedPrompts = JSON.parse(imageCompletion.choices[0].message.content);
            } catch (e) {
                // Fallback parsing
                const content = imageCompletion.choices[0].message.content;
                const match = content.match(/\[.*\]/s);
                if (match) {
                    regeneratedPrompts = JSON.parse(match[0]);
                }
            }

            if (regeneratedPrompts && regeneratedPrompts.length >= 2) {
                articleData.image_prompts = regeneratedPrompts;
                console.log('✅ Successfully regenerated image prompts using proven method');
                console.log('Image 1 (Problem):', regeneratedPrompts[0]);
                console.log('Image 2 (Solution):', regeneratedPrompts[1]);
            }
        } catch (error) {
            console.error('Error regenerating prompts:', error);
            // Fall back to original prompts if regeneration fails
        }
    }
    */

    // FINAL SAFETY CHECK: Scan Image 1 for product keywords and force override if found
    // DISABLED: Not needed when using visual brief approach
    /*
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const image1 = articleData.image_prompts[0].toLowerCase();
        const productKeywords = ['bottle', 'product', 'cleaning', 'spray', 'container', 'package', 'shelf', 'label', 'brand', 'solution', 'detergent', 'cleaner', 'supplies'];
        const hasProduct = productKeywords.some(kw => image1.includes(kw));

        if (hasProduct) {
            console.warn('⚠️ FINAL CHECK: Image 1 still contains products! Force overriding...');
            console.warn('Problematic prompt:', articleData.image_prompts[0]);

            // Nuclear option: hardcoded problem-only prompt
            articleData.image_prompts[0] = 'Close-up of worried Indian family in their living room, concerned and fearful expressions, looking around their home with anxiety. Dimly lit room with ominous shadows. Subtle danger symbols visible (warning icons, hazard signs). Child appearing unwell, parents with protective body language. Dramatic lighting emphasizing hidden threat and danger. Photorealistic, emotional, candid photography. NO products, NO bottles, NO cleaning supplies, NO items visible.';

            console.log('✅ FORCED OVERRIDE: Replaced with problem-only prompt');
        }
    }
    */

    // Generate images with visual brief for Image 1
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const image2Refs = [];
        if (productMainImage) image2Refs.push(productMainImage);

        // For Image 1 (Hero): Use the visual brief to create a similar image without text
        const heroImagePrompt = `${visualBrief}. Create a similar image with the same composition, mood, lighting, and visual style. Indian household setting. CRITICAL: Do NOT include any text overlays, captions, headlines, buttons, or call-to-action elements. Focus purely on the visual scene, people, emotions, and environment. Photorealistic, candid photography, dramatic lighting.`;

        console.log('🎨 Image 1 (Hero) - Using Visual Brief:', heroImagePrompt);
        console.log('🎨 Image 2 (Solution) - Using AI Prompt:', articleData.image_prompts[1]);

        // Generate both images
        const imagePromises = [
            // Image 1: Based on visual brief (no text/CTAs)
            generateImage(
                heroImagePrompt,
                productDescription,
                true, // isImage1
                null
            ),
            // Image 2: Based on AI-generated solution prompt
            generateImage(
                articleData.image_prompts[1] || articleData.image_prompts[0],
                productDescription,
                false, // isImage1
                image2Refs // Pass reference images for Image 2
            )
        ];

        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);

        // Store the visual brief in the article data for reference
        articleData.visual_brief = visualBrief;
    }

    return articleData;
}

// API Route Handler
export async function POST(request) {
    try {
        const { mode, productUrl, productImages, productDescription, productMainImage, imageUrl, angle, visualBrief } = await request.json();

        console.log('Generating article in mode:', mode, 'with angle:', angle);

        if (!productUrl) {
            return NextResponse.json(
                { success: false, error: 'Product URL is required' },
                { status: 400 }
            );
        }

        let articleData;

        if (mode === 'product') {
            articleData = await generateFromProductLink(productUrl, productImages, productDescription, angle, productMainImage);
        } else if (mode === 'creative') {
            if (!imageUrl) {
                return NextResponse.json(
                    { success: false, error: 'Image URL is required for creative mode' },
                    { status: 400 }
                );
            }
            articleData = await generateFromAdCreative(imageUrl, productUrl, productDescription, productMainImage, visualBrief);
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
