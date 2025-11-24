export default function CommentSection() {
    const comments = [
        {
            id: 1,
            name: "Anjali Gupta",
            time: "2 days ago",
            text: "I was skeptical at first, but this actually works! My kitchen smells amazing now.",
            likes: 14
        },
        {
            id: 2,
            name: "Meera Patel",
            time: "3 days ago",
            text: "Finally something safe for my pets. The Lavender scent is divine.",
            likes: 23
        },
        {
            id: 3,
            name: "Sneha Reddy",
            time: "4 days ago",
            text: "Ordered the kit last week and it arrived in 2 days. The bottles are so high quality!",
            likes: 8
        },
        {
            id: 4,
            name: "Divya Singh",
            time: "5 days ago",
            text: "My husband usually hates cleaning smells, but he actually likes this one. Win-win!",
            likes: 19
        },
        {
            id: 5,
            name: "Kavita Joshi",
            time: "1 week ago",
            text: "Just threw away all my bleach. Never going back.",
            likes: 45
        }
    ];

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
