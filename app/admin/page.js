'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './admin.css';

export default function AdminDashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/articles');
            const data = await res.json();
            if (data.success) {
                setArticles(data.articles);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sort articles based on sortOrder
    const sortedArticles = [...articles].sort((a, b) => {
        const dateA = new Date(a.created_at || a.published_date);
        const dateB = new Date(b.created_at || b.published_date);

        if (sortOrder === 'newest') {
            return dateB - dateA; // Newest first
        } else {
            return dateA - dateB; // Oldest first
        }
    });

    const handleDelete = async (slug) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const res = await fetch(`/api/articles/${slug}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Article deleted successfully!');
                fetchArticles();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            setMessage('Error deleting article');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return <div className="admin-container"><p>Loading...</p></div>;
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Article Management</h1>
                <div className="admin-actions">
                    <button onClick={handleLogout} className="btn-secondary">
                        Logout
                    </button>
                    <Link href="/admin/products" className="btn-secondary" style={{ background: '#059669', color: 'white' }}>
                        📦 Manage Products
                    </Link>
                    <Link href="/admin/new" className="btn-primary">
                        + New Article
                    </Link>
                </div>
            </header>

            {message && (
                <div className="message-banner">{message}</div>
            )}

            <div className="articles-table">
                {/* Sort Control */}
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Sort by:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th>Slug</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedArticles.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No articles yet. Click "Initialize Database" first, then create your first article!
                                </td>
                            </tr>
                        ) : (
                            sortedArticles.map((article) => (
                                <tr key={article.id}>
                                    <td>{article.title}</td>
                                    <td>{article.category}</td>
                                    <td>{article.author}</td>
                                    <td>{article.published_date}</td>
                                    <td><code>{article.slug}</code></td>
                                    <td className="actions">
                                        <Link href={`/${article.slug}`} target="_blank" className="btn-view">
                                            View
                                        </Link>
                                        <Link href={`/admin/edit/${article.slug}`} className="btn-edit">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(article.slug)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
