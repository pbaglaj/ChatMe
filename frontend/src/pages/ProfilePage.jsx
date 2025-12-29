import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

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

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Loading profile data...</p>;
  }

  const isOwnProfile = currentUser && currentUser.user_id === profileData.user.user_id;

  return (
    <div className='container'>
      <h2>{isOwnProfile ? 'Your Profile' : `User Profile: ${profileData.user.username}`}</h2>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
        {isOwnProfile ? `Welcome ${profileData.user.username}!` : `User: ${profileData.user.username}`}
      </div>
      <p>ID: {profileData.user.user_id}</p>
    </div>
  );
}

export default ProfilePage;