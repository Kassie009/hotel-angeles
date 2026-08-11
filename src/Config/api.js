import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const MEDIA_BASE = API_URL.replace(/\/api\/?$/, '');

export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    return `${MEDIA_BASE}${path}`;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true 
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;