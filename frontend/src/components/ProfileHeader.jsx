import React from 'react';
import { useState, useEffect } from 'react';
import './ProfileHeader.css';

function ProfileHeader({ username, username_id, friends = [], posts = [], isOwnProfile }) {
  const [editing, setEditing] = useState(false);
  const [bioText, setBioText] = useState('');
  const [friendMessage, setFriendMessage] = useState('');

  // for now store in localStorage (db in future)
  useEffect(() => {
    const savedBio = localStorage.getItem('bio_' + username_id) || 'This user has no bio yet.';
    setBioText(savedBio);
  }, [username_id]);

  const handleBio = () => {
    localStorage.setItem('bio_' + username_id, bioText);
    setEditing(false);
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
  const handleAddFriend = () => {
    setFriendMessage('Friend request sent!');
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
            <div className="profile-stat-value">{friends.length}</div>
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
              <button onClick={handleAddFriend}>Add Friend</button>
              <p className='profile-friend-message'>{friendMessage}</p>
            </div>
          )}
        </div>
      </div>
  );
}

export default ProfileHeader;