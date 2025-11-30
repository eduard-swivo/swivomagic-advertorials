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
    const [regeneratingHero, setRegeneratingHero] = useState(false);
    const [regeneratingSecond, setRegeneratingSecond] = useState(false);
    const [progressMessage, setProgressMessage] = useState(''); // For modal progress updates

    // AI inputs
    const [savedProducts, setSavedProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [productDescription, setProductDescription] = useState(''); // Physical description for AI
    const [productImages, setProductImages] = useState([]); // Array of uploaded product images (max 3)
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [generatedImages, setGeneratedImages] = useState([]); // Store DALL-E images
    const [selectedAngle, setSelectedAngle] = useState('before-after'); // Default angle
    const [visualBrief, setVisualBrief] = useState(''); // Store visual brief from ad creative analysis
    const [generatingVisualBrief, setGeneratingVisualBrief] = useState(false); // Loading state for visual brief

    const angles = [
        { id: 'in-use', label: 'Product In Use', description: 'Focus on the mechanism and action' },
        { id: 'before', label: 'The Before', description: 'Focus on the pain point and frustration' },
        { id: 'before-after', label: 'Before & After', description: 'Focus on the transformation' },
        { id: 'in-hand', label: 'Product In Hand', description: 'Focus on the discovery of the device' },
        { id: 'story', label: 'Story Related', description: 'Focus on the personal narrative/emotion' },
        { id: 'after', label: 'The After', description: 'Focus on the result and relief' }
    ];

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
        product_main_image: '', // New field
        advertorial_label: '',
        hook: '',
        story: [''],
        benefits: [{ title: '', description: '' }],
        urgency_box: { title: '', text: '' },
        comments: [],
        cta_link: '',
        cta_text: 'CHECK AVAILABILITY >>',
        countdown_timer: { enabled: false, minutes: 20 },
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
                // Auto-set main image if available
                if (product.main_image) {
                    setFormData(prev => ({ ...prev, product_main_image: product.main_image }));
                }
            }
        } else {
            setProductUrl('');
            setProductDescription('');
        }
    };

    const handleGenerateVisualBrief = async () => {
        if (!imageFile) {
            alert('Please upload an ad creative first');
            return;
        }

        setGeneratingVisualBrief(true);
        try {
            // Convert file to base64
            const reader = new FileReader();
            const base64Image = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(imageFile);
            });

            const res = await fetch('/api/generate-visual-brief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: base64Image })
            });

            const data = await res.json();
            if (data.success) {
                setVisualBrief(data.visual_brief);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Visual brief generation error:', error);
            alert('Failed to generate visual brief. Please try again.');
        } finally {
            setGeneratingVisualBrief(false);
        }
    };

    const handleAIGenerate = async () => {
        if (aiMode === 'product' && !productUrl) {
            alert('Please select a product first');
            return;
        }
        if (aiMode === 'creative' && !imageFile) {
            alert('Please upload an ad creative first');
            return;
        }

        setGenerating(true);
        setProgressMessage('Initializing AI...'); // Changed setGenerationStep to setProgressMessage as defined in state

        try {
            let payload = {
                mode: aiMode,
                productUrl,
                angle: selectedAngle // Pass the selected angle
            };

            if (aiMode === 'product') {
                payload.productImages = productImages;
                payload.productDescription = productDescription;
                payload.productMainImage = formData.product_main_image; // Add main image for Image 2 generation
            } else {
                // Convert file to base64 for creative mode
                const reader = new FileReader();
                const base64Image = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(imageFile);
                });
                payload.imageUrl = base64Image;
                payload.productDescription = productDescription;
                payload.productMainImage = formData.product_main_image;
                payload.visualBrief = visualBrief; // Pass the visual brief if available
            }

            setProgressMessage('Analyzing product & writing copy...');
            const res = await fetch('/api/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setProgressMessage('🎨 Generating images...');

            const data = await res.json();
            if (data.success) {
                try {
                    setProgressMessage('📝 Populating form...');

                    // Extract generated images
                    const generatedImgs = data.article.generated_images || [];

                    // Populate form with AI-generated content
                    setFormData(prev => ({
                        ...prev,
                        title: data.article.title || '',
                        slug: data.article.slug || '',
                        category: data.article.category || 'Lifestyle',
                        author: data.article.author || '',
                        advertorial_label: data.article.advertorial_label || '',
                        excerpt: data.article.excerpt || '',
                        hook: data.article.hook || '',
                        story: Array.isArray(data.article.story)
                            ? data.article.story
                            : (typeof data.article.story === 'string' ? [data.article.story] : ['']),
                        benefits: Array.isArray(data.article.benefits) ? data.article.benefits : [{ title: '', description: '' }],
                        urgency_box: data.article.urgency_box || { title: '', text: '' },
                        comments: Array.isArray(data.article.comments) ? data.article.comments : [],
                        cta_link: productUrl || '', // Use product URL as CTA link
                        cta_text: data.article.cta_text || 'CHECK AVAILABILITY >>',
                        hero_image: generatedImgs[0]?.url || generatedImgs[0] || '',
                        second_image: generatedImgs[1]?.url || generatedImgs[1] || ''
                    }));

                    // Show generated images if available
                    if (generatedImgs.length > 0) {
                        setGeneratedImages(generatedImgs);
                    }

                    // Store visual brief if available (from ad creative mode)
                    if (data.article.visual_brief) {
                        setVisualBrief(data.article.visual_brief);
                    }

                    setMode('manual'); // Switch to manual mode to review/edit
                    alert('✨ Article generated! Review and adjust as needed, then save.');
                } catch (err) {
                    console.error('Error populating form:', err);
                    alert('Article generated but there was an error displaying it. Check console for details.');
                }
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate article. Please try again.');
        } finally {
            setGenerating(false);
            setProgressMessage('');
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
                    productTitle: formData.title, // Pass title as context
                    productMainImage: formData.product_main_image // Pass main image for solution image accuracy
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
                body: JSON.stringify({
                    ...formData,
                    product_images: productImages, // Include uploaded/selected product images
                    visual_brief: visualBrief // Include visual brief
                })
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
            {/* Progress Modal */}
            {generating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        {/* Spinner */}
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 24px'
                        }} />

                        {/* Progress Message */}
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#111',
                            marginBottom: '12px'
                        }}>
                            {progressMessage || '⏳ Generating...'}
                        </h3>

                        <p style={{
                            color: '#6b7280',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            This may take 30-60 seconds. Please don't close this window.
                        </p>

                        {/* CSS Animation */}
                        <style jsx>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                </div>
            )}

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

                                        {/* Generate Visual Brief Button */}
                                        <button
                                            type="button"
                                            onClick={handleGenerateVisualBrief}
                                            disabled={generatingVisualBrief}
                                            style={{
                                                marginTop: '12px',
                                                width: '100%',
                                                padding: '12px',
                                                background: generatingVisualBrief ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: generatingVisualBrief ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
                                            }}
                                        >
                                            {generatingVisualBrief ? '🔄 Analyzing Creative...' : '🎨 Generate Visual Brief from Creative'}
                                        </button>
                                    </div>
                                )}

                                {/* Visual Brief Editor - Shows after generation */}
                                {visualBrief && (
                                    <div style={{
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
                                            value={visualBrief}
                                            onChange={(e) => setVisualBrief(e.target.value)}
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
                                            ℹ️ Edit this description to customize your hero image. This will be used to create an image similar to your ad creative (without text/CTAs).
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Advertorial Angle Selector - Only show in Product mode */}
                        {aiMode === 'product' && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                                    Select Advertorial Angle *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                    {angles.map((angle) => (
                                        <div
                                            key={angle.id}
                                            onClick={() => setSelectedAngle(angle.id)}
                                            style={{
                                                padding: '12px',
                                                border: `2px solid ${selectedAngle === angle.id ? '#10b981' : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                background: selectedAngle === angle.id ? '#ecfdf5' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: selectedAngle === angle.id ? '#047857' : '#374151', marginBottom: '4px' }}>
                                                {angle.label}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {angle.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
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
                            {formData.hero_image && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                    <img
                                        src={formData.hero_image}
                                        alt="Hero preview"
                                        style={{
                                            width: '200px',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!formData.hook) {
                                                alert('Please generate the article first to have a hook for image generation.');
                                                return;
                                            }
                                            setRegeneratingHero(true);
                                            try {
                                                const res = await fetch('/api/regenerate-images', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        hook: formData.hook,
                                                        productUrl,
                                                        productImages: productImages.length > 0 ? productImages : null,
                                                        productDescription,
                                                        productTitle: formData.title,
                                                        imageIndex: 0 // Only regenerate first image
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success && data.images && data.images[0]) {
                                                    setFormData(prev => ({ ...prev, hero_image: data.images[0].url || data.images[0] }));
                                                }
                                            } catch (error) {
                                                console.error('Error:', error);
                                                alert('Failed to regenerate image');
                                            } finally {
                                                setRegeneratingHero(false);
                                            }
                                        }}
                                        disabled={regeneratingHero}
                                        style={{
                                            padding: '6px 12px',
                                            background: regeneratingHero ? '#9ca3af' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: regeneratingHero ? 'not-allowed' : 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {regeneratingHero ? '🔄 Regenerating...' : '🔄 Regenerate'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Second Image URL (Solution)</label>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    name="second_image"
                                    value={formData.second_image}
                                    onChange={handleChange}
                                    placeholder="URL for the solution/transformation image"
                                />
                                <small>Displayed before the Benefits section</small>
                            </div>
                            {formData.second_image && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                    <img
                                        src={formData.second_image}
                                        alt="Second image preview"
                                        style={{
                                            width: '200px',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!formData.hook) {
                                                alert('Please generate the article first to have a hook for image generation.');
                                                return;
                                            }
                                            setRegeneratingSecond(true);
                                            try {
                                                const res = await fetch('/api/regenerate-images', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        hook: formData.hook,
                                                        productUrl,
                                                        productImages: productImages.length > 0 ? productImages : null,
                                                        productDescription,
                                                        productTitle: formData.title,
                                                        imageIndex: 1 // Only regenerate second image
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success && data.images && data.images[1]) {
                                                    setFormData(prev => ({ ...prev, second_image: data.images[1].url || data.images[1] }));
                                                }
                                            } catch (error) {
                                                console.error('Error:', error);
                                                alert('Failed to regenerate image');
                                            } finally {
                                                setRegeneratingSecond(false);
                                            }
                                        }}
                                        disabled={regeneratingSecond}
                                        style={{
                                            padding: '6px 12px',
                                            background: regeneratingSecond ? '#9ca3af' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: regeneratingSecond ? 'not-allowed' : 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {regeneratingSecond ? '🔄 Regenerating...' : '🔄 Regenerate'}
                                    </button>
                                </div>
                            )}
                        </div>
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

                    {/* Product Main Image */}
                    <h2 style={{ marginTop: '40px', marginBottom: '24px', color: '#111' }}>Product Display</h2>
                    <div className="form-group">
                        <label>Product Main Image (Displayed before final CTA)</label>
                        <input
                            type="text"
                            name="product_main_image"
                            value={formData.product_main_image}
                            onChange={handleChange}
                            placeholder="Image URL (auto-filled from Product Profile)"
                        />
                        {formData.product_main_image && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={formData.product_main_image}
                                    alt="Product Main"
                                    style={{ width: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        )}
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
                </form >
            )
            }
        </div >
    );
}
