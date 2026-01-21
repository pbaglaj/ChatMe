import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import "./ChatPage.css";

const SOCKET_URL = "https://localhost:3000";

function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [room, setRoom] = useState(id || "");
    const [isJoined, setIsJoined] = useState(!!id);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const chatMessagesRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

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

        socket.on('userTyping', ({ username }) => {
            setTypingUsers((prev) => {
                if (!prev.includes(username)) {
                    return [...prev, username];
                }
                return prev;
            });
        });

        socket.on('userStopTyping', ({ username }) => {
            setTypingUsers((prev) => prev.filter(u => u !== username));
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

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        
        if (!socketRef.current) return;
        
        if (!isTypingRef.current && e.target.value.trim()) {
            isTypingRef.current = true;
            socketRef.current.emit('typing', { room, username: user?.username });
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                socketRef.current?.emit('stopTyping', { room, username: user?.username });
            }
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !socketRef.current) return;

        if (isTypingRef.current) {
            isTypingRef.current = false;
            socketRef.current.emit('stopTyping', { room, username: user?.username });
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        socketRef.current.emit('chatMessage', {
            room,
            message: messageInput,
            username: user?.username || "Anonymous"
        });
        
        setMessageInput("");
    };

    if (error) {
        return <p className="chat-error">{error}</p>;
    }

    if (!isJoined) {
        return (
            <div className="join-room-container">
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
                <div id="chat-screen" className="chat-hidden"></div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div id="login-screen" className="chat-hidden"></div>
            <div id="chat-screen">
                <h2 id="room-name-display">Room: {room}</h2>
                <p className="chat-user-info">
                    Logged in as: <strong>{user?.username}</strong>
                    <span className={`chat-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        ● {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </p>
                <div 
                    id="chat-messages" 
                    ref={chatMessagesRef}
                    className="chat-messages"
                >
                    {messages.map((msg, index) => {
                        const isOwnMessage = msg.user === user?.username;
                        return (
                            <div 
                                key={index} 
                                className={`chat-message ${msg.user === 'System' ? 'system-msg' : 'user-msg'} ${isOwnMessage ? 'own' : 'other'}`}
                            >
                                {msg.user === 'System' ? (
                                    <p className="chat-system-text">{msg.text}</p>
                                ) : (
                                    <div className={`chat-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                                        <p className="chat-meta">
                                            {msg.user} <span>{msg.time ? new Date(msg.time).toLocaleTimeString() : ''}</span>
                                        </p>
                                        <p className="chat-text">{msg.text}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        <span className="typing-dots">
                            <span></span><span></span><span></span>
                        </span>
                        {typingUsers.length === 1 
                            ? `${typingUsers[0]} is typing...`
                            : typingUsers.length === 2
                            ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                            : `${typingUsers.length} people are typing...`
                        }
                    </div>
                )}
                <form id="chat-form" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        id="msg" 
                        placeholder="Type a message..." 
                        value={messageInput}
                        onChange={handleInputChange}
                        required 
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;