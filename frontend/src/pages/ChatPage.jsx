import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ChatPage() {
    const { id } = useParams(); // id is the room name
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [room, setRoom] = useState(id || "");
    const [isJoined, setIsJoined] = useState(!!id);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState("");
    const chatMessagesRef = useRef(null);

    // Przekierowanie na login jeśli użytkownik nie jest zalogowany
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

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages?room=${room}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };

        fetchMessages(); // Initial fetch
        const interval = setInterval(fetchMessages, 2000); // Poll every 2s

        return () => clearInterval(interval);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            await api.post('/messages', {
                room,
                message: messageInput,
                username: user?.username || "Anonymous"
            });
            setMessageInput("");
            // Fetch immediately to show the new message
            const res = await api.get(`/messages?room=${room}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!isJoined) {
        return (
            <>
                <div id="login-screen">
                    <h2>Dołącz do czatu</h2>
                    <input 
                        type="text" 
                        id="room" 
                        placeholder="Nazwa pokoju..." 
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required 
                    />
                    <button id="join-btn" onClick={handleJoin}>Wejdź do pokoju</button>
                </div>
                <div id="chat-screen" style={{ display: 'none' }}></div>
            </>
        );
    }

    return (
        <>
            <div id="login-screen" style={{ display: 'none' }}></div>
            <div id="chat-screen">
                <h2 id="room-name-display">Pokój: {room}</h2>
                <p style={{ color: '#666', marginBottom: 10 }}>Zalogowany jako: <strong>{user?.username}</strong></p>
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
                        placeholder="Wpisz wiadomość..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        required 
                    />
                    <button type="submit">Wyślij</button>
                </form>
            </div>
        </>
    );
}

export default ChatPage;