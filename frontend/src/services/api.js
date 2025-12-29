import axios from 'axios';

// Tworzy instancję klienta HTTP axios z bazowym adresem URL backendu.
// Dzięki temu nie trzeba wpisywać pełnego adresu przy każdym zapytaniu.
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Dodaje interceptor (przechwytywacz) do każdego wychodzącego zapytania.
// Sprawdza on, czy w localStorage istnieje token autoryzacyjny (JWT).
// Jeśli token istnieje, dodaje go do nagłówka 'Authorization' w formacie 'Bearer <token>'.
// Pozwala to na automatyczne uwierzytelnianie zapytań do chronionych endpointów API.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    
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