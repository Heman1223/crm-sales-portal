import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for production
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
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

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updatePassword: (data) => api.put('/auth/password', data),
    uploadAvatar: (base64) => api.post('/auth/avatar', { avatar: base64 })
};

// Users API
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    getCities: () => api.get('/users/cities/list')
};

// Sales API
export const salesAPI = {
    getAll: (params) => api.get('/sales', { params }),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    update: (id, data) => api.put(`/sales/${id}`, data),
    delete: (id) => api.delete(`/sales/${id}`),
    getStats: () => api.get('/sales/stats'),
    approve: (id) => api.post(`/sales/${id}/approve`),
    reject: (id, rejectionReason) => api.post(`/sales/${id}/reject`, { rejectionReason })
};

// Services API
export const servicesAPI = {
    getAll: (params) => api.get('/services', { params }),
    getCategories: () => api.get('/services/categories'),
    getRateCard: (params) => api.get('/services/rate-card', { params }),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`)
};

// Analytics API
export const analyticsAPI = {
    getDashboard: (params) => api.get('/analytics/dashboard', { params }),
    getRevenue: () => api.get('/analytics/revenue'),
    getCities: (params) => api.get('/analytics/cities', { params }),
    getTopPerformers: (limit = 10, params = {}) => api.get('/analytics/top-performers', {
        params: { limit, ...params }
    }),
    getSalesDistribution: () => api.get('/analytics/sales-distribution'),
    getWeekly: () => api.get('/analytics/weekly'),
    getCityTeam: () => api.get('/analytics/city-team')
};

// Targets API
export const targetsAPI = {
    getAll: (params) => api.get('/targets', { params }),
    getCurrent: () => api.get('/targets/current'),
    getById: (id) => api.get(`/targets/${id}`),
    create: (data) => api.post('/targets', data),
    update: (id, data) => api.put(`/targets/${id}`, data),
    delete: (id) => api.delete(`/targets/${id}`)
};

export default api;
