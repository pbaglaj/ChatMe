import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './SearchUsersPage.css';

function SearchUsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isLoggedIn } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error searching users');
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="search-users-login-prompt">
                <h2>Please log in to search for users</h2>
                <Link to="/login">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="search-users-container">
            <h2>Search Users</h2>
            <p className="search-users-description">
                Search for users by username pattern.
            </p>

            <form onSubmit={handleSearch} className="search-users-form">
                <div className="search-users-form-row">
                    <input
                        type="text"
                        placeholder="Enter search pattern..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-users-input"
                    />
                    <button type="submit" disabled={loading} className="search-users-submit-btn">
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && (
                <p className="search-users-error">
                    {error}
                </p>
            )}

            {searchResults && (
                <div className="search-users-results">
                    <h3>Results for "{searchResults.query}"</h3>
                    <p>Found <strong>{searchResults.count}</strong> user(s)</p>
                    
                    {searchResults.users.length === 0 ? (
                        <p>No users found matching your search.</p>
                    ) : (
                        <ul className="search-users-list">
                            {searchResults.users.map(user => (
                                <li key={user.id} className="search-users-list-item">
                                    <div>
                                        <strong>{user.username}</strong>
                                        <span className="search-users-user-id">
                                            ID: {user.user_id}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/profile/${user.user_id}`}
                                        className="search-users-profile-link"
                                    >
                                        View Profile
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchUsersPage;
