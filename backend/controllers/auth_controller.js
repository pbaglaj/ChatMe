const AuthService = require('../services/AuthService');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const authService = new AuthService(db, bcrypt, jwt);

class AuthController {
    register = async (req, res) => {
        try {
            const { username, password } = req.body;

            const newUser = await authService.register(username, password);
            
            res.status(201).json({
                message: "User successfully registered",
                user: newUser
            });

        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };

    login = async (req, res) => {
        try {
            const { username, password } = req.body;

            const token = await authService.login(username, password);

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000, // 1 hour
                sameSite: 'lax'
            });

            res.status(200).json({ message: 'Login successful' });

        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
        }
    }
}

module.exports = new AuthController();