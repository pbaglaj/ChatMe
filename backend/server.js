const express = require('express');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();

// Użyj cors
app.use(cors()); 

app.use(express.json());

const db = require('./config/db.js');
const authController = require('./controllers/auth_controller.js');
const authMiddleware = require('./middleware/auth_middleware.js');

app.post('/register', authController.register);
app.post('/login', authController.login);

// Dostęp do niej będzie możliwy tylko z poprawnym tokenem JWT
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const userResult = await db.query(
            "SELECT id, username FROM users WHERE id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            message: `Witaj, ${user.username}!`,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});