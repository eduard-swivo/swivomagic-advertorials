import { NextResponse } from 'next/server';
import { createArticle } from '@/lib/db';

// Migration data for all 5 existing articles
const articlesToMigrate = [
    {
        slug: 'diwali-cleaning',
        title: 'Throw Away Your Old Newspapers. How Indian Moms Are Cleaning Glass & Mirrors For Just ₹699.',
        category: 'Lifestyle',
        author: 'Anjali S.',
        published_date: 'October 26, 2025',
        excerpt: 'Streaks, lint, and chemical smells used to be the price of a clean home. This "Just Add Water" cloth changed everything.',
        hero_image: '/images/diwali-hero.webp',
        advertorial_label: 'DIWALI CLEANING SPECIAL',
        hook: 'Streaks, lint, and chemical smells used to be the price of a clean home. This "Just Add Water" cloth changed everything.',
        story: [
            'We all know the Diwali Cleaning routine.',
            'You spray the mirror with that blue liquid. You scrub it with a newspaper (because grandma said it works best). But when you step back?',
            'Streaks.',
            'And black ink on your hands. And tiny bits of paper or lint stuck to the corners. It\'s frustrating. You wipe it again, and it just smears the grease around.',
            'I was complaining about this to my sister-in-law, and she laughed. "You are still using spray? Just use the Magic Cloth."',
            'She handed me a Swivo Magic Cloth. No spray bottle. Just the cloth, wet with tap water.',
            'I tried it on my dressing table mirror.',
            'Wipe. Dry. Done.',
            'I waited for the water marks to appear as it dried. They never did. It was crystal clear.'
        ],
        benefits: [
            {
                title: 'Save Money (It\'s Only ₹699)',
                description: 'You don\'t need Colin or harsh ammonias. The "Fish-Scale" weave acts like tiny scrapers that lift oil and dirt using just water. It saves you hundreds of Rupees on supplies every month.'
            },
            {
                title: 'The "Lint-Free" Promise',
                description: 'Cotton rags leave tiny threads everywhere. This cloth is tightly woven. I used it on my black granite kitchen counter and my TV screen—zero dust left behind.'
            },
            {
                title: 'Tough on Indian Kitchen Grease',
                description: 'I thought it was just for glass, but it removed the "Haldi" stain and oil splashes from my kitchen tiles effortlessly.'
            }
        ],
        urgency_box: {
            title: 'Get It Before The Festival Rush.',
            text: 'Inventory is flying off the shelves as people prepare for guests. At just ₹699, it\'s cheaper than a bottle of cleaning spray and lasts for years. Don\'t be stuck scrubbing mirrors with newspaper this year.'
        },
        cta_link: 'https://swivomagic.com/pages/diwali-special',
        cta_text: 'CLAIM 50% OFF DIWALI SALE >>',
        published: true
    },
    {
        slug: 'the-motorist',
        title: 'Stop Letting The "Daily Wash Guy" Ruin Your Windshield. The ₹699 Switch That Gives A Showroom Shine.',
        category: 'Lifestyle',
        author: 'Vikram R.',
        published_date: 'October 25, 2025',
        excerpt: 'Tired of hazy windshields at night and water spots on your paint? It\'s not your soap. It\'s your cloth.',
        hero_image: '/images/motorist-hero.jpg',
        advertorial_label: 'AUTO MAINTENANCE HACK • 2 MIN READ',
        hook: 'Tired of hazy windshields at night and water spots on your paint? It\'s not your soap. It\'s your cloth.',
        story: [
            'If you own a car in India, you know the struggle.',
            'You pay a guy to wash your car every morning. But when you drive at night, the oncoming headlights glare across your windshield. It\'s hazy. It\'s dangerous.',
            'Or, you wash the car yourself on Sunday. You scrub it, rinse it, and dry it with an old t-shirt. But ten minutes later, as the sun hits it, you see them: Nasty white water spots and tiny scratches.',
            'I used to think I needed expensive ceramic coatings.',
            'Then my mechanic told me: "Sir, it\'s not the polish. It\'s the rag. You are pushing dirt around, not lifting it."',
            'He tossed me a grey, strange-looking cloth. It felt different—thick, but grippy.',
            'It was the Swivo Magic Cloth.'
        ],
        benefits: [
            {
                title: 'The "Zero-Streak" Glass Hack',
                description: 'This is the biggest game-changer. I dipped it in plain water, wrung it out tight, and wiped my windshield. One swipe. No soap. No glass cleaner spray. The glass didn\'t just look clean; it disappeared. No haze, no streaks, no lint.'
            },
            {
                title: 'It Drinks Water Like a Camel',
                description: 'Standard cotton rags just push water around. This "thickened" microfiber absorbs up to 5x its weight. I dried my entire bonnet without wringing it out once.'
            },
            {
                title: 'No More "Micro-Scratches"',
                description: 'The cloth has a unique fiber structure (they call it a "fish scale" design) that traps dust inside the cloth rather than dragging it across your paint.'
            }
        ],
        urgency_box: {
            title: 'The Verdict',
            text: 'Your car cost Lakhs. Don\'t ruin the finish with a Rs. 20 rag. For just ₹699, you can get that showroom shine every single morning.'
        },
        cta_link: 'https://swivomagic.com/pages/adv-motorists',
        cta_text: 'CHECK AVAILABILITY FOR CAR OWNERS >>',
        published: true
    },
    {
        slug: 'the-smart-switch',
        title: '3 Reasons Why Smart Homeowners Are Ditching Chemical Sprays For This New "Just Add Water" Hack.',
        category: 'Lifestyle',
        author: 'Priya Sharma',
        published_date: 'October 24, 2025',
        excerpt: 'If you own an SUV or Sedan in India, you know the struggle: One day after a wash, it\'s covered in dust again.',
        hero_image: '/images/kit-shot.png',
        advertorial_label: 'HOME CLEANING HACK',
        hook: 'Chemical sprays promise a sparkling home, but at what cost? This simple switch is changing everything.',
        story: [
            'If you own an SUV or Sedan in India, you know the struggle: One day after a wash, it\'s covered in dust again.',
            'The same goes for your home. You clean the windows, and within hours, dust settles back.',
            'Most people reach for chemical sprays. But smart homeowners are making a different choice.'
        ],
        benefits: [
            {
                title: 'No Harsh Chemicals',
                description: 'Just water. No fumes, no residue, no toxic ingredients. Safe for kids and pets.'
            },
            {
                title: 'Saves Money',
                description: 'One cloth replaces dozens of spray bottles. Pay once, use for years.'
            },
            {
                title: 'Better Results',
                description: 'Microfiber technology lifts dirt at the microscopic level. Cleaner than any spray.'
            }
        ],
        urgency_box: {
            title: 'Make The Smart Switch',
            text: 'Join thousands of homeowners who\'ve ditched chemicals for good. Your family deserves better.'
        },
        cta_link: 'https://swivomagic.com/pages/home-cleaning',
        cta_text: 'GET YOUR CLEANING KIT >>',
        published: true
    },
    {
        slug: 'the-protector',
        title: 'WARNING: If You Have Pets Or Toddlers, Stop Mopping Your Floors Until You Read This.',
        category: 'Health & Family',
        author: 'Anjali Gupta',
        published_date: 'October 22, 2025',
        excerpt: 'If you have pets or toddlers, you need to read this before cleaning your floors again.',
        hero_image: '/images/lifestyle-shot.png',
        advertorial_label: 'FAMILY SAFETY ALERT',
        hook: 'If you have pets or toddlers, you need to read this before cleaning your floors again.',
        story: [
            'My daughter is 2 years old. She crawls everywhere.',
            'One day, I mopped the floor with my usual cleaner. Within minutes, she was licking her hands.',
            'I panicked. What chemicals had she just ingested?',
            'That\'s when I realized: if it\'s not safe to lick, why is it on my floor?',
            'I switched to water-only cleaning with microfiber. No more worries.'
        ],
        benefits: [
            {
                title: 'Zero Toxic Residue',
                description: 'Your toddler can crawl, your pet can walk—no chemical residue left behind.'
            },
            {
                title: 'Actually Cleaner',
                description: 'Microfiber removes 99% of bacteria with just water. Chemicals can\'t compete.'
            },
            {
                title: 'Peace of Mind',
                description: 'Clean floors without the guilt. Your family\'s health comes first.'
            }
        ],
        urgency_box: {
            title: 'Protect Your Family Today',
            text: 'Every day you wait is another day your loved ones are exposed to unnecessary chemicals.'
        },
        cta_link: 'https://swivomagic.com/pages/family-safe',
        cta_text: 'PROTECT YOUR FAMILY >>',
        published: true
    },
    {
        slug: 'story-health',
        title: 'Is Your "Clean" Home Actually Making You Sick? Why Homeowners Are Throwing Out Bleach For This "Ancient" Secret.',
        category: 'Health & Family',
        author: 'Meera Patel',
        published_date: 'October 20, 2025',
        excerpt: 'Every time I cleaned, my skin would burn. The fumes made me cough. Is this what "clean" is supposed to feel like?',
        hero_image: '/images/before-after.png',
        advertorial_label: 'HEALTH & WELLNESS',
        hook: 'Every time I cleaned, my skin would burn. The fumes made me cough. Is this what "clean" is supposed to feel like?',
        story: [
            'I used to clean my bathroom every Sunday with bleach.',
            'My eyes would water. My throat would burn. I\'d have to open all the windows.',
            'But I thought that\'s what "clean" smelled like.',
            'Then my doctor asked: "Why are you poisoning yourself?"',
            'She explained that harsh chemicals don\'t make things cleaner—they just smell strong.',
            'She recommended microfiber and water. I was skeptical.',
            'But after one try, I was convinced. No fumes. No burning. Just clean.'
        ],
        benefits: [
            {
                title: 'No Respiratory Issues',
                description: 'Bleach and ammonia fumes damage your lungs. Water doesn\'t.'
            },
            {
                title: 'No Skin Irritation',
                description: 'Harsh chemicals strip your skin\'s natural oils. Microfiber is gentle.'
            },
            {
                title: 'Scientifically Proven',
                description: 'Studies show microfiber removes more bacteria than chemical cleaners.'
            }
        ],
        urgency_box: {
            title: 'Your Health Matters',
            text: 'Stop sacrificing your health for a "clean" home. There\'s a better way.'
        },
        cta_link: 'https://swivomagic.com/pages/health-first',
        cta_text: 'CHOOSE HEALTH >>',
        published: true
    }
];

export async function GET() {
    try {
        const results = [];

        for (const article of articlesToMigrate) {
            const result = await createArticle(article);
            results.push({
                slug: article.slug,
                success: result.success,
                error: result.error || null
            });
        }

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Migration complete! ${successCount}/${articlesToMigrate.length} articles imported.`,
            results
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
