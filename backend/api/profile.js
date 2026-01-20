const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const authMiddleware = require('../middleware/auth_middleware.js');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const userResult = await db.query(
            "SELECT id, user_id, username, bio FROM users WHERE id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];
        
        res.status(200).json({
            message: `Welcome, ${user.username}!`,
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.put('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;

        const userResult = await db.query(
            "UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, user_id, username, bio",
            [bio, userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/:user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.user_id; 
        
        const userResult = await db.query(
            "SELECT id, user_id, username, bio FROM users WHERE user_id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
