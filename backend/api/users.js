const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth_middleware.js');

router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        const searchPattern = `%${q}%`;
        
        const result = await db.query(
            "SELECT id, user_id, username FROM users WHERE username ILIKE $1",
            [searchPattern]
        );
        
        res.json({ 
            query: q,
            count: result.rows.length,
            users: result.rows 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/me', authMiddleware, async (req, res) => {
    const client = await db.connect();
    try {
        const userId = req.user.id;
        
        await client.query('BEGIN');
        
        await client.query('DELETE FROM posts WHERE user_id = $1', [userId]);
        
        await client.query('DELETE FROM friends WHERE user_id = $1 OR friend_id = $1', [userId]);
        
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }
        
        await client.query('COMMIT');
        
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});

router.put('/password', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const userResult = await db.query(
            "SELECT password_hash FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [newPasswordHash, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
