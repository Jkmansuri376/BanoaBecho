import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  sendOtp: (phone) => api.post('/auth/otp/send', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/otp/verify', { phone, otp }),
  register: (userData) => api.post('/auth/register', userData),
  getDemoUsers: () => api.get('/auth/demo-users'),
  switchUser: (userId) => api.post('/auth/switch-user', { userId }),
};

export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id, params) => api.get(`/listings/${id}`, { params }),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
};

export const offersAPI = {
  getThread: (listingId, buyerId) => api.get(`/offers/thread/${listingId}/${buyerId}`),
  create: (data) => api.post('/offers', data),
  counter: (id, data) => api.post(`/offers/${id}/counter`, data),
  accept: (id, data) => api.post(`/offers/${id}/accept`, data),
  reject: (id) => api.post(`/offers/${id}/reject`),
  getMyOffers: (params) => api.get('/offers/my-offers', { params }),
};

export const ordersAPI = {
  buyNow: (data) => api.post('/orders/buy-now', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const ratingsAPI = {
  submit: (data) => api.post('/ratings', data),
  getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
};

export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  uploadFile: (formData) => api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
