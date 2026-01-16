import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './RoomsPage.css';

function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDescription, setNewRoomDescription] = useState('');
    const [editingRoom, setEditingRoom] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [message, setMessage] = useState('');
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            const response = await api.get('/rooms');
            setRooms(response.data);
        } catch (error) {
            setMessage('Error fetching rooms');
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        try {
            const response = await api.post('/rooms', {
                name: newRoomName,
                description: newRoomDescription
            });
            setMessage(response.data.message);
            setNewRoomName('');
            setNewRoomDescription('');
            fetchRooms();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating room');
        }
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        if (!editingRoom) return;

        try {
            const response = await api.put(`/rooms/${editingRoom.id}`, {
                name: editName,
                description: editDescription
            });
            setMessage(response.data.message);
            setEditingRoom(null);
            fetchRooms();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating room');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            const response = await api.delete(`/rooms/${roomId}`);
            setMessage(response.data.message);
            fetchRooms();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error deleting room');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }

        try {
            const response = await api.get(`/rooms/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error searching rooms');
        }
    };

    const startEditing = (room) => {
        setEditingRoom(room);
        setEditName(room.name);
        setEditDescription(room.description);
    };

    const cancelEditing = () => {
        setEditingRoom(null);
        setEditName('');
        setEditDescription('');
    };

    const displayRooms = searchResults ? searchResults.rooms : rooms;

    return (
        <div className="rooms-container">
            <h2>Chat Rooms</h2>
            
            {message && <p className="rooms-message">{message}</p>}

            <div className="rooms-search-section">
                <h3>Search Rooms</h3>
                <form onSubmit={handleSearch} className="rooms-search-form">
                    <input
                        type="text"
                        placeholder="Search pattern (e.g. 'gen' finds 'General')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rooms-search-input"
                    />
                    <button type="submit">Search</button>
                    <button type="button" onClick={() => { setSearchQuery(''); setSearchResults(null); }}>Clear</button>
                </form>
                {searchResults && (
                    <p className="rooms-search-results">
                        Found <strong>{searchResults.count}</strong> room(s) matching "<em>{searchResults.query}</em>"
                    </p>
                )}
            </div>

            {isLoggedIn && (
                <div className="rooms-create-section">
                    <h3>Create New Room</h3>
                    <form onSubmit={handleCreateRoom}>
                        <div className="rooms-form-group">
                            <input
                                type="text"
                                placeholder="Room name"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="rooms-form-input"
                                required
                            />
                        </div>
                        <div className="rooms-form-group">
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={newRoomDescription}
                                onChange={(e) => setNewRoomDescription(e.target.value)}
                                className="rooms-form-input"
                            />
                        </div>
                        <button type="submit">Create Room</button>
                    </form>
                </div>
            )}

            {editingRoom && (
                <div className="rooms-edit-section">
                    <h3>Edit Room: {editingRoom.name}</h3>
                    <form onSubmit={handleUpdateRoom}>
                        <div className="rooms-form-group">
                            <input
                                type="text"
                                placeholder="Room name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="rooms-form-input"
                                required
                            />
                        </div>
                        <div className="rooms-form-group">
                            <input
                                type="text"
                                placeholder="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="rooms-form-input"
                            />
                        </div>
                        <div className="rooms-edit-buttons">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={cancelEditing}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h3>{searchResults ? 'Search Results' : 'All Rooms'}</h3>
                {displayRooms.length === 0 ? (
                    <p>No rooms found.</p>
                ) : (
                    <ul className="rooms-list">
                        {displayRooms.map(room => (
                            <li key={room.id} className="rooms-list-item">
                                <div>
                                    <strong className="rooms-list-item-name">{room.name}</strong>
                                    {room.description && <p className="rooms-list-item-description">{room.description}</p>}
                                </div>
                                <div className="rooms-list-item-actions">
                                    <button onClick={() => navigate(`/chat/${room.name}`)}>Join</button>
                                    {isLoggedIn && (
                                        <>
                                            <button onClick={() => startEditing(room)}>Edit</button>
                                            <button onClick={() => handleDeleteRoom(room.id)} className="rooms-delete-btn">Delete</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default RoomsPage;
