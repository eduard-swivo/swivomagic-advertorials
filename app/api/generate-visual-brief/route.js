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
                    content: "You are an expert visual analyst. Analyze the uploaded ad creative and describe its visual composition in detail. Focus ONLY on visual elements: composition, colors, lighting, mood, setting, people, objects, and overall aesthetic. Do NOT describe any text, headlines, buttons, or call-to-actions. Your description will be used to create a similar image without any text overlays."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this ad creative and provide a detailed visual brief describing:
- Overall composition and framing
- Color palette and lighting
- Setting/environment (e.g., home, kitchen, outdoor)
- People (if any): their expressions, actions, emotions
- Key objects or focal points (excluding text/buttons)
- Mood and atmosphere
- Photography style (candid, professional, dramatic, etc.)

Describe what you see visually so that someone could recreate a similar image WITHOUT any text, captions, or call-to-action buttons.

Return ONLY a JSON object with this format:
{
  "visual_brief": "Detailed visual description here"
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
