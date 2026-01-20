const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const authMiddleware = require('../middleware/auth_middleware.js');

let sendNotificationToUser = null;

const setSendNotificationToUser = (fn) => {
    sendNotificationToUser = fn;
};

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Post content is required" });
        }

        const result = await db.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id, user_id, content, created_at",
            [userId, content.trim()]
        );

        const userResult = await db.query(
            "SELECT username FROM users WHERE id = $1",
            [userId]
        );
        const username = userResult.rows[0]?.username || 'Someone';

        const friendsResult = await db.query(
            "SELECT friend_id FROM friends WHERE user_id = $1",
            [userId]
        );

        if (sendNotificationToUser) {
            friendsResult.rows.forEach(friend => {
                sendNotificationToUser(friend.friend_id, {
                    type: 'new_post',
                    message: `${username} published a new post!`,
                    from: username,
                    postId: result.rows[0].id,
                    preview: content.trim().substring(0, 50) + (content.length > 50 ? '...' : ''),
                    time: new Date().toISOString()
                });
            });
        }

        res.status(201).json({
            message: "Post created successfully",
            post: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT p.id, p.content, p.created_at, u.username, u.user_id as author_user_id
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            posts: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/:user_id', authMiddleware, async (req, res) => {
    try {
        const targetUserId = req.params.user_id;

        const userResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id;

        const result = await db.query(
            `SELECT p.id, p.content, p.created_at, u.username, u.user_id as author_user_id
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            posts: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.put('/:post_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.post_id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Post content is required" });
        }

        const postCheck = await db.query(
            "SELECT id FROM posts WHERE id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
        }

        const result = await db.query(
            "UPDATE posts SET content = $1 WHERE id = $2 RETURNING id, user_id, content, created_at",
            [content.trim(), postId]
        );

        res.status(200).json({
            message: "Post updated successfully",
            post: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/:post_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.post_id;

        const postCheck = await db.query(
            "SELECT id FROM posts WHERE id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: "Post not found or you don't have permission to delete it" });
        }

        await db.query("DELETE FROM posts WHERE id = $1", [postId]);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
module.exports.setSendNotificationToUser = setSendNotificationToUser;
