'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../admin.css';

export default function NewArticle() {
    const router = useRouter();
    const [mode, setMode] = useState('ai'); // 'ai' or 'manual'
    const [aiMode, setAiMode] = useState('product'); // 'product' or 'creative'
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // AI inputs
    const [savedProducts, setSavedProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [productDescription, setProductDescription] = useState(''); // Physical description for AI
    const [productImages, setProductImages] = useState([]); // Array of uploaded product images (max 3)
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [generatedImages, setGeneratedImages] = useState([]); // Store DALL-E images

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Lifestyle',
        author: '',
        published_date: new Date().toISOString().split('T')[0],
        excerpt: '',
        hero_image: '',
        second_image: '',
        advertorial_label: '',
        hook: '',
        story: [''],
        benefits: [{ title: '', description: '' }],
        urgency_box: { title: '', text: '' },
        comments: [],
        cta_link: '',
        cta_text: 'CHECK AVAILABILITY >>',
        published: true
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Fetch saved products
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSavedProducts(data.products);
                }
            })
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    const handleProductImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('Maximum 3 product images allowed');
            return;
        }

        const imagePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(images => {
            setProductImages(images);
        });
    };

    const removeProductImage = (index) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductSelect = (e) => {
        const id = e.target.value;
        setSelectedProductId(id);

        if (id) {
            const product = savedProducts.find(p => p.id.toString() === id);
            if (product) {
                setProductUrl(product.url);
                setProductDescription(product.description || '');
                if (product.images && product.images.length > 0) {
                    setProductImages(product.images);
                }
            }
        } else {
            setProductUrl('');
            setProductDescription('');
            setProductImages([]);
        }
    };

    const handleAIGenerate = async () => {
        if (!productUrl) {
            alert('Please enter a product URL');
            return;
        }

        if (aiMode === 'creative' && !imagePreview) {
            alert('Please upload an ad creative image');
            return;
        }

        setGenerating(true);

        try {
            const res = await fetch('/api/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: aiMode,
                    productUrl,
                    productImages: productImages.length > 0 ? productImages : null,
                    productDescription, // Pass physical description
                    imageUrl: imagePreview || null
                })
            });

            const data = await res.json();

            if (data.success) {
                // Populate form with AI-generated content
                setFormData({
                    ...formData,
                    ...data.article,
                    hero_image: '/images/placeholder.jpg' // User will need to upload
                });

                // Show generated images if available
                if (data.article.generated_images && data.article.generated_images.length > 0) {
                    setGeneratedImages(data.article.generated_images);
                }

                setMode('manual'); // Switch to manual mode to review/edit
                alert('✨ Article generated! Review and adjust as needed, then save.');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate article. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateImages = async () => {
        if (!formData.hook) {
            alert('No hook available to base images on.');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/regenerate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hook: formData.hook,
                    productUrl,
                    productImages: productImages.length > 0 ? productImages : null,
                    productDescription, // Pass physical description
                    productTitle: formData.title // Pass title as context
                })
            });

            const data = await res.json();

            if (data.success && data.images) {
                setGeneratedImages(data.images);
            } else {
                alert('Error regenerating images: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to regenerate images');
        } finally {
            setGenerating(false);
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

    const handleCommentChange = (index, field, value) => {
        const newComments = [...formData.comments];
        newComments[index][field] = value;
        setFormData(prev => ({ ...prev, comments: newComments }));
    };

    const addComment = () => {
        setFormData(prev => ({
            ...prev,
            comments: [...prev.comments, { name: 'New User', text: '', time: 'Just now' }]
        }));
    };

    const removeComment = (index) => {
        setFormData(prev => ({
            ...prev,
            comments: prev.comments.filter((_, i) => i !== index)
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

            {/* Mode Selector */}
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <button
                        onClick={() => setMode('ai')}
                        style={{
                            flex: 1,
                            padding: '16px',
                            background: mode === 'ai' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                            color: mode === 'ai' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🤖 AI Generate
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        style={{
                            flex: 1,
                            padding: '16px',
                            background: mode === 'manual' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                            color: mode === 'manual' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ✍️ Manual Entry
                    </button>
                </div>

                {mode === 'ai' && (
                    <div>
                        <h3 style={{ marginBottom: '16px', color: '#111' }}>AI Article Generator</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
                            Generate high-converting advertorials optimized for cold Facebook traffic
                        </p>

                        {/* AI Mode Selector */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={() => setAiMode('product')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: aiMode === 'product' ? '#dbeafe' : '#f9fafb',
                                    color: aiMode === 'product' ? '#1e40af' : '#6b7280',
                                    border: `2px solid ${aiMode === 'product' ? '#3b82f6' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🔗 From Product Link
                            </button>
                            <button
                                onClick={() => setAiMode('creative')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: aiMode === 'creative' ? '#dbeafe' : '#f9fafb',
                                    color: aiMode === 'creative' ? '#1e40af' : '#6b7280',
                                    border: `2px solid ${aiMode === 'creative' ? '#3b82f6' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🎨 From Ad Creative
                            </button>
                        </div>

                        {/* Saved Product Selector */}
                        {savedProducts.length > 0 && (
                            <div style={{ marginBottom: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0369a1' }}>
                                    📦 Load Saved Product (Optional)
                                </label>
                                <select
                                    value={selectedProductId}
                                    onChange={handleProductSelect}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #bae6fd',
                                        background: 'white',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">-- Select a saved product --</option>
                                    {savedProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                    <Link href="/admin/products" style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none' }}>
                                        Manage Products →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Product URL Input */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                Product URL (CTA Link) *
                            </label>
                            <input
                                type="url"
                                value={productUrl}
                                onChange={(e) => setProductUrl(e.target.value)}
                                placeholder="https://yourstore.com/product"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '13px' }}>
                                This will be used as the CTA link in the article
                            </small>
                        </div>

                        {/* Product Description Input */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                Physical Description (for AI)
                            </label>
                            <textarea
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Describe the product appearance for the AI (e.g., Blue microfiber cloth, 12x12 inches, waffle texture)"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: '#f9fafb'
                                }}
                            />
                        </div>

                        {/* Product Images Upload (Max 3) */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                Product Images (Optional, Max 3)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleProductImagesUpload}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '13px' }}>
                                📸 Upload up to 3 product images for more accurate AI-generated visuals
                            </small>

                            {productImages.length > 0 && (
                                <div style={{
                                    marginTop: '12px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px'
                                }}>
                                    {productImages.map((img, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={img}
                                                alt={`Product ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e5e7eb'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeProductImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Image Upload (Creative Mode) */}
                        {aiMode === 'creative' && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                    Upload Ad Creative *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: '12px' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '300px',
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleAIGenerate}
                            disabled={generating}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: generating ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: generating ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            {generating ? '🤖 Generating Article... (30-60s)' : '✨ Generate Article with AI'}
                        </button>

                        {generating && (
                            <div style={{
                                marginTop: '16px',
                                padding: '16px',
                                background: '#fef3c7',
                                borderRadius: '8px',
                                color: '#92400e',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                ⏳ AI is analyzing the product and crafting your advertorial... This may take 30-60 seconds.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Manual Form (shown when mode is manual or after AI generation) */}
            {mode === 'manual' && (
                <form onSubmit={handleSubmit} className="form-container">
                    {/* Generated Images Gallery */}
                    {generatedImages.length > 0 && (
                        <div style={{
                            background: '#f0fdf4',
                            padding: '24px',
                            borderRadius: '12px',
                            marginBottom: '32px',
                            border: '2px solid #bbf7d0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    🎨 AI Generated Images
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleRegenerateImages}
                                    disabled={generating}
                                    style={{
                                        padding: '8px 16px',
                                        background: generating ? '#9ca3af' : '#166534',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: generating ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {generating ? '🔄 Regenerating...' : '🔄 Regenerate Images'}
                                </button>
                            </div>

                            <p style={{ marginBottom: '16px', color: '#15803d', fontSize: '14px' }}>
                                <strong>Images are automatically saved to Vercel Blob!</strong>
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {/* Image 1: Problem */}
                                {generatedImages[0] && (
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#166534' }}>
                                            Image 1: The Problem (Hero)
                                            {generatedImages[0].engine && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: generatedImages[0].engine === 'google' ? '#FEF08A' : '#DBEAFE',
                                                    color: generatedImages[0].engine === 'google' ? '#854D0E' : '#1E40AF',
                                                    border: '1px solid rgba(0,0,0,0.1)'
                                                }}>
                                                    {generatedImages[0].engine === 'google' ? '🍌 Google Imagen' : '🤖 DALL-E 3'}
                                                </span>
                                            )}
                                        </div>
                                        <img
                                            src={generatedImages[0].url || generatedImages[0]}
                                            alt="Problem"
                                            style={{
                                                width: '100%',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                border: '1px solid #bbf7d0'
                                            }}
                                        />
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, hero_image: generatedImages[0].url || generatedImages[0] }))}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: '#166534',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Set as Hero Image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedImages[0].url || generatedImages[0]);
                                                    alert('URL copied!');
                                                }}
                                                style={{
                                                    padding: '8px',
                                                    background: 'white',
                                                    color: '#166534',
                                                    border: '1px solid #166534',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Image 2: Solution */}
                                {generatedImages[1] && (
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#166534' }}>
                                            Image 2: The Solution (Body)
                                            {generatedImages[1].engine && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: generatedImages[1].engine === 'google' ? '#FEF08A' : '#DBEAFE',
                                                    color: generatedImages[1].engine === 'google' ? '#854D0E' : '#1E40AF',
                                                    border: '1px solid rgba(0,0,0,0.1)'
                                                }}>
                                                    {generatedImages[1].engine === 'google' ? '🍌 Google Imagen' : '🤖 DALL-E 3'}
                                                </span>
                                            )}
                                        </div>
                                        <img
                                            src={generatedImages[1].url || generatedImages[1]}
                                            alt="Solution"
                                            style={{
                                                width: '100%',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                border: '1px solid #bbf7d0'
                                            }}
                                        />
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, second_image: generatedImages[1].url || generatedImages[1] }))}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: '#15803d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Set as Second Image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedImages[1].url || generatedImages[1]);
                                                    alert('URL copied!');
                                                }}
                                                style={{
                                                    padding: '8px',
                                                    background: 'white',
                                                    color: '#15803d',
                                                    border: '1px solid #15803d',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rest of the manual form - keeping all the existing fields */}
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
                        <label>Second Image URL (Solution)</label>
                        <input
                            type="text"
                            name="second_image"
                            value={formData.second_image}
                            onChange={handleChange}
                            placeholder="URL for the solution/transformation image"
                        />
                        <small>Displayed before the Benefits section</small>
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

                    {
                        formData.benefits.map((benefit, index) => (
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
                        ))
                    }

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
                            placeholder="e.g., The Verdict"
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
                            placeholder="Final push to action"
                        />
                    </div>

                    {/* Comments Section */}
                    <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Comments Section</h2>

                    {formData.comments && formData.comments.map((comment, index) => (
                        <div key={index} className="benefit-item" style={{ background: '#f9fafb' }}>
                            <div className="benefit-header">
                                <h4>Comment {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => removeComment(index)}
                                    className="btn-remove"
                                >
                                    Remove
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={comment.name}
                                        onChange={(e) => handleCommentChange(index, 'name', e.target.value)}
                                        placeholder="User Name"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Time</label>
                                    <input
                                        type="text"
                                        value={comment.time}
                                        onChange={(e) => handleCommentChange(index, 'time', e.target.value)}
                                        placeholder="e.g. 2 min ago"
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Comment Text</label>
                                <textarea
                                    value={comment.text}
                                    onChange={(e) => handleCommentChange(index, 'text', e.target.value)}
                                    placeholder="Comment content..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addComment} className="btn-add">
                        + Add Comment
                    </button>

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
                </form >
            )
            }
        </div >
    );
}
