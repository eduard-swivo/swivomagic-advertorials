import Link from 'next/link';
import Footer from '@/components/Footer';
import { articles } from '@/data/articles';

export default function Home() {
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
