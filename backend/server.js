const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors()); 

app.use(express.json());

// In-memory store for messages (replace with DB)
const messages = {}; // { roomName: [ { user, text, time } ] }

// In-memory store for rooms
let rooms = [
    { id: 1, name: 'General', description: 'General chat room', createdAt: new Date().toISOString() },
    { id: 2, name: 'Random', description: 'Random discussions', createdAt: new Date().toISOString() }
];
let roomIdCounter = 3;

io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined the room: ${room}`);
        
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

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

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
    
    io.to(room).emit('message', newMessage);
    
    res.status(201).json(newMessage);
});

const db = require('./config/db.js');
const authController = require('./controllers/auth_controller.js');
const authMiddleware = require('./middleware/auth_middleware.js');

// AUTHENTICATION ENDPOINTS
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

// USER SEARCH ENDPOINT
app.get('/users/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        const searchPattern = `%${q}%`;
        
        const result = await db.query(
            "SELECT id, user_id, username FROM users WHERE username ILIKE $1",
            [searchPattern]
        );
        
        res.json({ 
            query: q,
            count: result.rows.length,
            users: result.rows 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ROOMS ENDPOINTS
app.post('/rooms', authMiddleware, (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Room name is required' });
    }
    
    const existingRoom = rooms.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (existingRoom) {
        return res.status(409).json({ message: 'Room with this name already exists' });
    }
    
    const newRoom = {
        id: roomIdCounter++,
        name,
        description: description || '',
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
    };
    
    rooms.push(newRoom);
    messages[name] = [];
    
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
});

app.get('/rooms', (req, res) => {
    res.json(rooms);
});

app.get('/rooms/search', (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'Search query is required' });
    }
    
    const pattern = q.toLowerCase();
    const foundRooms = rooms.filter(r => 
        r.name.toLowerCase().includes(pattern) || 
        r.description.toLowerCase().includes(pattern)
    );
    
    res.json({ 
        query: q,
        count: foundRooms.length,
        rooms: foundRooms 
    });
});

app.get('/rooms/:id', (req, res) => {
    const roomId = parseInt(req.params.id);
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
});

app.put('/rooms/:id', authMiddleware, (req, res) => {
    const roomId = parseInt(req.params.id);
    const { name, description } = req.body;
    
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
        return res.status(404).json({ message: 'Room not found' });
    }
    
    const oldName = rooms[roomIndex].name;
    
    if (name && name !== oldName) {
        const existingRoom = rooms.find(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== roomId);
        if (existingRoom) {
            return res.status(409).json({ message: 'Room with this name already exists' });
        }
        if (messages[oldName]) {
            messages[name] = messages[oldName];
            delete messages[oldName];
        }
    }
    
    rooms[roomIndex] = {
        ...rooms[roomIndex],
        name: name || rooms[roomIndex].name,
        description: description !== undefined ? description : rooms[roomIndex].description,
        updatedAt: new Date().toISOString()
    };
    
    res.json({ message: 'Room updated successfully', room: rooms[roomIndex] });
});

app.delete('/rooms/:id', authMiddleware, (req, res) => {
    const roomId = parseInt(req.params.id);
    
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
        return res.status(404).json({ message: 'Room not found' });
    }
    
    const roomName = rooms[roomIndex].name;
    rooms.splice(roomIndex, 1);
    
    if (messages[roomName]) {
        delete messages[roomName];
    }
    
    res.json({ message: 'Room deleted successfully' });
});

// PROFILE ENDPOINTS
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const userResult = await db.query(
            "SELECT id, user_id, username, bio FROM users WHERE id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];
        
        res.status(200).json({
            message: `Welcome, ${user.username}!`,
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;

        const userResult = await db.query(
            "UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, user_id, username, bio",
            [bio, userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/profile/:user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.user_id; 
        
        const userResult = await db.query(
            "SELECT id, user_id, username, bio FROM users WHERE user_id = $1", 
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        res.status(200).json({
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                bio: user.bio || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POSTS ENDPOINTS
app.post('/posts', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Post content is required" });
        }

        const result = await db.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id, user_id, content, created_at",
            [userId, content.trim()]
        );

        res.status(201).json({
            message: "Post created successfully",
            post: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/posts', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT p.id, p.content, p.created_at, u.username, u.user_id as author_user_id
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            posts: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/posts/:user_id', authMiddleware, async (req, res) => {
    try {
        const targetUserId = req.params.user_id;

        const userResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id;

        const result = await db.query(
            `SELECT p.id, p.content, p.created_at, u.username, u.user_id as author_user_id
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            posts: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/posts/:post_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.post_id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Post content is required" });
        }

        const postCheck = await db.query(
            "SELECT id FROM posts WHERE id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
        }

        const result = await db.query(
            "UPDATE posts SET content = $1 WHERE id = $2 RETURNING id, user_id, content, created_at",
            [content.trim(), postId]
        );

        res.status(200).json({
            message: "Post updated successfully",
            post: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/posts/:post_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.post_id;

        const postCheck = await db.query(
            "SELECT id FROM posts WHERE id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: "Post not found or you don't have permission to delete it" });
        }

        await db.query("DELETE FROM posts WHERE id = $1", [postId]);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// FRIENDS ENDPOINTS
app.post('/friends/:friend_user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const friendUserId = req.params.friend_user_id;

        const friendResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [friendUserId]
        );

        if (friendResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendId = friendResult.rows[0].id;

        if (userId === friendId) {
            return res.status(400).json({ message: "Cannot add yourself as a friend" });
        }

        const existingFriend = await db.query(
            "SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2",
            [userId, friendId]
        );

        if (existingFriend.rows.length > 0) {
            return res.status(409).json({ message: "Already friends" });
        }

        await db.query(
            "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)",
            [userId, friendId]
        );

        res.status(201).json({ message: "Friend added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/friends', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT u.id, u.user_id, u.username 
             FROM friends f 
             JOIN users u ON f.friend_id = u.id 
             WHERE f.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            friends: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/friends/status/:user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.user_id;

        const userResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetId = userResult.rows[0].id;

        const friendCheck = await db.query(
            "SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2",
            [userId, targetId]
        );

        res.status(200).json({
            isFriend: friendCheck.rows.length > 0
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/friends/:user_id', authMiddleware, async (req, res) => {
    try {
        const targetUserId = req.params.user_id;

        const userResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id;

        const result = await db.query(
            `SELECT u.id, u.user_id, u.username 
             FROM friends f 
             JOIN users u ON f.friend_id = u.id 
             WHERE f.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            friends: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/friends/:friend_user_id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const friendUserId = req.params.friend_user_id;

        const friendResult = await db.query(
            "SELECT id FROM users WHERE user_id = $1",
            [friendUserId]
        );

        if (friendResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendId = friendResult.rows[0].id;

        await db.query(
            "DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
            [userId, friendId]
        );

        res.status(200).json({ message: "Friend removed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (with WebSocket support)`);
});