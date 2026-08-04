import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { identifier: email, password }),
  forgotPassword: (identifier) => api.post('/auth/forgot-password', null, { params: { identifier } }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', null, { params: { token, newPassword } }),
};

export const userAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  changeRole: (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
  createLibrarian: (data) => api.post('/admin/users/create-librarian', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (keyword, params) => api.get('/books/search', { params: { keyword, ...params } }),
  getPopular: (limit = 10) => api.get('/books/popular', { params: { limit } }),
  add: (data) => api.post('/librarian/books', data),
  update: (id, data) => api.put(`/librarian/books/${id}`, data),
  delete: (id) => api.delete(`/librarian/books/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  add: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const borrowAPI = {
  getOverdue: () => api.get('/librarian/borrow/overdue'),
  getTodayLoans: () => api.get('/librarian/borrow/today'),
  getTodayReturns: () => api.get('/librarian/borrow/returns-today'),
  getAllActive: () => api.get('/librarian/borrow/all-active'),
};

export const reservationAPI = {
  getPending: () => api.get('/librarian/reservations/pending'),
};

export const fineAPI = {
  getAll: () => api.get('/librarian/fines/all'),
  getAllUnpaid: () => api.get('/librarian/fines/unpaid'),
  waive: (fineId, amount, reason) =>
    api.post(`/admin/fines/${fineId}/waive`, null, { params: { amount, reason } }),
  getStats: () => api.get('/librarian/fines/stats'),
};

export const reportAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getPopularBooks: (limit) => api.get('/admin/reports/popular-books', { params: { limit } }),
  getOverdueItems: () => api.get('/admin/reports/overdue-items'),
  getBorrowingByFaculty: () => api.get('/admin/reports/borrowing-by-faculty'),
  getUserActivity: () => api.get('/admin/reports/user-activity'),
  getInventory: () => api.get('/admin/reports/inventory'),
  getFineCollection: () => api.get('/admin/reports/fine-collection'),
};

export const ebookAPI = {
  getAllPublic: () => api.get('/ebooks/public/all'),
  upload: (formData) =>
    api.post('/librarian/ebooks/upload', formData, {
      headers: { 'Content-Type': undefined },
    }),
  delete: (id) => api.delete(`/librarian/ebooks/${id}`),
};

export const eventAPI = {
  getAll: () => api.get('/admin/events'),
  getUpcoming: () => api.get('/admin/events/upcoming'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/admin/events', data),
  update: (id, data) => api.put(`/admin/events/${id}`, data),
  toggleActive: (id) => api.patch(`/admin/events/${id}/toggle`),
  delete: (id) => api.delete(`/admin/events/${id}`),
};

export default api;
