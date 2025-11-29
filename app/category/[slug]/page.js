import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

// Get articles by category
async function getArticlesByCategory(category) {
    try {
        const { rows } = await sql`
            SELECT * FROM articles 
            WHERE published = true 
            AND LOWER(category) = LOWER(${category})
            ORDER BY id DESC
        `;
        return rows;
    } catch (error) {
        console.error('Error fetching articles by category:', error);
        return [];
    }
}

export default async function CategoryPage({ params }) {
    const categorySlug = params.slug;

    // Convert slug to display name
    let categoryName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Handle special cases with ampersands
    if (categorySlug === 'health-family') {
        categoryName = 'Health & Family';
    } else if (categorySlug === 'home-garden') {
        categoryName = 'Home & Garden';
    }

    const articles = await getArticlesByCategory(categoryName);

    return (
        <>
            <div className="container">
                <section className="intro-section">
                    <h1>{categoryName}</h1>
                    <p>Browse all articles in {categoryName}</p>
                    <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                        ← Back to Home
                    </Link>
                </section>

                <section className="latest-articles">
                    {articles.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            No articles found in this category.
                        </p>
                    ) : (
                        <div className="article-grid">
                            {articles.map((article) => (
                                <Link href={`/${article.slug}`} key={article.slug} className="article-card">
                                    <div className="card-image">
                                        <img src={article.hero_image} alt={article.title} />
                                        {article.advertorial_label && (
                                            <span className="advertorial-badge">{article.advertorial_label}</span>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <span className="category-tag">{article.category}</span>
                                        <h3>{article.title}</h3>
                                        <p className="excerpt">{article.excerpt}</p>
                                        <div className="meta">
                                            <span>{article.author}</span>
                                            <span>{article.published_date}</span>
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

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    const categorySlug = params.slug;
    let categoryName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    if (categorySlug === 'health-family') {
        categoryName = 'Health & Family';
    } else if (categorySlug === 'home-garden') {
        categoryName = 'Home & Garden';
    }

    return {
        title: `${categoryName} - Swivo Magazine`,
        description: `Browse all ${categoryName} articles on Swivo Magazine`
    };
}
