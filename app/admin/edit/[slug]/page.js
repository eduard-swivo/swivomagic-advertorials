'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../admin.css';

export default function EditArticle({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Lifestyle',
        author: '',
        published_date: '',
        excerpt: '',
        hero_image: '',
        second_image: '',
        product_main_image: '',
        product_images: [], // Added
        advertorial_label: '',
        hook: '',
        story: [''],
        benefits: [{ title: '', description: '' }],
        urgency_box: { title: '', text: '' },
        cta_link: '',
        cta_text: '',
        countdown_timer: { enabled: false, minutes: 20 },
        visual_brief: '', // Added
        published: true
    });

    useEffect(() => {
        fetchArticle();
    }, []);

    const fetchArticle = async () => {
        try {
            const res = await fetch(`/api/articles/${params.slug}`);
            const data = await res.json();

            if (data.success) {
                const article = data.article;
                setFormData({
                    title: article.title || '',
                    slug: article.slug || '',
                    category: article.category || 'Lifestyle',
                    author: article.author || '',
                    published_date: article.published_date || '',
                    excerpt: article.excerpt || '',
                    hero_image: article.hero_image || '',
                    second_image: article.second_image || '',
                    product_main_image: article.product_main_image || '',
                    product_images: typeof article.product_images === 'string' ? JSON.parse(article.product_images) : (article.product_images || []), // Load product images
                    advertorial_label: article.advertorial_label || '',
                    hook: article.hook || '',
                    story: typeof article.story === 'string' ? JSON.parse(article.story) : (article.story || ['']),
                    benefits: typeof article.benefits === 'string' ? JSON.parse(article.benefits) : (article.benefits || [{ title: '', description: '' }]),
                    urgency_box: typeof article.urgency_box === 'string' ? JSON.parse(article.urgency_box) : (article.urgency_box || { title: '', text: '' }),
                    cta_link: article.cta_link || '',
                    cta_text: article.cta_text || '',
                    countdown_timer: typeof article.countdown_timer === 'string' ? JSON.parse(article.countdown_timer) : (article.countdown_timer || { enabled: false, minutes: 20 }),
                    visual_brief: article.visual_brief || '',
                    published: article.published !== false
                });
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            alert('Error loading article');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStoryChange = (index, value) => {
        const newStory = [...formData.story];
        newStory[index] = value;
        setFormData(prev => ({ ...prev, story: newStory }));
    };

    const addStoryParagraph = () => {
        setFormData(prev => ({
            ...prev,
            story: [...prev.story, '']
        }));
    };

    const removeStoryParagraph = (index) => {
        setFormData(prev => ({
            ...prev,
            story: prev.story.filter((_, i) => i !== index)
        }));
    };

    const handleBenefitChange = (index, field, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index][field] = value;
        setFormData(prev => ({ ...prev, benefits: newBenefits }));
    };

    const addBenefit = () => {
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, { title: '', description: '' }]
        }));
    };

    const removeBenefit = (index) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/articles/${params.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                alert('Article updated successfully!');
                router.push('/admin');
            } else {
                alert('Error updating article: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating article');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerateHeroImage = async () => {
        if (!formData.hook) {
            alert('Hook paragraph is required to regenerate images');
            return;
        }

        setRegenerating(true);
        try {
            const res = await fetch('/api/regenerate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hook: formData.hook,
                    productUrl: formData.cta_link,
                    productTitle: formData.title,
                    visualBrief: formData.visual_brief, // Pass visual brief
                    imageIndex: 0 // Only generate first image
                })
            });

            const data = await res.json();

            if (data.success && data.images && data.images[0]) {
                setFormData(prev => ({
                    ...prev,
                    hero_image: data.images[0].url
                }));
                alert('Hero image regenerated successfully!');
            } else {
                alert('Error regenerating hero image: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to regenerate hero image');
        } finally {
            setRegenerating(false);
        }
    };

    const handleRegenerateSecondImage = async () => {
        if (!formData.hook) {
            alert('Hook paragraph is required to regenerate images');
            return;
        }

        setRegenerating(true);
        try {
            const res = await fetch('/api/regenerate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hook: formData.hook,
                    productUrl: formData.cta_link,
                    productTitle: formData.title,
                    productMainImage: formData.product_main_image, // Pass main image for solution image accuracy
                    productImages: formData.product_images, // Pass reference images
                    imageIndex: 1 // Only generate second image
                })
            });

            const data = await res.json();

            if (data.success && data.images && data.images[1]) {
                setFormData(prev => ({
                    ...prev,
                    second_image: data.images[1].url
                }));
                alert('Second image regenerated successfully!');
            } else {
                alert('Error regenerating second image: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to regenerate second image');
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Edit Article</h1>
                <Link href="/admin" className="btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                {/* Basic Info */}
                <h2 style={{ marginBottom: '24px', color: '#111' }}>Basic Information</h2>

                <div className="form-group">
                    <label>Article Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>URL Slug *</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        disabled
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                    <small>Slug cannot be changed after creation</small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Health & Family">Health & Family</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Author *</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Publication Date *</label>
                    <input
                        type="text"
                        name="published_date"
                        value={formData.published_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Excerpt *</label>
                    <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Images Section */}
                <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Article Images</h2>

                <div className="form-group">
                    <label>Hero Image URL (Image 1) *</label>
                    <input
                        type="text"
                        name="hero_image"
                        value={formData.hero_image}
                        onChange={handleChange}
                        required
                    />
                    {formData.hero_image && (
                        <div>
                            <img
                                src={formData.hero_image}
                                alt="Hero preview"
                                style={{ marginTop: '12px', maxWidth: '300px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                            />
                            <button
                                type="button"
                                onClick={handleRegenerateHeroImage}
                                disabled={regenerating}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: regenerating ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: regenerating ? 'not-allowed' : 'pointer',
                                    display: 'block'
                                }}
                            >
                                {regenerating ? '🔄 Regenerating...' : '🎨 Regenerate Hero Image'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Visual Brief Editor (New) */}
                {formData.visual_brief && (
                    <div className="form-group" style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '8px',
                        border: '2px solid #0ea5e9'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <span style={{ fontSize: '20px', marginRight: '8px' }}>🎨</span>
                            <h4 style={{
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#0369a1'
                            }}>
                                Visual Brief (Editable)
                            </h4>
                        </div>
                        <textarea
                            name="visual_brief"
                            value={formData.visual_brief}
                            onChange={handleChange}
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #bae6fd',
                                borderRadius: '6px',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                color: '#0c4a6e',
                                background: 'white',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Visual brief will appear here..."
                        />
                        <small style={{
                            display: 'block',
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#0369a1',
                            fontStyle: 'italic'
                        }}>
                            ℹ️ Edit this description to customize your hero image. This will be used when you click "Regenerate Hero Image".
                        </small>
                    </div>
                )}

                <div className="form-group">
                    <label>Second Image URL (Image 2)</label>
                    <input
                        type="text"
                        name="second_image"
                        value={formData.second_image}
                        onChange={handleChange}
                    />
                    {formData.second_image && (
                        <div>
                            <img
                                src={formData.second_image}
                                alt="Second image preview"
                                style={{ marginTop: '12px', maxWidth: '300px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                            />
                            <button
                                type="button"
                                onClick={handleRegenerateSecondImage}
                                disabled={regenerating}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: regenerating ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: regenerating ? 'not-allowed' : 'pointer',
                                    display: 'block'
                                }}
                            >
                                {regenerating ? '🔄 Regenerating...' : '🎨 Regenerate Second Image'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Product Main Image URL</label>
                    <input
                        type="text"
                        name="product_main_image"
                        value={formData.product_main_image}
                        onChange={handleChange}
                    />
                    {formData.product_main_image && (
                        <img
                            src={formData.product_main_image}
                            alt="Product main image preview"
                            style={{ marginTop: '12px', maxWidth: '300px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                        />
                    )}
                </div>

                <div className="form-group">
                    <label>Advertorial Label</label>
                    <input
                        type="text"
                        name="advertorial_label"
                        value={formData.advertorial_label}
                        onChange={handleChange}
                    />
                </div>

                {/* Content */}
                <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Article Content</h2>

                <div className="form-group">
                    <label>Hook Paragraph *</label>
                    <textarea
                        name="hook"
                        value={formData.hook}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Story Paragraphs *</label>
                    {formData.story.map((paragraph, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <textarea
                                    value={paragraph}
                                    onChange={(e) => handleStoryChange(index, e.target.value)}
                                    placeholder={`Paragraph ${index + 1}`}
                                    style={{ flex: 1 }}
                                />
                                {formData.story.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeStoryParagraph(index)}
                                        className="btn-remove"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addStoryParagraph} className="btn-add">
                        + Add Paragraph
                    </button>
                </div>

                {/* Benefits */}
                <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Benefits Section</h2>

                {formData.benefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                        <div className="benefit-header">
                            <h4>Benefit {index + 1}</h4>
                            {formData.benefits.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeBenefit(index)}
                                    className="btn-remove"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label>Title</label>
                            <input
                                type="text"
                                value={benefit.title}
                                onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Description</label>
                            <textarea
                                value={benefit.description}
                                onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addBenefit} className="btn-add">
                    + Add Benefit
                </button>

                {/* Urgency Box */}
                <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Urgency Box</h2>

                <div className="form-group">
                    <label>Urgency Box Title</label>
                    <input
                        type="text"
                        value={formData.urgency_box.title}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            urgency_box: { ...prev.urgency_box, title: e.target.value }
                        }))}
                    />
                </div>

                <div className="form-group">
                    <label>Urgency Box Text</label>
                    <textarea
                        value={formData.urgency_box.text}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            urgency_box: { ...prev.urgency_box, text: e.target.value }
                        }))}
                    />
                </div>

                {/* Countdown Timer Settings */}
                <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#111', fontSize: '18px' }}>Countdown Timer</h3>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={formData.countdown_timer.enabled}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                countdown_timer: { ...prev.countdown_timer, enabled: e.target.checked }
                            }))}
                            style={{ width: 'auto' }}
                        />
                        Enable Countdown Timer
                    </label>
                    <small>Display a countdown timer in the urgency box</small>
                </div>

                {formData.countdown_timer.enabled && (
                    <div className="form-group">
                        <label>Timer Duration (minutes)</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.countdown_timer.minutes}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                countdown_timer: { ...prev.countdown_timer, minutes: parseInt(e.target.value) || 20 }
                            }))}
                        />
                        <small>Set the countdown duration in minutes (default: 20)</small>
                    </div>
                )}

                {/* CTA */}
                <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Call to Action</h2>

                <div className="form-group">
                    <label>CTA Link *</label>
                    <input
                        type="text"
                        name="cta_link"
                        value={formData.cta_link}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>CTA Button Text *</label>
                    <input
                        type="text"
                        name="cta_text"
                        value={formData.cta_text}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            name="published"
                            checked={formData.published}
                            onChange={handleChange}
                            style={{ width: 'auto' }}
                        />
                        Published
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link href="/admin" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
