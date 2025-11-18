const bcrypt = require('bcrypt');
const db = require('../config/db');

// Logika rejestracji użytkownika POST /register
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Walidacja
        if (!username || !password) {
            return res.status(400).json({ message: "Nazwa użytkownika i hasło są wymagane" });
        }
        
        // Sprawdzenie, czy użytkownik już istnieje
        const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "Użytkownik o tej nazwie już istnieje" });
        }

        // Haszowanie hasła
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Zapis nowego użytkownika do bazy
        const newUser = await db.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
            [username, passwordHash]
        );

        res.status(201).json({
            message: "Użytkownik pomyślnie zarejestrowany",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
};


// Logika logowania użytkownika POST /login
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Walidacja
        if (!username || !password) {
            return res.status(400).json({ message: "Nazwa użytkownika i hasło są wymagane" });
        }

        // Znalezienie użytkownika w bazie
        const userResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
        }
        const user = userResult.rows[0];

        // Porównanie hasła z hashem w bazie
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
        }

        // Stworzenie tokenu JWT
        // W "payload" tokenu zapisujemy ID użytkownika.
        // Używamy sekretnego klucza z pliku .env
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token wygaśnie po 1 godzinie
        );

        // Odesłanie tokenu do klienta
        res.status(200).json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
};