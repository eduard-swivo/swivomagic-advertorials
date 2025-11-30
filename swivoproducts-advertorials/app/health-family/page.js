import Link from 'next/link';
import Footer from '@/components/Footer';
import { getArticlesByCategory } from '@/data/articles';

export const metadata = {
    title: 'Health & Family - Swivo Magazine',
};

export default function HealthFamilyPage() {
    const articles = getArticlesByCategory('Health & Family');

    return (
        <>
            <div className="container">
                <section className="intro-section">
                    <h1>Health & Family</h1>
                    <p>Keeping your loved ones safe and healthy with expert advice and trusted solutions.</p>
                </section>

                <section className="latest-articles">
                    <h2 className="section-title">Health & Family Articles</h2>
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
