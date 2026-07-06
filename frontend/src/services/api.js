import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export const authAPI = {
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (identifier) => api.post('/auth/forgot-password', null, { params: { identifier } }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', null, { params: { token, newPassword } }),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (oldPassword, newPassword) =>
    api.post('/user/change-password', null, { params: { oldPassword, newPassword } }),
  searchUsers: (keyword) => api.get('/admin/users', { params: { keyword, size: 10 } }),
  getUserById: (id) => api.get(`/user/${id}`),
};

export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (keyword, params) => api.get('/books/search', { params: { keyword, ...params } }),
  advancedSearch: (params) => api.get('/books/advanced-search', { params }),
  getPopular: (limit = 10) => api.get('/books/popular', { params: { limit } }),
  getByCategory: (categoryId) => api.get(`/books/category/${categoryId}`),
  getByStatus: (status) => api.get(`/books/status/${status}`),
  add: (data) => api.post('/librarian/books', data),
  update: (id, data) => api.put(`/librarian/books/${id}`, data),
  delete: (id) => api.delete(`/librarian/books/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  add: (data) => api.post('/librarian/categories', data),
  update: (id, data) => api.put(`/librarian/categories/${id}`, data),
  delete: (id) => api.delete(`/librarian/categories/${id}`),
};

export const borrowAPI = {
  issue: (data) => api.post('/librarian/borrow/issue', data),
  return: (borrowId) => api.post(`/librarian/borrow/return/${borrowId}`),
  renew: (borrowId) => api.post(`/borrow/renew/${borrowId}`),
  getUserHistory: (userId) => api.get(`/borrow/user/${userId}`),
  getActiveLoans: (userId) => api.get(`/borrow/user/${userId}/active`),
  getOverdue: () => api.get('/librarian/borrow/overdue'),
  getTodayLoans: () => api.get('/librarian/borrow/today'),
  getTodayReturns: () => api.get('/librarian/borrow/returns-today'),
  getAllActive: () => api.get('/librarian/borrow/all-active'),
};

export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  cancel: (reservationId, userId) =>
    api.post(`/reservations/${reservationId}/cancel`, null, { params: { userId } }),
  getUserReservations: (userId) => api.get(`/reservations/user/${userId}`),
  getBookReservations: (bookId) => api.get(`/reservations/book/${bookId}`),
  getPending: () => api.get('/librarian/reservations/pending'),
};

export const fineAPI = {
  getUserFines: (userId) => api.get(`/fines/user/${userId}`),
  getUnpaidFines: (userId) => api.get(`/fines/user/${userId}/unpaid`),
  pay: (data) => api.post('/fines/pay', data),
  getAll: () => api.get('/librarian/fines/all'),
  getAllUnpaid: () => api.get('/librarian/fines/unpaid'),
  getStats: () => api.get('/librarian/fines/stats'),
  waive: (fineId, amount, reason) =>
    api.post(`/admin/fines/${fineId}/waive`, null, { params: { amount, reason } }),
};

export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

export const reportAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export const ebookAPI = {
  getAllPublic: () => api.get('/ebooks/public/all'),
  search: (keyword, params) => api.get('/ebooks/public/search', { params: { keyword, ...params } }),
  getById: (id) => api.get(`/ebooks/public/${id}`),
  download: (id) => api.get(`/ebooks/download/${id}`, { responseType: 'blob' }),
  upload: (formData) =>
    api.post('/librarian/ebooks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/librarian/ebooks/${id}`),
};

export const membershipAPI = {
  apply: (data, photo) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) formData.append('photo', photo);
    return api.post('/membership/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getMy: () => api.get('/membership/my'),
  getPending: () => api.get('/librarian/memberships/pending'),
  getAll: () => api.get('/librarian/memberships/all'),
  review: (id, data) => api.post(`/librarian/memberships/${id}/review`, data),
};

export const configAPI = {
  getFaculties: () => api.get('/config/faculties'),
  getMemberTypes: () => api.get('/config/member-types'),
};

export default api;
