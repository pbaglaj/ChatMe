const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
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

module.exports = router;
