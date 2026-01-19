import React from 'react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import './ProfileHeader.css';

function ProfileHeader({ username, username_id, friendsCount = 0, posts = [], isOwnProfile, getInitial, onFriendAdded }) {
  const [editing, setEditing] = useState(false);
  const [bioText, setBioText] = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // for now store in localStorage (db in future)
  useEffect(() => {
    const savedBio = localStorage.getItem('bio_' + username_id) || 'This user has no bio yet.';
    setBioText(savedBio);
  }, [username_id]);

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (isOwnProfile || !username_id) return;
      try {
        const response = await api.get(`/friends/status/${username_id}`);
        setIsFriend(response.data.isFriend);
      } catch (error) {
        console.error('Failed to check friendship status:', error);
      }
    };
    checkFriendshipStatus();
  }, [username_id, isOwnProfile]);

  const handleBio = () => {
    localStorage.setItem('bio_' + username_id, bioText);
    setEditing(false);
  }

  const handleAddFriend = async () => {
    setIsLoading(true);
    setFriendMessage('');
    try {
      await api.post(`/friends/${username_id}`);
      setFriendMessage('Friend added!');
      setIsFriend(true);
      if (onFriendAdded) onFriendAdded();
    } catch (error) {
      if (error.response?.status === 409) {
        setFriendMessage('Already friends!');
        setIsFriend(true);
      } else {
        setFriendMessage('Failed to add friend');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleRemoveFriend = async () => {
    setIsLoading(true);
    setFriendMessage('');
    try {
      await api.delete(`/friends/${username_id}`);
      setFriendMessage('Friend removed');
      setIsFriend(false);
      if (onFriendAdded) onFriendAdded();
    } catch (error) {
      setFriendMessage('Failed to remove friend');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="profile-header">
        <div className="profile-avatar">{getInitial(username)}</div>
        <h1 className="profile-username">{username}</h1>
        <p className="profile-id">@{username_id}</p>
        <div className='profile-bio'>{editing ? (
          <input 
            type="text" 
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBio()}
            onBlur={handleBio}
            autoFocus
          />
        ) : (
          <p>{bioText}</p>
        )}</div>
        
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{friendsCount}</div>
            <div className="profile-stat-label">Friends</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{posts.length}</div>
            <div className="profile-stat-label">Posts</div>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <button onClick={() => isOwnProfile && setEditing(true)}>Edit Profile</button>
          ) : (
            <div>
              {isFriend ? (
                <button onClick={handleRemoveFriend} disabled={isLoading} className="remove-friend-btn">
                  {isLoading ? 'Removing...' : 'Remove Friend'}
                </button>
              ) : (
                <button onClick={handleAddFriend} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Friend'}
                </button>
              )}
              <p className='profile-friend-message'>{friendMessage}</p>
            </div>
          )}
        </div>
      </div>
  );
}

export default ProfileHeader;