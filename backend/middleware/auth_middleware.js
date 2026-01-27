const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: 'No access. Please log in.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.user;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};