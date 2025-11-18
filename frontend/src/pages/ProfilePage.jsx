import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfileData(response.data);
      } catch (err) {
        setError(err.response.data.message || 'Nie masz autoryzacji');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Ładowanie danych profilu...</p>;
  }

  return (
    <div className='container'>
      <h2>Twój Profil</h2>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Witaj {profileData.user.username}!</div>
    </div>
  );
}

export default ProfilePage;