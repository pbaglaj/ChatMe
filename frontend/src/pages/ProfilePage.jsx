import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ta funkcja uruchomi się automatycznie po załadowaniu komponentu
    const fetchProfile = async () => {
      try {
        // Nasz interceptor z api.js automatycznie dołączy token
        const response = await api.get('/profile');
        setProfileData(response.data); // Ustaw dane profilu
      } catch (err) {
        // Jeśli token jest zły lub go nie ma, serwer zwróci błąd 401
        setError(err.response.data.message || 'Nie masz autoryzacji');
      }
    };

    fetchProfile();
  }, []); // Pusta tablica oznacza, że useEffect uruchomi się tylko raz

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Ładowanie danych profilu...</p>;
  }

  // Pokaż dane zwrócone z chronionego endpointu /profile
  return (
    <div>
      <h2>Twój Profil (Dane z serwera)</h2>
      <pre>{JSON.stringify(profileData, null, 2)}</pre>
    </div>
  );
}

export default ProfilePage;