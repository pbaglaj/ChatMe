const express = require('express');
const router = express.Router();
const roomsModule = require('./rooms.js');

let io = null;

const setIo = (socketIo) => {
    io = socketIo;
};

router.get('/', (req, res) => {
    const { room } = req.query;
    if (!room) return res.status(400).json({ message: "Room is required" });
    const messages = roomsModule.getMessages();
    const roomMessages = messages[room] || [];
    res.json(roomMessages);
});

router.post('/', (req, res) => {
    const { room, message, username } = req.body;
    if (!room || !message || !username) {
        return res.status(400).json({ message: "Missing fields" });
    }
    
    const messages = roomsModule.getMessages();
    
    if (!messages[room]) {
        messages[room] = [];
    }
    
    const newMessage = {
        user: username,
        text: message,
        time: new Date().toISOString()
    };
    
    messages[room].push(newMessage);
    
    if (io) {
        io.to(room).emit('message', newMessage);
    }
    
    res.status(201).json(newMessage);
});

module.exports = router;
module.exports.setIo = setIo;