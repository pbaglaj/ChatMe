const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller.js');
const authMiddleware = require('../middleware/auth_middleware.js');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/check', async (req, res) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(200).json({ loggedIn: false });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const userId = verified.user.id;
        
        const userResult = await db.query(
            "SELECT id, user_id, username, bio FROM users WHERE id = $1",
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(200).json({ loggedIn: false });
        }
        
        const user = userResult.rows[0];
        res.status(200).json({
            loggedIn: true,
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });
    } catch (err) {
        res.status(200).json({ loggedIn: false });
    }
});

router.post('/logout', authMiddleware, (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
