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
  getAdvancedAnalytics: () => api.get('/admin/reports/advanced-analytics'),
};

export const ebookAPI = {
  getAllPublic: () => api.get('/ebooks/public/all'),
  search: (keyword, params) => api.get('/ebooks/public/search', { params: { keyword, ...params } }),
  getById: (id) => api.get(`/ebooks/public/${id}`),
  download: (id) => api.get(`/ebooks/download/${id}`, { responseType: 'blob' }),
  viewUrl: (id) => {
    const token = localStorage.getItem('admin_token');
    return `${API_URL}/ebooks/view/${id}${token ? `?auth=${token}` : ''}`;
  },
  upload: (formData) =>
    api.post('/librarian/ebooks/upload', formData, {
      headers: { 'Content-Type': undefined },
    }),
  update: (id, data) => api.put(`/librarian/ebooks/${id}`, data),
  delete: (id) => api.delete(`/librarian/ebooks/${id}`),
};

export const researchPapersAPI = {
  getAllPublic: () => api.get('/research-papers/public/all'),
  search: (keyword, params) => api.get('/research-papers/public/search', { params: { keyword, ...params } }),
  getById: (id) => api.get(`/research-papers/public/${id}`),
  download: (id) => api.get(`/research-papers/download/${id}`, { responseType: 'blob' }),
  viewUrl: (id) => `${API_URL}/research-papers/view/${id}`,
  upload: (formData) =>
    api.post('/librarian/research-papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/librarian/research-papers/${id}`),
};

export const pastPapersAPI = {
  getAllPublic: () => api.get('/past-papers/public/all'),
  getFilters: () => api.get('/past-papers/public/filters'),
  filter: (year, semester, degreeLevel, faculty, intakeBatch, searchModule) =>
    api.get('/past-papers/public/filter', { params: { year, semester, degreeLevel, faculty, intakeBatch, searchModule } }),
  getById: (id) => api.get(`/past-papers/public/${id}`),
  download: (id) => api.get(`/past-papers/download/${id}`, { responseType: 'blob' }),
  viewUrl: (id) => `${API_URL}/past-papers/view/${id}`,
  upload: (formData) =>
    api.post('/librarian/past-papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/librarian/past-papers/${id}`),
};

export const eventAPI = {
  getAllPublic: () => api.get('/events/public/all'),
  getAllAdmin: () => api.get('/admin/events/all'),
  getById: (id) => api.get(`/events/${id}`),
  getAll: () => api.get('/librarian/events'),
  getUpcoming: () => api.get('/librarian/events/upcoming'),
  create: (data) => api.post('/librarian/events', data),
  createWithImage: (data, bannerImage) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (bannerImage) formData.append('bannerImage', bannerImage);
    return api.post('/librarian/events/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => api.put(`/librarian/events/${id}`, data),
  updateWithImage: (id, data, bannerImage) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (bannerImage) formData.append('bannerImage', bannerImage);
    return api.put(`/librarian/events/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  toggleActive: (id) => api.patch(`/librarian/events/${id}/toggle`),
  delete: (id) => api.delete(`/librarian/events/${id}`),
};

export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  getPublicAnnouncements: () => api.get('/notifications/announcements/public'),
  sendBroadcast: (title, message, targetRole) =>
    api.post('/admin/notifications/broadcast', null, { params: { title, message, targetRole } }),
  sendUserMessage: (userId, title, message) =>
    api.post('/admin/notifications/send-user', null, { params: { userId, title, message } }),
};

export const configAPI = {
  getFaculties: () => api.get('/config/faculties'),
  getMemberTypes: () => api.get('/config/member-types'),
};

export const libraryHoursAPI = {
  getAll: () => api.get('/library-hours'),
  getById: (id) => api.get(`/library-hours/${id}`),
  getByDay: (day) => api.get(`/library-hours/day/${day}`),
  create: (data) => api.post('/librarian/library-hours', data),
  update: (id, data) => api.put(`/librarian/library-hours/${id}`, data),
  delete: (id) => api.delete(`/librarian/library-hours/${id}`),
};

export const contactInfoAPI = {
  getAll: () => api.get('/contact-info'),
  getActive: () => api.get('/contact-info/active'),
  getById: (id) => api.get(`/contact-info/${id}`),
  create: (data) => api.post('/librarian/contact-info', data),
  update: (id, data) => api.put(`/librarian/contact-info/${id}`, data),
  delete: (id) => api.delete(`/librarian/contact-info/${id}`),
};
