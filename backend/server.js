const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

const app = express();

let server;
try {
    server = https.createServer(sslOptions, app);
    console.log('HTTPS server created with TLS');
} catch (err) {
    console.warn('SSL certificates not found, falling back to HTTP');
    server = http.createServer(app);
}

const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:5173", "https://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.use(cors({
    origin: ["http://localhost:5173", "https://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
})); 

app.use(express.json());

const sseClients = new Map();

function sendNotificationToUser(userId, notification) {
    const client = sseClients.get(userId);
    if (client) {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
}

const authRoutes = require('./api/auth.js');
const usersRoutes = require('./api/users.js');
const roomsRoutes = require('./api/rooms.js');
const profileRoutes = require('./api/profile.js');
const postsRoutes = require('./api/posts.js');
const friendsRoutes = require('./api/friends.js');
const notificationsRoutes = require('./api/notifications.js');
const messagesRoutes = require('./api/messages.js');

postsRoutes.setSendNotificationToUser(sendNotificationToUser);
friendsRoutes.setSendNotificationToUser(sendNotificationToUser);
notificationsRoutes.setSseClients(sseClients);
messagesRoutes.setIo(io);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);

const getMessages = () => roomsRoutes.getMessages();

io.on('connection', (socket) => {
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined the room: ${room}`);
        
        const messages = getMessages();
        const roomMessages = messages[room] || [];
        socket.emit('messageHistory', roomMessages);
        
        socket.to(room).emit('message', {
            user: 'System',
            text: 'New user joined the room',
            time: new Date().toISOString()
        });
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left the room: ${room}`);
        
        socket.to(room).emit('message', {
            user: 'System',
            text: 'User left the room',
            time: new Date().toISOString()
        });
    });

    socket.on('chatMessage', ({ room, message, username }) => {
        const messages = getMessages();
        const newMessage = {
            user: username,
            text: message,
            time: new Date().toISOString()
        };
        
        if (!messages[room]) {
            messages[room] = [];
        }
        messages[room].push(newMessage);
        
        io.to(room).emit('message', newMessage);
    });

    socket.on('typing', ({ room, username }) => {
        socket.to(room).emit('userTyping', { username });
    });

    socket.on('stopTyping', ({ room, username }) => {
        socket.to(room).emit('userStopTyping', { username });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
const PROTOCOL = server instanceof https.Server ? 'https' : 'http';
server.listen(PORT, () => {
    console.log(`Server running on ${PROTOCOL}://localhost:${PORT}`);
});
