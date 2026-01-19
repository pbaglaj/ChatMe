import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import FriendsPanel from '../../components/FriendsPanel/FriendsPanel';
import PostsPanel from '../../components/PostsPanel/PostsPanel';
import './ProfilePage.css';

function ProfilePage() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [friendsCount, setFriendsCount] = useState(0);
  const [refreshFriends, setRefreshFriends] = useState(0);

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
    const fetchFriendsCount = async () => {
      if (!profileData) return;
      try {
        const endpoint = `/friends/${profileData.user.user_id}`;
        const response = await api.get(endpoint);
        setFriendsCount(response.data.count);
      } catch (err) {
        console.error('Failed to fetch friends count:', err);
      }
    };
    fetchFriendsCount();
  }, [refreshFriends, profileData]);

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

  const handleFriendAdded = () => {
    setRefreshFriends(prev => prev + 1);
  };

  const handleBioUpdated = (newBio) => {
    setProfileData(prev => ({
      ...prev,
      user: { ...prev.user, bio: newBio }
    }));
  };

  if (error) return <p className="profile-error">{error}</p>;
  if (!profileData) return <p className="profile-loading">Loading...</p>;

  return (
    <div className="profile-container">
      <ProfileHeader 
        username={profileData.user.username} 
        username_id={profileData.user.user_id}
        bio={profileData.user.bio}
        friendsCount={friendsCount}
        posts={posts}
        isOwnProfile={isOwnProfile}
        getInitial={getInitial}
        onFriendAdded={handleFriendAdded}
        onBioUpdated={handleBioUpdated}
      />
      <FriendsPanel getInitial={getInitial} refreshTrigger={refreshFriends} userId={profileData.user.user_id}></FriendsPanel>
      <PostsPanel posts={posts} formatTime={formatTime}></PostsPanel>
    </div>
  );
}

export default ProfilePage;