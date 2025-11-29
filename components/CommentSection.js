export default function CommentSection({ comments: dynamicComments }) {
    const defaultComments = [
        {
            id: 1,
            name: "Anjali Gupta",
            time: "2 days ago",
            text: "I was skeptical at first, but this actually works! My kitchen smells amazing now.",
            likes: 14
        },
        // ... (keep other defaults if needed, or just replace)
    ];

    // Use dynamic comments if available, otherwise default
    const comments = dynamicComments && dynamicComments.length > 0
        ? dynamicComments.map((c, i) => ({
            id: i,
            name: c.name,
            time: c.time,
            text: c.text,
            likes: c.likes || Math.floor(Math.random() * 50) + 5 // Random likes if not provided
        }))
        : defaultComments;

    return (
        <div className="comment-section">
            <h3>Comments ({comments.length})</h3>
            <div className="comment-list">
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment-avatar">
                            {comment.name.charAt(0)}
                        </div>
                        <div className="comment-content">
                            <div className="comment-header">
                                <span className="comment-author">{comment.name}</span>
                                <span className="comment-time">{comment.time}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                            <div className="comment-actions">
                                <span>Like</span> · <span>Reply</span> · <span className="likes">👍 {comment.likes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="comment-input-placeholder">
                <input type="text" placeholder="Write a comment..." disabled />
            </div>
        </div>
    );
}
