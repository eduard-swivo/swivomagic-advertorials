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
- Focus purely on direct-response congruent for cold FB vid ad traffic.
- Focus on old-school direct response, aggressive/grey-hat marketing.
- Be aggressive and clickbaity (but legal).
- Use subjunctive mood (could/may/might) to avoid concrete claims.
- Create urgency and FOMO.
- Target pain points aggressively.
- Use social proof and authority.
- Create desire through storytelling.
- Make it feel like editorial content, not an ad.

STYLE GUIDELINES:
- Write like a real person sharing a discovery.
- Use conversational, relatable language.
- Include specific details and scenarios.
- Build credibility before the pitch.
- Use pattern interrupts.
- Create emotional resonance.
- End with strong, clear CTAs.
- Use formatting to break up text: bullet points, checkmarks (✅), and bold text for emphasis.
- Use emojis sparingly but effectively to draw attention.

LEGAL COMPLIANCE:
- Never make unsubstantiated health claims.
- Use "could", "may", "might" for benefits.
- Include disclaimers where needed.
- Avoid absolute guarantees.
- Don't make income claims.

CRITICAL INSTRUCTION:
- THINK before you start. You should only finish working and submit your final output once you’re confident that an elite-level CRO/copywriter/marketer/designer would be proud of and consider their magnum opus.
- The MAIN FOCUS is direct-response optimized as much as possible for conversions at lowest cost.

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
async function generateImage(prompt, productDescription = '', isImage1 = false, referenceImageUrl = null, allowProductInImage1 = false) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Key is missing');

        // Initialize Google AI with Gemini 3 Pro Image
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhanced prompt for photorealism with Indian context + Product Description Enforcement
        let enhancedPrompt = prompt + " Indian household, Indian people, South Asian setting, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, candid photography, no illustration, no 3d render, no cartoon, no cgi";

        // FORCE CLOTHING VARIETY - Add to beginning of prompt for maximum impact
        const clothingOptions = [
            "woman wearing bright blue solid t-shirt and jeans",
            "woman wearing vibrant green plain salwar kameez (no patterns)",
            "woman wearing simple purple kurti with jeans",
            "woman wearing pink solid color casual dress",
            "woman wearing red saree with simple border"
        ];
        const randomClothing = clothingOptions[Math.floor(Math.random() * clothingOptions.length)];

        // If prompt mentions "woman" or "mother" or "Indian", inject clothing at the START
        if (prompt.toLowerCase().includes('woman') || prompt.toLowerCase().includes('mother') || prompt.toLowerCase().includes('indian')) {
            enhancedPrompt = randomClothing + ", " + enhancedPrompt;
            enhancedPrompt += ". CRITICAL: NO beige clothing, NO tan clothing, NO brown clothing, NO cream clothing, NO khaki, NO earth tones, NO small floral patterns. The woman MUST be wearing the specified bright colored clothing.";
        }

        // AGGRESSIVE NEGATIVE PROMPTS for Image 1 (Problem-only images) - ONLY if product is NOT allowed
        if ((isImage1 && !allowProductInImage1) || prompt.toLowerCase().includes('no product')) {
            enhancedPrompt += ". CRITICAL EXCLUSIONS: absolutely no bottles, no spray bottles, no cleaning products, no containers, no packages, no labels, no branded items, no solutions, no detergents, no cleaners, no supplies, no items on shelves, no items on tables, no items on counters. Focus only on people and environment.";
            console.log('🚫 Added aggressive negative prompts for Image 1');
        }

        let imagePart = null;
        // If we have a reference image and this is NOT the problem image (Image 1), use it
        if (referenceImageUrl && !isImage1) {
            try {
                console.log('🖼️ Fetching reference image for generation:', referenceImageUrl);
                const imgRes = await axios.get(referenceImageUrl, { responseType: 'arraybuffer' });
                const base64 = Buffer.from(imgRes.data).toString('base64');
                const mimeType = imgRes.headers['content-type'] || 'image/jpeg';

                imagePart = {
                    inlineData: {
                        data: base64,
                        mimeType: mimeType
                    }
                };

                enhancedPrompt += " IMPORTANT: Use the provided image as a STRICT visual reference for the product's appearance, packaging, colors, and shape. The product in the generated image MUST look exactly like the reference image.";
            } catch (e) {
                console.error('Failed to fetch reference image:', e.message);
            }
        }

        if (productDescription && !isImage1) {
            enhancedPrompt += `. IMPORTANT PRODUCT DETAILS: ${productDescription}. Ensure the product in the image matches this description EXACTLY.`;
        }

        // Prepare contents
        const parts = [{ text: enhancedPrompt }];
        if (imagePart) {
            parts.push(imagePart);
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

        // Convert to WebP using sharp
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 }) // Optimize quality/size balance
            .toBuffer();

        // Upload to Vercel Blob
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
            const buffer = Buffer.from(imageRes.data);

            // Convert to WebP using sharp
            const webpBuffer = await sharp(buffer)
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

// ... (rest of file until generateFromProductLink)

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

1. HEADLINE: Ultra-aggressive, clickbait-driven headline that STOPS the scroll
   - **CRITICAL**: If a persona/angle is provided, the headline MUST be centered around that specific persona/angle
   - Use proven clickbait formulas that create FOMO, curiosity, and urgency
   - Make it feel like it was written specifically for the target audience
   
   **HEADLINE FORMULAS TO USE:**
   - **Shocking Discovery**: "[Number] [Persona] Discovered This [Price] [Product Category] (What Happened Next Will Shock You)"
   - **Warning/Danger**: "Warning: [Common Action] Could Be [Negative Outcome] (Here's What [Persona] Are Doing Instead)"
   - **Secret Reveal**: "The [Adjective] Secret [Persona] Don't Want You To Know About [Problem]"
   - **Before/After**: "From [Bad State] to [Good State]: How [Number] [Persona] [Achieved Result] With This [Price] [Product]"
   - **Question Hook**: "Why Are [Number]% of [Persona] Switching to This [Price] [Product]? (The Answer Will Surprise You)"
   - **Banned/Censored**: "They Tried to Hide This From [Persona]... But [Number] Women Found Out Anyway"
   - **Time-Sensitive**: "[Number] [Persona] Are Doing This Right Now (And You're Missing Out)"
   
   **EXAMPLES:**
   - For "Busy Mom" persona: "3,847 Indian Moms Are Hiding This ₹699 Bottle From Their Husbands (Here's Why)"
   - For "Health-Conscious" persona: "Warning: Your Cleaning Products May Be Slowly Poisoning Your Family (73% of Indian Homes Affected)"
   - For "Budget-Conscious" persona: "She Spent ₹2,000 on Cleaners Every Month... Until She Found This ₹699 Secret"
   - For "Skeptical" persona: "I Didn't Believe It Either... Until I Saw What Happened After 7 Days"
   - For "Desperate" persona: "After 15 Years of Struggling With [Problem], This ₹699 Solution Changed Everything"

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
   - **CRITICAL**: Do not just write long paragraphs. Break up the text visually.
   - **LISTS**: Include at least one **bulleted list** or **checklist** (using ✅) within the story to highlight key features or "why it works".
   - **EMOJIS**: Use emojis (⚠️, 🛑, ✅, 😱, 👉) to highlight important sections or emotional triggers.
   - Use **bold** for product names, key phrases, and dramatic reveals.
   - Use **bold subheadings** to break up the story (e.g., "**The Turning Point:**", "**Why This ₹699 Cloth Is Viral:**").
   - Use *italics* for asides or parenthetical thoughts.
   - Bold important numbers and prices (e.g., "**₹699**", "**5x its weight**").
   - Keep paragraphs short (2-4 sentences max).
   - Use conversational, punchy language.
   - **CRITICAL: NEVER use em dashes (—). Use regular hyphens (-) or commas instead.**
   
   **DATA VISUALIZATION:**
   - **IF** you mention studies, research, data, statistics, or scientific findings in the story:
     * You MUST flag this by including a special marker: "[INFOGRAPHIC_HERE]"
     * Place this marker immediately after the paragraph that mentions the data/study
     * Example: "According to experts, these substances could lead to microbiome disruption... [INFOGRAPHIC_HERE]"
     * This will trigger the generation of a professional infographic/graph to visualize the data

5. BENEFITS (3-4 items):
   - Each with a catchy, **BOLD** title (e.g., "**Reason #1: It's Not Toxic (But It Works)**")
   - Detailed description of the benefit
   - Use "could", "may", "might" for claims
   - Focus on transformation, not features
   - Bold key phrases and product names in descriptions

6. URGENCY BOX:
   - Title: Limited-time Offer
   - Text: Scarcity, urgency, or social proof

7. CTA TEXT: Action-oriented, benefit-driven button text

8. COMMENTS SECTION (MINIMUM 5 comments, up to 7):
   - **REQUIRED: Generate AT LEAST 5 realistic user comments**
   - Use "Hinglish" style (mix of Hindi and English)
   - Approx 10% Hindi words/phrases, 90% English
   - Examples: 
     * "Bhai, this is amazing! Mujhe bhi order karna hai"
     * "Maine order kiya tha, delivery fast thi. Very happy!"
     * "Iska price kya hai? Looks good"
     * "Yaar, maine try kiya. Works perfectly!"
     * "Kahan se milega? Link do please"
   - Make them sound authentic and varied (some questions, some praise, some sharing experience)
   - TIMESTAMPS: Must be random DAYS apart (e.g., "2 days ago", "5 days ago", "1 week ago", "3 days ago"), NOT minutes or hours.
   - Use realistic Indian names

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
   - **CLOTHING REQUIREMENTS (MANDATORY - DO NOT IGNORE):**
     * **BANNED COLORS**: NO beige, NO tan, NO brown, NO cream, NO khaki, NO earth tones
     * **BANNED PATTERNS**: NO small floral prints, NO traditional paisley patterns
     * **REQUIRED**: Choose ONE of these EXACT clothing descriptions:
       1. "wearing a bright blue solid color t-shirt and jeans"
       2. "wearing a vibrant green salwar kameez (plain, no patterns)"
       3. "wearing a simple purple kurti with jeans"
       4. "wearing a pink casual dress (solid color)"
       5. "wearing a red or orange saree (solid or simple border)"
     * **CRITICAL**: Copy the EXACT clothing description into your image prompt word-for-word
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
  "image_prompts": ["prompt 1", "prompt 2"],
  "infographic_prompt": "detailed prompt for data visualization infographic (ONLY if story mentions studies/data, otherwise set to null)",
  "infographic_paragraph_index": "0-indexed paragraph number where infographic should appear (ONLY if infographic is needed, otherwise set to null)"
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
        model: "gpt-4o",
        messages,
        temperature: 0.9,
        max_tokens: 3000,
        response_format: { type: "json_object" }
    });

    const articleData = JSON.parse(completion.choices[0].message.content);

    // Generate images in parallel
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const imagePromises = articleData.image_prompts.map((prompt, index) =>
            generateImage(
                prompt,
                productDescription,
                index === 0, // isImage1
                index === 1 ? productMainImage : null // Pass productMainImage for Image 2
            )
        );
        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);
    }

    return articleData;
}

// Generate article from ad creative
async function generateFromAdCreative(imageUrl, productUrl, productDescription = null, productMainImage = null, visualBrief = null, persona = null) {
    console.log('🎬 generateFromAdCreative called');
    console.log('Product URL:', productUrl);
    console.log('Has productDescription:', !!productDescription);
    console.log('Has productMainImage:', !!productMainImage);

    const productData = await scrapeProductPage(productUrl);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `** ANALYZE THE UPLOADED AD CREATIVE AND CREATE A MATCHING ADVERTORIAL**

        You are looking at an ad creative image.Your job is to:
    1. ** ANALYZE ** the ad creative's headline, messaging, angle, and emotional tone
    2. ** EXTRACT ** the core problem / pain point being highlighted
    3. ** IDENTIFY ** the promise or transformation being offered
    4. ** CREATE ** a full advertorial that continues this exact narrative

PRODUCT INFO(The Solution):
    - URL: ${productData.url}
    - Title: ${productData.title}
    - Description: ${productData.description}
    - Price: ${productData.price}
${productDescription ? `- Physical Description: "${productDescription}"` : ''}
${persona ? `\n**TARGET PERSONA / ANGLE:**\n"${persona}"\n(Write the entire advertorial specifically for this persona and angle. Adopt the tone, language, and emotional triggers that would resonate most with this specific audience.)` : ''}

** CRITICAL INSTRUCTIONS:**

**HEADLINE & HOOK:**
- **CRITICAL**: The headline MUST be ultra-aggressive, clickbait-driven, and centered around the persona/angle if provided
- The headline should echo or expand on the ad creative's main message BUT filtered through the persona's perspective
- Use proven clickbait formulas that create FOMO, curiosity, and urgency

**HEADLINE FORMULAS TO USE:**
- **Shocking Discovery**: "[Number] [Persona] Discovered This [Price] [Product Category] (What Happened Next Will Shock You)"
- **Warning/Danger**: "Warning: [Common Action] Could Be [Negative Outcome] (Here's What [Persona] Are Doing Instead)"
- **Secret Reveal**: "The [Adjective] Secret [Persona] Don't Want You To Know About [Problem]"
- **Before/After**: "From [Bad State] to [Good State]: How [Number] [Persona] [Achieved Result] With This [Price] [Product]"
- **Question Hook**: "Why Are [Number]% of [Persona] Switching to This [Price] [Product]? (The Answer Will Surprise You)"
- **Banned/Censored**: "They Tried to Hide This From [Persona]... But [Number] Women Found Out Anyway"
- **Time-Sensitive**: "[Number] [Persona] Are Doing This Right Now (And You're Missing Out)"

**EXAMPLES:**
- "3,847 Indian Moms Are Hiding This ₹699 Bottle From Their Husbands (Here's Why)"
- "Warning: Your Cleaning Products May Be Slowly Poisoning Your Family (73% of Indian Homes Affected)"
- "She Spent ₹2,000 on Cleaners Every Month... Until She Found This ₹699 Secret"
- "I Didn't Believe It Either... Until I Saw What Happened After 7 Days"

- The hook should feel like a natural continuation of what the ad promised
- Match the emotional intensity and urgency of the ad

                        ** STORY(EXPANDED - 6 - 9 paragraphs):**
                            - Start with the EXACT problem / pain point shown in the ad creative
                                - Build on the fear, frustration, or desire the ad triggered
                                    - ** EXPAND THE NARRATIVE **: Include 2 - 3 additional paragraphs that provide deeper insights, scientific discoveries(pseudo - science is fine if legal), or surprising facts related to the problem.
- ** REAL LIFE EXAMPLES **: Include specific, relatable examples of how this problem affects daily life(e.g., "I realized my kids were breathing this in..." or "My neighbor actually had to replace her entire...").
- Introduce "${productData.title}" as the solution the ad was hinting at
        - Use the same tone(scientific, emotional, urgent, etc.) as the ad
            - If the ad mentions specific dangers, statistics, or claims, reference them in the story

                ** IMAGE GENERATION:**
- ** IMAGE 1(HERO) **: Based on the HOOK / TITLE you generated from the ad creative
        * The hook / title describes the PROBLEM - Image 1 must visualize ONLY that problem
            * ** CRITICAL PROHIBITION - Image 1 must NOT contain:**
                - NO product bottles, containers, or packaging
                    - NO cleaning supplies or solutions
                        - NO branded items or product names
                            - NO "after" scenes or solutions
                                * ** ONLY SHOW **: The danger, fear, problem, or emotional pain from the hook / title
                                    * Examples:
    - If hook is "The Silent Danger Lurking in Your Home" → Image 1 = "Worried Indian family in dimly lit home with toxic warning symbols on walls, child coughing, NO products visible"
        - If hook is "Why Indian Mothers Are Switching" → Image 1 = "Frustrated Indian mother looking at messy kitchen, exhausted expression, NO cleaning products visible"
            - If hook is "Scientists Discover Hidden Toxins" → Image 1 = "Indian household with danger/radiation symbols, concerned parents, NO products visible"

                - ** IMAGE 2 **: Show the SOLUTION with the actual product
                    * Show "${productData.title}" as the answer to the problem from the ad
                        * Show relief, transformation, or safety WITH the product
  ${productMainImage ? '* **CRITICAL: Base the product appearance on the MAIN PRODUCT IMAGE provided. Match it exactly.**' : ''}

**CLOTHING REQUIREMENTS (MANDATORY - DO NOT IGNORE):**
  * **BANNED COLORS**: NO beige, NO tan, NO brown, NO cream, NO khaki, NO earth tones
  * **BANNED PATTERNS**: NO small floral prints, NO traditional paisley patterns
  * **REQUIRED**: Choose ONE of these EXACT clothing descriptions:
    1. "wearing a bright blue solid color t-shirt and jeans"
    2. "wearing a vibrant green salwar kameez (plain, no patterns)"
    3. "wearing a simple purple kurti with jeans"
    4. "wearing a pink casual dress (solid color)"
    5. "wearing a red or orange saree (solid or simple border)"
  * **CRITICAL**: Copy the EXACT clothing description into your image prompt word-for-word


** FORMATTING:**
        - Generate a URL - friendly slug from the headline(lowercase, hyphens, 5 - 8 words max)
            - Hook paragraph must be plain text(NO asterisks or markdown formatting)
                - ** STORY FORMATTING **:
  * ** LISTS **: You MUST include a ** bulleted list ** or ** checklist ** (✅) in the story to break up the text.
  * ** EMOJIS **: Use emojis(⚠️, 🛑, ✅, 😱) to highlight key points.
  * ** BOLD **: Use ** bold ** for key phrases, emotional triggers, and product names.
- ** CRITICAL: NEVER use em dashes(—).Use regular hyphens(-) or commas instead.**
        - Keep paragraphs short(2 - 4 sentences)
            - Use conversational language


                ** COMMENTS:**
- ** REQUIRED: Generate AT LEAST 5 realistic user comments(up to 7) **
        - Use Hinglish style(10 % Hindi, 90 % English)
            - Examples: "Bhai, this is amazing! Mujhe bhi order karna hai", "Maine order kiya tha, delivery fast thi. Very happy!", "Iska price kya hai? Looks good"
                - Timestamps must be random DAYS apart(e.g., "2 days ago", "5 days ago", "1 week ago", "3 days ago")
                    - Make them sound authentic and varied(questions, praise, experiences)
                        - Use realistic Indian names


                            ** AUTHOR:**
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
                                            { "title": "Benefit 1", "description": "details" },
                                            { "title": "Benefit 2", "description": "details" }
                                        ],
                                            "urgency_box": {
            "title": "urgency title",
                "text": "urgency text"
        },
        "comments": [
            { "name": "User Name", "text": "Comment text here", "time": "2 days ago" }
        ],
            "cta_text": "CTA BUTTON TEXT >>",
                "image_prompts": ["prompt 1", "prompt 2"]
    } `
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

    // POST-PROCESSING: Use regenerate API's proven approach for Image 1
    // Instead of trusting the AI's image prompts, regenerate them using the working method
    if (visualBrief) {
        console.log('✅ Using provided VISUAL BRIEF for Image 1');
        if (!articleData.image_prompts) articleData.image_prompts = ["", ""];

        // Use the visual brief for Image 1
        articleData.image_prompts[0] = visualBrief;

        // We still need to ensure Image 2 is good. 
        // If the initial generation didn't give a good Image 2, we might want to regenerate it.
        // But for now, let's assume the initial generation gave a decent Image 2 prompt, 
        // or we can trigger the regeneration ONLY for Image 2 if we really wanted to, but that's complex.
        // Let's just trust the initial Image 2 or the one from the regeneration block below if we decide to run it.

        // Actually, if we have a visual brief, we should probably SKIP the regeneration block for Image 1,
        // but we might still want the "proven method" for Image 2 if the initial one was bad.
        // However, the regeneration block generates BOTH.

        // Strategy: Run the regeneration block to get a good Image 2 (and a backup Image 1),
        // then OVERWRITE Image 1 with the visual brief.
    }

    if (articleData.hook) {
        console.log('🔄 Regenerating image prompts using proven method...');

        try {
            // Use the EXACT same approach as /api/regenerate-images which works perfectly
            const imageSystemPrompt = `You are an expert art director.Create 2 distinct, dramatic image prompts based on the provided hook and product info.

        STRUCTURE:
    - Image 1: THE PROBLEM(Pain point, frustration, mess - NO product)
        - Image 2: THE SOLUTION(Transformation, product in action, before / after)

    CONTEXT:
    - Product: ${productData.title}
${productDescription ? `- Physical Description: "${productDescription}" (Adhere strictly to this)` : ''}
    - Setting: Indian household
        - Style: Photorealistic, dramatic lighting, candid

${productMainImage ? 'IMPORTANT: You have seen the product main image. Describe the product accurately in Image 2.' : ''}

Return ONLY a JSON array of 2 strings: ["prompt 1", "prompt 2"]`;

            const imageUserPrompt = `HOOK: "${articleData.hook}"`;

            const imageCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
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

    // OVERRIDE Image 1 with Visual Brief if provided (doing it AFTER regeneration to ensure it takes precedence)
    if (visualBrief && articleData.image_prompts && articleData.image_prompts.length > 0) {
        console.log('🚀 OVERRIDING Image 1 with Visual Brief');
        articleData.image_prompts[0] = visualBrief;
    }

    // FINAL SAFETY CHECK: Scan Image 1 for product keywords and force override if found
    // BUT: Skip this check if a visual brief was provided by the user
    if (!visualBrief && articleData.image_prompts && articleData.image_prompts.length > 0) {
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

    // Generate images in parallel with isImage1 flag
    if (articleData.image_prompts && articleData.image_prompts.length > 0) {
        const imagePromises = articleData.image_prompts.map((prompt, index) =>
            generateImage(
                prompt,
                productDescription,
                index === 0, // isImage1
                index === 1 ? productMainImage : null, // Pass productMainImage for Image 2
                !!visualBrief // allowProductInImage1: true if visualBrief exists
            )
        );
        const images = await Promise.all(imagePromises);
        articleData.generated_images = images.filter(img => img !== null);
    }

    return articleData;
}

// API Route Handler
export async function POST(request) {
    try {
        const { mode, productUrl, productImages, productDescription, productMainImage, imageUrl, angle, visualBrief, persona } = await request.json();

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
            articleData = await generateFromAdCreative(imageUrl, productUrl, productDescription, productMainImage, visualBrief, persona);
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
