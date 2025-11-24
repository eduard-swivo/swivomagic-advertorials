import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Home() {
    const articles = [
        {
            slug: 'the-smart-switch',
            title: '3 Reasons Why Smart Homeowners Are Ditching Chemical Sprays For This New "Just Add Water" Hack.',
            image: '/images/kit-shot.png',
            category: 'Lifestyle',
            author: 'Priya Sharma'
        },
        {
            slug: 'the-protector',
            title: 'WARNING: If You Have Pets Or Toddlers, Stop Mopping Your Floors Until You Read This.',
            image: '/images/lifestyle-shot.png',
            category: 'Family Safety',
            author: 'Anjali Gupta'
        },
        {
            slug: 'story-health',
            title: 'Is Your "Clean" Home Actually Making You Sick? Why Homeowners Are Throwing Out Bleach For This "Ancient" Secret.',
            image: '/images/before-after.png',
            category: 'Health',
            author: 'Meera Patel'
        }
    ];

    return (
        <>
            <div className="container">
                <section className="intro-section">
                    <h1>Welcome to Swivo Magazine</h1>
                    <p>Your daily source for home hacks, sustainable living, and family safety tips.</p>
                </section>

                <section className="latest-articles">
                    <h2 className="section-title">Latest Stories</h2>
                    <div className="article-grid">
                        {articles.map((article) => (
                            <Link href={`/${article.slug}`} key={article.slug} className="article-card">
                                <div className="card-image">
                                    <img src={article.image} alt={article.title} />
                                </div>
                                <div className="card-content">
                                    <span className="card-category">{article.category}</span>
                                    <h3 className="card-title">{article.title}</h3>
                                    <div className="card-meta">
                                        <span>By {article.author}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
