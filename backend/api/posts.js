const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const authMiddleware = require('../middleware/auth_middleware.js');

let postService;

router.setPostService = (service) => {
    postService = service;
};

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        const newPost = await postService.createPost(userId, content);

        res.status(201).json({ 
            message: "Post created successfully", 
            post: newPost 
        });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
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
