const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
// const server = http.createServer(app);
// const io = require('socket.io')(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }
// });

// io.on('connection', (socket) => {
//     socket.on('joinRoom', (room) => {
//         socket.join(room);
//     });

//     socket.on('chatMessage', ({ room, message, username }) => {
//         io.to(room).emit('message', { username, text: message });
//     });
// });

app.use(cors()); 

app.use(express.json());

// In-memory store for messages (replace with DB in production)
const messages = {}; // { roomName: [ { user, text, time } ] }

app.get('/messages', (req, res) => {
    const { room } = req.query;
    if (!room) return res.status(400).json({ message: "Room is required" });
    const roomMessages = messages[room] || [];
    res.json(roomMessages);
});

app.post('/messages', (req, res) => {
    const { room, message, username } = req.body;
    if (!room || !message || !username) {
        return res.status(400).json({ message: "Missing fields" });
    }
    
    if (!messages[room]) {
        messages[room] = [];
    }
    
    const newMessage = {
        user: username,
        text: message,
        time: new Date().toISOString()
    };
    
    messages[room].push(newMessage);
    
    res.status(201).json(newMessage);
});

const db = require('./config/db.js');
const authController = require('./controllers/auth_controller.js');
const authMiddleware = require('./middleware/auth_middleware.js');

app.post('/register', authController.register);
app.post('/login', authController.login);

app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const userResult = await db.query(
            "SELECT id, user_id, username FROM users WHERE id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const user = userResult.rows[0];
        
        console.log("Fetched user for profile:", user); // Debug log

        res.status(200).json({
            message: `Witaj, ${user.username}!`,
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

app.get('/profile/:user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.user_id; 

        // Removed isNaN check as user_id might be a UUID or string
        
        const userResult = await db.query(
            "SELECT id, user_id, username FROM users WHERE user_id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            user: {
                id: user.id,
                user_id: user.user_id,
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