import Footer from '@/components/Footer';
import ArticleMeta from '@/components/ArticleMeta';
import CommentSection from '@/components/CommentSection';
import StickyCTA from '@/components/StickyCTA';
import { notFound } from 'next/navigation';

import { getArticleBySlug } from '@/lib/db';

export default async function ArticlePage({ params }) {
    const article = await getArticleBySlug(params.slug);

    if (!article) {
        notFound();
    }

    // Parse JSON fields if they're strings
    const story = typeof article.story === 'string' ? JSON.parse(article.story) : article.story;
    const benefits = typeof article.benefits === 'string' ? JSON.parse(article.benefits) : article.benefits;
    const urgencyBox = typeof article.urgency_box === 'string' ? JSON.parse(article.urgency_box) : article.urgency_box;
    const comments = typeof article.comments === 'string' ? JSON.parse(article.comments) : article.comments;

    return (
        <>
            <div className="container advertorial-content">
                <header className="advertorial-header">
                    {article.advertorial_label && (
                        <span className="advertorial-label">{article.advertorial_label}</span>
                    )}
                    <h1 className="advertorial-title">{article.title}</h1>
                    <ArticleMeta
                        author={article.author}
                        date={article.published_date}
                        readTime="3 min read"
                    />
                </header>

                <img src={article.hero_image} alt={article.title} className="hero-image" />

                <p><strong>{article.hook}</strong></p>

                {/* Story Paragraphs */}
                {story && story.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}

                {/* Second Image (Solution) */}
                {article.second_image && (
                    <img
                        src={article.second_image}
                        alt="Transformation"
                        className="content-image"
                        style={{ width: '100%', borderRadius: '8px', margin: '24px 0' }}
                    />
                )}

                {/* Benefits Section */}
                {benefits && benefits.length > 0 && (
                    <>
                        <h3>Why This Works:</h3>
                        {benefits.map((benefit, index) => (
                            <div key={index}>
                                {benefit.title && <h4>{index + 1}. {benefit.title}</h4>}
                                {benefit.description && <p>{benefit.description}</p>}
                            </div>
                        ))}
                    </>
                )}

                {/* Urgency Box */}
                {urgencyBox && (urgencyBox.title || urgencyBox.text) && (
                    <div className="warning-box" style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '10px',
                        marginTop: '30px'
                    }}>
                        {urgencyBox.title && <h3>{urgencyBox.title}</h3>}
                        {urgencyBox.text && <p>{urgencyBox.text}</p>}
                    </div>
                )}

                {/* CTA Button */}
                <a href={article.cta_link} className="cta-button">
                    {article.cta_text}
                </a>

                <CommentSection comments={comments} />
            </div>
            <StickyCTA href={article.cta_link} />
            <Footer />
        </>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    const article = await getArticleBySlug(params.slug);

    if (!article) {
        return {
            title: 'Article Not Found - Swivo Magazine'
        };
    }

    return {
        title: `${article.title} - Swivo Magazine`,
        description: article.excerpt
    };
}
