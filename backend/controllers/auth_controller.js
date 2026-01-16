const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "User with this username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, user_id, username",
            [username, passwordHash]
        );

        res.status(201).json({
            message: "User successfully registered",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const userResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Invalid login credentials" });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid login credentials" });
        }

        const payload = {
            user: {
                id: user.id,
                user_id: user.user_id
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};