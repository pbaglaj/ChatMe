const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const authMiddleware = require('../middleware/auth_middleware.js');

let sendNotificationToUser = null;

const setSendNotificationToUser = (fn) => {
    sendNotificationToUser = fn;
};

router.post('/:friend_user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const friendUserId = req.params.friend_user_id;

        const friendResult = await db.query(
            "SELECT id, username FROM users WHERE user_id = $1",
            [friendUserId]
        );

        if (friendResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendId = friendResult.rows[0].id;

        if (userId === friendId) {
            return res.status(400).json({ message: "Cannot add yourself as a friend" });
        }

        const existingFriend = await db.query(
            "SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2",
            [userId, friendId]
        );

        if (existingFriend.rows.length > 0) {
            return res.status(409).json({ message: "Already friends" });
        }

        await db.query(
            "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)",
            [userId, friendId]
        );

        const currentUserResult = await db.query(
            "SELECT username FROM users WHERE id = $1",
            [userId]
        );
        const currentUsername = currentUserResult.rows[0]?.username || 'Someone';

        if (sendNotificationToUser) {
            sendNotificationToUser(friendId, {
                type: 'friend_added',
                message: `${currentUsername} added you as a friend!`,
                from: currentUsername,
                time: new Date().toISOString()
            });
        }

        res.status(201).json({ message: "Friend added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT u.id, u.user_id, u.username 
             FROM friends f 
             JOIN users u ON f.friend_id = u.id 
             WHERE f.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            friends: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/status/:user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.user_id;

        const userResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetId = userResult.rows[0].id;

        const friendCheck = await db.query(
            "SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2",
            [userId, targetId]
        );

        res.status(200).json({
            isFriend: friendCheck.rows.length > 0
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
            `SELECT u.id, u.user_id, u.username 
             FROM friends f 
             JOIN users u ON f.friend_id = u.id 
             WHERE f.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            friends: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/:friend_user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const friendUserId = req.params.friend_user_id;

        const friendResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [friendUserId]
        );

        if (friendResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendId = friendResult.rows[0].id;

        await db.query(
            "DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
            [userId, friendId]
        );

        res.status(200).json({ message: "Friend removed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
module.exports.setSendNotificationToUser = setSendNotificationToUser;
