'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../admin.css';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        main_image: '',
        images: []
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 3) {
            alert('Maximum 3 images allowed per product');
            return;
        }

        const imagePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(newImages => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }));
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setProducts([data.product, ...products]);
                setShowForm(false);
                setFormData({ name: '', url: '', description: '', images: [] });
                alert('Product saved successfully!');
            } else {
                alert('Error saving product: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert('Error deleting product');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-content">
                    <Link href="/admin" className="back-link">← Back to Dashboard</Link>
                    <h1>📦 Product Manager</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                        style={{ background: showForm ? '#ef4444' : '#2563eb' }}
                    >
                        {showForm ? 'Cancel' : '+ Add New Product'}
                    </button>
                </div>
            </header>

            <div className="content-wrapper">
                {showForm && (
                    <div className="form-container" style={{ marginBottom: '40px', border: '2px solid #bfdbfe' }}>
                        <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Swivo Magic Cloth"
                                />
                            </div>

                            <div className="form-group">
                                <label>Product URL *</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    required
                                    placeholder="https://myshop.com/products/magic-cloth"
                                />
                            </div>

                            <div className="form-group">
                                <label>Physical Description (for AI) *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe exactly what the product looks like. E.g., 'Blue microfiber cloth, 12x12 inches, waffle texture, yellow stitching edges.'"
                                    rows={3}
                                    required
                                    style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}
                                />
                                <small>This helps the AI generate accurate images that look like your actual product.</small>
                            </div>

                            <div className="form-group">
                                <label>Product Main Image (For Article Display)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({ ...prev, main_image: reader.result }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {formData.main_image && (
                                    <div style={{ marginTop: '10px', position: 'relative', width: 'fit-content' }}>
                                        <img
                                            src={formData.main_image}
                                            alt="Main Preview"
                                            style={{ width: '200px', height: 'auto', borderRadius: '8px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                                            style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                background: 'red',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <small>This image will appear in the article between the urgency box and the final CTA.</small>
                            </div>

                            <div className="form-group">
                                <label>Product Reference Images (Max 3 - For AI Generation)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {formData.images.map((img, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img
                                                src={img}
                                                alt="Preview"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                style={{
                                                    position: 'absolute',
                                                    top: -5,
                                                    right: -5,
                                                    background: 'red',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting}
                                style={{ width: '100%', marginTop: '20px' }}
                            >
                                {submitting ? 'Saving...' : 'Save Product Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {products.map(product => (
                            <div key={product.id} className="article-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                                    {product.images && product.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={product.name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }}
                                        />
                                    ))}
                                </div>

                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', height: '40px', overflow: 'hidden' }}>
                                    {product.description}
                                </p>

                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
                                >
                                    View Product Page →
                                </a>
                            </div>
                        ))}

                        {products.length === 0 && !loading && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
                                <p>No products saved yet. Add one to get started!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
