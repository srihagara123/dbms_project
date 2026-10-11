// src/services/api.js
import axios from 'axios';

/**
 * Resolves the backend API base URL with full environment variable support.
 * Configurable via VITE_API_URL in .env or cloud deployment dashboards (Render, Vercel, Netlify).
 */
export const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
        const trimmed = envUrl.trim().replace(/\/+$/, '');
        return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }

    // Default for local development
    if (import.meta.env.DEV) {
        return 'http://localhost:5000/api';
    }

    // Default for deployed production
    return 'https://dbms-project-1-z1xy.onrender.com/api';
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30s timeout to allow for free-tier cloud backend wake-ups (Render cold starts)
});

// Automatically attach JWT token if it exists in localStorage
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses for clear error diagnostics
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(`[API Error ${error.response.status}] ${error.config?.url}:`, error.response.data);
        } else if (error.request) {
            console.error(`[API Network Error] Could not reach backend at ${getBaseURL()}:`, error.message);
        } else {
            console.error('[API Configuration Error]:', error.message);
        }
        return Promise.reject(error);
    }
);

export default API;
