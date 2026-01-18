import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import './ProfilePage.css';

function ProfilePage() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  
  // Mock data
  const [friends] = useState([
    // { id: 1, user_id: 'usr_001', username: 'Alice' },
    // { id: 2, user_id: 'usr_002', username: 'Bob' },
    // { id: 3, user_id: 'usr_003', username: 'Charlie' },
  ]);

  const [posts] = useState([
    // { id: 1, content: 'Just joined ChatMe!', time: new Date(Date.now() - 3600000).toISOString() },
    // { id: 2, content: 'Great conversations in the chat rooms today!', time: new Date(Date.now() - 86400000).toISOString() },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (user_id && user_id !== 'undefined') {
          response = await api.get(`/profile/${user_id}`);
        } else {
          response = await api.get('/profile');
        }
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, [user_id]);

  useEffect(() => {
    if (profileData && (user_id === 'undefined' || !user_id)) {
      navigate(`/profile/${profileData.user.user_id}`, { replace: true });
    }
  }, [profileData, user_id, navigate]);

  const isOwnProfile = currentUser && profileData && currentUser.user_id === profileData.user.user_id;
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
  
  const formatTime = (isoString) => {
    const diffMs = new Date() - new Date(isoString);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
  };

  if (error) return <p className="profile-error">{error}</p>;
  if (!profileData) return <p className="profile-loading">Loading...</p>;

  return (
    <div className="profile-container">
      <ProfileHeader 
        username={profileData.user.username} 
        username_id={profileData.user.user_id}
        friends={friends}
        posts={posts}
        isOwnProfile={isOwnProfile}
      />

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

      <div className="profile-card">
        <h3 className="profile-card-title">Posts</h3>
        {posts.length === 0 ? (
          <p className="no-content">No posts yet</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item">
              <p className="post-content">{post.content}</p>
              <span className="post-time">{formatTime(post.time)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProfilePage;