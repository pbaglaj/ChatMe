const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Pobranie tokenu z nagłówka
    const authHeader = req.header('Authorization'); // Powinno być "Bearer <token>"
    
    // 2. Sprawdzenie, czy token istnieje
    if (!authHeader) {
        return res.status(401).json({ message: "Brak tokenu, autoryzacja nieudana" });
    }

    try {
        // 3. Oddzielenie "Bearer" od samego tokenu
        const token = authHeader.split(' ')[1];
        if (!token) {
             return res.status(401).json({ message: "Nieprawidłowy format tokenu" });
        }

        // 4. Weryfikacja tokenu
        // Używamy tego samego sekretu co przy logowaniu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Przypisanie danych użytkownika (z payload) do obiektu `req`
        // Dzięki temu każda kolejna funkcja (controller) będzie wiedziała,
        // który użytkownik wykonuje zapytanie.
        req.user = decoded.user;
        
        next(); // Przejdź dalej, wszystko OK

    } catch (err) {
        res.status(401).json({ message: "Token jest nieprawidłowy" });
    }
};