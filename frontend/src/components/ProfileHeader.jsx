import React from 'react';
import './ProfileHeader.css';

function ProfileHeader({ username, username_id, bio='Nice to see you!', friends = [], posts = [], isOwnProfile }) {
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="profile-header">
        <div className="profile-avatar">{getInitial(username)}</div>
        <h1 className="profile-username">{username}</h1>
        <p className="profile-id">@{username_id}</p>
        <p className='profile-bio'>{bio}</p>
        
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
            <button>Edit Profile</button>
          ) : (
            <button>Add Friend</button>
          )}
        </div>
      </div>
  );
}

export default ProfileHeader;