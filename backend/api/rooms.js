const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth_middleware.js');

let rooms = [
    { id: 1, name: 'General', description: 'General chat room', createdAt: new Date().toISOString() },
    { id: 2, name: 'Random', description: 'Random discussions', createdAt: new Date().toISOString() }
];
let roomIdCounter = 3;

const messages = {};

const getRooms = () => rooms;
const getMessages = () => messages;

router.post('/', authMiddleware, (req, res) => {
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

router.get('/', (req, res) => {
    res.json(rooms);
});

router.get('/search', (req, res) => {
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

router.get('/:id', (req, res) => {
    const roomId = parseInt(req.params.id);
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
});

router.put('/:id', authMiddleware, (req, res) => {
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

router.delete('/:id', authMiddleware, (req, res) => {
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

module.exports = router;
module.exports.getRooms = getRooms;
module.exports.getMessages = getMessages;
