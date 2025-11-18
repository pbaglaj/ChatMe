import axios from 'axios';

// bazowy URL dla backendu
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Ta funkcja uruchomi się PRZED każdym wysłaniem zapytania
api.interceptors.request.use(
  (config) => {
    // token z localStorage
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