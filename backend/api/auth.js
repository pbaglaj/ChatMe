const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller.js');
const authMiddleware = require('../middleware/auth_middleware.js');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
