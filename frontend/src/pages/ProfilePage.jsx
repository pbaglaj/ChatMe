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
        // If the ID in URL matches current user, we can use /profile or /profile/:user_id
        // Using /profile/:user_id for consistency if id is provided
        if (user_id && user_id !== 'undefined') {
             response = await api.get(`/profile/${user_id}`);
        } else {
             // Fallback if no ID (though route is /profile/:user_id now)
             response = await api.get('/profile');
        }
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się pobrać profilu');
      }
    };

    fetchProfile();
  }, [user_id]);

  // Auto-redirect to correct URL if user_id is undefined but we have the data
  useEffect(() => {
    if (profileData && (user_id === 'undefined' || !user_id)) {
        navigate(`/profile/${profileData.user.user_id}`, { replace: true });
    }
  }, [profileData, user_id, navigate]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Ładowanie danych profilu...</p>;
  }

  const isOwnProfile = currentUser && currentUser.user_id === profileData.user.user_id;

  return (
    <div className='container'>
      <h2>{isOwnProfile ? 'Twój Profil' : `Profil użytkownika ${profileData.user.username}`}</h2>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
        {isOwnProfile ? `Witaj ${profileData.user.username}!` : `Użytkownik: ${profileData.user.username}`}
      </div>
      <p>ID: {profileData.user.user_id}</p>
    </div>
  );
}

export default ProfilePage;