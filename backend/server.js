const express = require('express');
const cors = require('cors');
const db = require('./config/db.js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const mqtt = require('mqtt');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: "https://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser());

const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem'))
};

const server = https.createServer(options, app);

const io = require('socket.io')(server, {
    cors: {
        origin: "https://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const authRoutes = require('./api/auth.js');
const usersRoutes = require('./api/users.js');
const roomsRoutes = require('./api/rooms.js');
const profileRoutes = require('./api/profile.js');
const postsRoutes = require('./api/posts.js');
const friendsRoutes = require('./api/friends.js');
const notificationsRoutes = require('./api/notifications.js');
const messagesRoutes = require('./api/messages.js');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);

const getMessages = () => roomsRoutes.getMessages();

const NotificationService = require('./services/NotificationService');
const PostService = require('./services/PostService');

const notifications = new NotificationService(new Map());
const postService = new PostService(db, notifications);

postsRoutes.setPostService(postService);
friendsRoutes.setSendNotificationToUser(notifications.send.bind(notifications));
notificationsRoutes.setNotificationService(notifications);
messagesRoutes.setIo(io);

io.on('connection', (socket) => {
    socket.on('joinRoom', (room) => {
        socket.join(room);
        
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
});

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
    reconnectPeriod: 5000,
    connectTimeout: 10000,
});

mqttClient.on('connect', () => {
    console.log('[MQTT] Connected to MQTT broker successfully');

    mqttClient.subscribe('users/+/status', (err) => {
        if (err) {
            console.error('[MQTT] Failed to subscribe to user status topics:', err);
        }
    });
});

mqttClient.on('error', (err) => {
    console.error('[MQTT] Connection error:', err.message);
});

mqttClient.on('offline', () => {
    console.log('[MQTT] Client is offline');
});

mqttClient.on('reconnect', () => {
    console.log('[MQTT] Attempting to reconnect...');
});

mqttClient.on('close', () => {
    console.log('[MQTT] Connection closed');
});

mqttClient.on('message', (topic, message) => {
    const userId = topic.split('/')[1];
    const status = message.toString();

    io.emit('userStatus', { userId, status });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});
