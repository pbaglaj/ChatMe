import React from "react";
import './FriendsPanel.css';

function FriendsPanel({ friends = [], formatTime }) {
  return (
    <div className="profile-card">
      <h3 className="profile-card-title">Friends</h3>
      {friends.length === 0 ? (
        <p className="no-content">No friends yet</p>
      ) : (
        <div className="friends-list">
          {friends.map(friend => (
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