import Link from 'next/link';
import Footer from '@/components/Footer';
import { getArticlesByCategory } from '@/data/articles';

export const metadata = {
    title: 'Lifestyle - Swivo Magazine',
};

export default function LifestylePage() {
    const articles = getArticlesByCategory('Lifestyle');

    return (
        <>
            <div className="container">
                <section className="intro-section">
                    <h1>Lifestyle</h1>
                    <p>Smart solutions for modern living—from home care to automotive hacks.</p>
                </section>

                <section className="latest-articles">
                    <h2 className="section-title">Lifestyle Articles</h2>
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
