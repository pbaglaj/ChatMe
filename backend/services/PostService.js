class PostService {
    constructor(db, notificationService) {
        this.db = db;
        this.notificationService = notificationService;
    }

    async createPost(userId, content) {
        if (!content || content.trim() === '') {
            throw { status: 400, message: "Post content is required" };
        }

        const result = await this.db.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id, content, created_at",
            [userId, content.trim()]
        );
        const newPost = result.rows[0];

        const userRes = await this.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        const username = userRes.rows[0].username;

        const friendsRes = await this.db.query("SELECT friend_id FROM friends WHERE user_id = $1", [userId]);
        
        if (this.notificationService) {
            friendsRes.rows.forEach(friend => {
                this.notificationService.send(friend.friend_id, {
                    type: 'new_post',
                    message: `${username} published a new post!`,
                    from: username,
                    postId: newPost.id,
                    preview: content.trim().substring(0, 50) + (content.length > 50 ? '...' : ''),
                    time: new Date().toISOString()
                });
            });
        }

        return newPost;
    }
}

module.exports = PostService;