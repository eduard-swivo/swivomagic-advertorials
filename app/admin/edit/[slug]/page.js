'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../admin.css';

export default function EditArticle({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Lifestyle',
        author: '',
        published_date: '',
        excerpt: '',
        hero_image: '',
        advertorial_label: '',
        hook: '',
        story: [''],
        benefits: [{ title: '', description: '' }],
        urgency_box: { title: '', text: '' },
        cta_link: '',
        cta_text: '',
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
                    advertorial_label: article.advertorial_label || '',
                    hook: article.hook || '',
                    story: typeof article.story === 'string' ? JSON.parse(article.story) : (article.story || ['']),
                    benefits: typeof article.benefits === 'string' ? JSON.parse(article.benefits) : (article.benefits || [{ title: '', description: '' }]),
                    urgency_box: typeof article.urgency_box === 'string' ? JSON.parse(article.urgency_box) : (article.urgency_box || { title: '', text: '' }),
                    cta_link: article.cta_link || '',
                    cta_text: article.cta_text || '',
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

                <div className="form-group">
                    <label>Hero Image URL *</label>
                    <input
                        type="text"
                        name="hero_image"
                        value={formData.hero_image}
                        onChange={handleChange}
                        required
                    />
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
