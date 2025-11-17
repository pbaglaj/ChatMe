import axios from 'axios';

// 1. Ustaw bazowy URL dla Twojego backendu
const api = axios.create({
  baseURL: 'http://localhost:5000', // Upewnij się, że port jest zgodny z Twoim backendem
});

// 2. Interceptor (przechwytywacz) zapytań
// Ta funkcja uruchomi się PRZED każdym wysłaniem zapytania
api.interceptors.request.use(
  (config) => {
    // Pobierz token z localStorage
    const token = localStorage.getItem('token');
    
    // Jeśli token istnieje, dodaj go do nagłówka Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;