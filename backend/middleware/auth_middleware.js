const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: "Brak tokenu, autoryzacja nieudana" });
    }

    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
             return res.status(401).json({ message: "Nieprawidłowy format tokenu" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;
        
        next();

    } catch (err) {
        res.status(401).json({ message: "Token jest nieprawidłowy" });
    }
};