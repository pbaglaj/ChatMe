const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

let sseClients = null;

const setSseClients = (clients) => {
    sseClients = clients;
};

router.get('/stream', async (req, res) => {
    try {
        const token = req.cookies?.auth_token || req.query.token || req.header('Authorization')?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const userId = decoded.user.id;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', 'https://localhost:5173');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`);

        if (sseClients) {
            sseClients.set(userId, res);
        }

        const heartbeatInterval = setInterval(() => {
            res.write(`data: ${JSON.stringify({ type: 'heartbeat', time: new Date().toISOString() })}\n\n`);
        }, 30000);

        req.on('close', () => {
            clearInterval(heartbeatInterval);
            if (sseClients) {
                sseClients.delete(userId);
            }
        });
    } catch (err) {
        console.error('SSE error:', err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
module.exports.setSseClients = setSseClients;
