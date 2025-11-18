const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Pobranie tokenu z nagłówka
    const authHeader = req.header('Authorization'); // Powinno być "Bearer <token>"
    
    // Sprawdzenie, czy token istnieje
    if (!authHeader) {
        return res.status(401).json({ message: "Brak tokenu, autoryzacja nieudana" });
    }

    try {
        // Oddzielenie "Bearer" od samego tokenu
        const token = authHeader.split(' ')[1];
        if (!token) {
             return res.status(401).json({ message: "Nieprawidłowy format tokenu" });
        }

        // Weryfikacja tokenu
        // Używamy tego samego sekretu co przy logowaniu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Przypisanie danych użytkownika (z payload) do obiektu `req`
        req.user = decoded.user;
        
        next(); // wszystko OK

    } catch (err) {
        res.status(401).json({ message: "Token jest nieprawidłowy" });
    }
};