import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import './FriendsPanel.css';

function FriendsPanel({ getInitial, refreshTrigger, userId }) {
  const navigate = useNavigate();

  const [friendsList, setFriendsList] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await api.get(`/friends/${userId}`);
        setFriendsList(response.data.friends);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };

    fetchFriends();
  }, [refreshTrigger, userId]);

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">Friends</h3>
      {friendsList.length === 0 ? (
        <p className="no-content">No friends yet</p>
      ) : (
        <div className="friends-list">
          {friendsList.map(friend => (
            <div key={friend.id} className="friend-chip" onClick={() => navigate(`/profile/${friend.user_id}`)}>
              <div className="friend-avatar-small">{getInitial(friend.username)}</div>
              <span className="friend-name">{friend.username}</span>
            </div>
          ))}
        </div>
      )}
  </div>
  );
}

export default FriendsPanel;