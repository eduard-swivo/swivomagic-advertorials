'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './admin.css';

export default function AdminDashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

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

    const initDatabase = async () => {
        try {
            const res = await fetch('/api/init-db');
            const data = await res.json();
            if (data.success) {
                setMessage('Database initialized successfully!');
            } else {
                setMessage('Database already initialized or error occurred');
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error initializing database:', error);
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
                    <button onClick={initDatabase} className="btn-secondary">
                        Initialize Database
                    </button>
                    <Link href="/admin/new" className="btn-primary">
                        + New Article
                    </Link>
                </div>
            </header>

            {message && (
                <div className="message-banner">{message}</div>
            )}

            <div className="articles-table">
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
                        {articles.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No articles yet. Click "Initialize Database" first, then create your first article!
                                </td>
                            </tr>
                        ) : (
                            articles.map((article) => (
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
