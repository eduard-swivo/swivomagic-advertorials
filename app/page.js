import Link from 'next/link';
import Footer from '@/components/Footer';

import { getAllArticles } from '@/lib/db';

// No need for fetch helper anymore
// Direct DB access is better for Server Components

export default async function Home() {
    const articles = await getAllArticles();

    return (
        <>
            <div className="container">
                <section className="intro-section">
                    <h1>Welcome to Swivo Magazine</h1>
                    <p>Your daily source for home hacks, sustainable living, and family safety tips.</p>
                </section>

                <section className="latest-articles">
                    <h2 className="section-title">Latest Stories</h2>
                    {articles.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            No articles yet. Visit <Link href="/admin" style={{ color: '#2563eb' }}>/admin</Link> to create your first article!
                        </p>
                    ) : (
                        <div className="article-grid">
                            {articles.map((article) => (
                                <Link href={`/${article.slug}`} key={article.slug} className="article-card">
                                    <div className="card-image">
                                        <img src={article.hero_image} alt={article.title} />
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
                    )}
                </section>
            </div>
            <Footer />
        </>
    );
}
