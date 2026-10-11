// src/services/api.js
import axios from 'axios';

const API = axios.create({
    // Replace 'localhost' with your environment variable
    bbaseURL: 'https://dbms-ui-design.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Automatically attach JWT token if it exists in localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;