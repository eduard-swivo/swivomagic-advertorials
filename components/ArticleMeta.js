export default function ArticleMeta({ author = "Priya Sharma", date = "October 24, 2025", readTime = "4 min read" }) {
    return (
        <div className="article-meta">
            <div className="author-avatar-placeholder">
                {author.charAt(0)}
            </div>
            <div className="meta-info">
                <span className="author-name">By {author}</span>
                <span className="meta-divider">|</span>
                <span className="publish-date">{date}</span>
                <span className="meta-divider">|</span>
                <span className="read-time">{readTime}</span>
            </div>
        </div>
    );
}
