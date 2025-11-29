'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../admin.css';

export default function NewArticle() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Lifestyle',
        author: '',
        published_date: new Date().toISOString().split('T')[0],
        excerpt: '',
        hero_image: '',
        advertorial_label: '',
        hook: '',
        story: [''],
        benefits: [{ title: '', description: '' }],
        urgency_box: { title: '', text: '' },
        cta_link: '',
        cta_text: 'CHECK AVAILABILITY >>',
        published: true
    });

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

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                alert('Article created successfully!');
                router.push('/admin');
            } else {
                alert('Error creating article: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Create New Article</h1>
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
                        placeholder="e.g., Stop Letting The Daily Wash Guy Ruin Your Windshield..."
                    />
                </div>

                <div className="form-group">
                    <label>URL Slug *</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            placeholder="e.g., the-motorist"
                            style={{ flex: 1 }}
                        />
                        <button type="button" onClick={generateSlug} className="btn-secondary">
                            Auto-Generate
                        </button>
                    </div>
                    <small>URL-friendly version of the title</small>
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
                            placeholder="e.g., Vikram R."
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
                        placeholder="e.g., October 25, 2025"
                    />
                </div>

                <div className="form-group">
                    <label>Excerpt *</label>
                    <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        required
                        placeholder="Short description for the homepage listing"
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
                        placeholder="/images/motorist-hero.jpg"
                    />
                    <small>Upload image to /public/images/ first</small>
                </div>

                <div className="form-group">
                    <label>Advertorial Label</label>
                    <input
                        type="text"
                        name="advertorial_label"
                        value={formData.advertorial_label}
                        onChange={handleChange}
                        placeholder="e.g., AUTO MAINTENANCE HACK • 2 MIN READ"
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
                        placeholder="The opening hook that grabs attention (will be bolded)"
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
                                placeholder="e.g., The Zero-Streak Glass Hack"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Description</label>
                            <textarea
                                value={benefit.description}
                                onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                                placeholder="Detailed description of this benefit"
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
                        name="urgency_box.title"
                        value={formData.urgency_box.title}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            urgency_box: { ...prev.urgency_box, title: e.target.value }
                        }))}
                        placeholder="e.g., The Verdict"
                    />
                </div>

                <div className="form-group">
                    <label>Urgency Box Text</label>
                    <textarea
                        name="urgency_box.text"
                        value={formData.urgency_box.text}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            urgency_box: { ...prev.urgency_box, text: e.target.value }
                        }))}
                        placeholder="Final push to action"
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
                        placeholder="https://swivomagic.com/pages/adv-motorists"
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
                        placeholder="CHECK AVAILABILITY >>"
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
                        Publish immediately
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Article'}
                    </button>
                    <Link href="/admin" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
