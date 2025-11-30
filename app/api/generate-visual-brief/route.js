import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'Image URL is required' },
                { status: 400 }
            );
        }

        console.log('📸 Generating visual brief from ad creative...');

        const completion = await openai.chat.completions.create({
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

        const data = JSON.parse(completion.choices[0].message.content);
        const visualBrief = data.visual_brief || "Ad creative with dramatic composition";

        console.log('✅ Visual Brief Generated:', visualBrief);

        return NextResponse.json({
            success: true,
            visual_brief: visualBrief
        });

    } catch (error) {
        console.error('Visual Brief Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate visual brief' },
            { status: 500 }
        );
    }
}
