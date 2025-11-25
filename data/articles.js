// Centralized article data
// This file contains all article metadata and is used across the site for listings and navigation

export const articles = [
    {
        slug: 'diwali-cleaning',
        title: 'Throw Away Your Old Newspapers. How Indian Moms Are Cleaning Glass & Mirrors For Just ₹699.',
        image: '/images/diwali-hero.webp',
        category: 'Lifestyle',
        author: 'Anjali S.',
        date: 'October 26, 2025',
        excerpt: 'Streaks, lint, and chemical smells used to be the price of a clean home. This "Just Add Water" cloth changed everything.'
    },
    {
        slug: 'the-motorist',
        title: 'Stop Letting The "Daily Wash Guy" Ruin Your Windshield. The ₹699 Switch That Gives A Showroom Shine.',
        image: '/images/motorist-hero.jpg',
        category: 'Lifestyle',
        author: 'Vikram R.',
        date: 'October 25, 2025',
        excerpt: 'Tired of hazy windshields at night and water spots on your paint? It\'s not your soap. It\'s your cloth.'
    },
    {
        slug: 'the-smart-switch',
        title: '3 Reasons Why Smart Homeowners Are Ditching Chemical Sprays For This New "Just Add Water" Hack.',
        image: '/images/kit-shot.png',
        category: 'Lifestyle',
        author: 'Priya Sharma',
        date: 'October 24, 2025',
        excerpt: 'If you own an SUV or Sedan in India, you know the struggle: One day after a wash, it\'s covered in dust again.'
    },
    {
        slug: 'the-protector',
        title: 'WARNING: If You Have Pets Or Toddlers, Stop Mopping Your Floors Until You Read This.',
        image: '/images/lifestyle-shot.png',
        category: 'Health & Family',
        author: 'Anjali Gupta',
        date: 'October 22, 2025',
        excerpt: 'If you have pets or toddlers, you need to read this before cleaning your floors again.'
    },
    {
        slug: 'story-health',
        title: 'Is Your "Clean" Home Actually Making You Sick? Why Homeowners Are Throwing Out Bleach For This "Ancient" Secret.',
        image: '/images/before-after.png',
        category: 'Health & Family',
        author: 'Meera Patel',
        date: 'October 20, 2025',
        excerpt: 'Every time I cleaned, my skin would burn. The fumes made me cough. Is this what "clean" is supposed to feel like?'
    }
];

// Get articles by category
export function getArticlesByCategory(category) {
    if (!category || category === 'home') {
        return articles;
    }
    return articles.filter(article =>
        article.category.toLowerCase() === category.toLowerCase()
    );
}

// Get all unique categories
export function getCategories() {
    const categories = [...new Set(articles.map(article => article.category))];
    return categories;
}
