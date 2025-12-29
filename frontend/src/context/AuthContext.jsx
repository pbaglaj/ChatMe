import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/profile');
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Auth check failed", error);
                    sessionStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (token) => {
        sessionStorage.setItem('token', token);
        try {
            const response = await api.get('/profile');
            console.log("Login profile response:", response.data); // Debug log
            setUser(response.data.user);
            navigate(`/profile/${response.data.user.user_id}`);
        } catch (error) {
            console.error("Login failed to fetch profile", error);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
