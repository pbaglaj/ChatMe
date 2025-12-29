import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

function ChatPage() {
    const { id } = useParams(); // id is the room name
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [room, setRoom] = useState(id || "");
    const [isJoined, setIsJoined] = useState(!!id);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const chatMessagesRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (id) {
            setRoom(id);
            setIsJoined(true);
        } else {
            setIsJoined(false);
            setRoom("");
        }
    }, [id]);

    useEffect(() => {
        if (!isJoined || !room) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            socket.emit('joinRoom', room);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
        });

        socket.on('messageHistory', (history) => {
            setMessages(history);
        });

        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.emit('leaveRoom', room);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isJoined, room]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleJoin = () => {
        if (room.trim()) {
            navigate(`/chat/${room}`);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !socketRef.current) return;

        socketRef.current.emit('chatMessage', {
            room,
            message: messageInput,
            username: user?.username || "Anonymous"
        });
        
        setMessageInput("");
    };

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!isJoined) {
        return (
            <>
                <div id="login-screen">
                    <h2>Join the chat</h2>
                    <input 
                        type="text" 
                        id="room" 
                        placeholder="Room name..." 
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required 
                    />
                    <button id="join-btn" onClick={handleJoin}>Join Room</button>
                </div>
                <div id="chat-screen" style={{ display: 'none' }}></div>
            </>
        );
    }

    return (
        <>
            <div id="login-screen" style={{ display: 'none' }}></div>
            <div id="chat-screen">
                <h2 id="room-name-display">Room: {room}</h2>
                <p style={{ color: '#666', marginBottom: 10 }}>
                    Logged in as: <strong>{user?.username}</strong>
                    <span style={{ marginLeft: 10, color: isConnected ? '#28a745' : '#dc3545' }}>
                        ● {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </p>
                <div 
                    id="chat-messages" 
                    ref={chatMessagesRef}
                    style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ddd', padding: 10, marginBottom: 10, background: '#fafafa' }}
                >
                    {messages.map((msg, index) => {
                        const isOwnMessage = msg.user === user?.username;
                        return (
                            <div 
                                key={index} 
                                className={`message ${msg.user === 'System' ? 'system-msg' : 'user-msg'}`}
                                style={{
                                    textAlign: isOwnMessage ? 'right' : 'left',
                                    marginBottom: 8
                                }}
                            >
                                {msg.user === 'System' ? (
                                    <p style={{ color: '#888', fontStyle: 'italic' }}>{msg.text}</p>
                                ) : (
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        borderRadius: 12,
                                        background: isOwnMessage ? '#007bff' : '#e9ecef',
                                        color: isOwnMessage ? '#fff' : '#000',
                                        maxWidth: '70%',
                                        textAlign: 'left'
                                    }}>
                                        <p className="meta" style={{ fontSize: 11, marginBottom: 4, opacity: 0.8 }}>
                                            {msg.user} <span>{msg.time ? new Date(msg.time).toLocaleTimeString() : ''}</span>
                                        </p>
                                        <p className="text" style={{ margin: 0 }}>{msg.text}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <form id="chat-form" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        id="msg" 
                        placeholder="Type a message..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        required 
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </>
    );
}

export default ChatPage;