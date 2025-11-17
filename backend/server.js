const express = require('express');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();

// Użyj cors
app.use(cors()); 

app.use(express.json());


const authController = require('./controllers/auth_controller.js');
const authMiddleware = require('./middleware/auth_middleware.js');

app.post('/register', authController.register);
app.post('/login', authController.login);

// Dostęp do niej będzie możliwy tylko z poprawnym tokenem JWT
app.get('/profile', authMiddleware, (req, res) => {
    res.json({
        message: `Witaj, użytkowniku o ID: ${req.user.id}!`,
        user: req.user
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});