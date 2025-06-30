import axios from 'axios';
import endpoints from '../utils/endpoints';

// Función para verificar si el token es válido
const isTokenValid = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }
    
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        return currentTime < expirationTime;
    } catch (error) {
        return false;
    }
};

const api = axios.create({
    baseURL: endpoints.baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const tokenValid = isTokenValid();
    
    if (token && tokenValid && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        if (token && !tokenValid) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }
    return config;
});

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expirado o inválido
            const currentPath = window.location.pathname;
            const isEditingOperation = currentPath.includes('/dashboard') && 
                                     (error.config?.method === 'put' || error.config?.method === 'post');
            
            if (!isEditingOperation && currentPath !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
