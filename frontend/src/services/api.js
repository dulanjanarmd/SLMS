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
  searchUsers: (keyword) => api.get('/librarian/users', { params: { keyword, size: 10 } }),
  getUserById: (id) => api.get(`/user/${id}`),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  changeRole: (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
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
  addWithImage: (data, coverImage) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (coverImage) formData.append('coverImage', coverImage);
    return api.post('/librarian/books/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => api.put(`/librarian/books/${id}`, data),
  updateWithImage: (id, data, coverImage) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (coverImage) formData.append('coverImage', coverImage);
    return api.put(`/librarian/books/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
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
  requestRenewal: (borrowId) => api.post(`/borrow/renew/${borrowId}`),
  approveRenewal: (borrowId) => api.post(`/librarian/borrow/renew/${borrowId}/approve`),
  denyRenewal: (borrowId) => api.post(`/librarian/borrow/renew/${borrowId}/deny`),
  getRenewalRequests: () => api.get('/librarian/borrow/renewal-requests'),
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
  getActive: () => api.get('/librarian/reservations/active'),
  getById: (id) => api.get(`/librarian/reservations/${id}`),
  fulfill: (id) => api.put(`/librarian/reservations/${id}/fulfill`),
};

export const fineAPI = {
  getUserFines: (userId) => api.get(`/fines/user/${userId}`),
  getUnpaidFines: (userId) => api.get(`/fines/user/${userId}/unpaid`),
  pay: (data) => api.post('/fines/pay', data),
  getAll: () => api.get('/librarian/fines/all'),
  getAllUnpaid: () => api.get('/librarian/fines/unpaid'),
  getStats: () => api.get('/librarian/fines/stats'),
  waive: (fineId, amount, reason) =>
    api.post(`/librarian/fines/${fineId}/waive`, null, { params: { amount, reason } }),
};

export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

export const reportAPI = {
  getDashboardStats: () => api.get('/librarian/dashboard/stats'),
  getPopularBooks: (limit = 10) => api.get('/librarian/reports/popular-books', { params: { limit } }),
  getOverdueItems: () => api.get('/librarian/reports/overdue-items'),
  getInventory: () => api.get('/librarian/reports/inventory'),
  getFineCollection: () => api.get('/librarian/reports/fine-collection'),
  getUserActivity: () => api.get('/librarian/reports/user-activity'),
};

export const ebookAPI = {
  getAllPublic: () => api.get('/ebooks/public/all'),
  search: (keyword, params) => api.get('/ebooks/public/search', { params: { keyword, ...params } }),
  getById: (id) => api.get(`/ebooks/public/${id}`),
  download: (id) => api.get(`/ebooks/download/${id}`, { responseType: 'blob' }),
  viewUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/ebooks/view/${id}${token ? `?auth=${token}` : ''}`;
  },
  upload: (formData) =>
    api.post('/librarian/ebooks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
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
  filter: (year, semester, degreeLevel, faculty, intakeBatch, searchModule) => api.get('/past-papers/public/filter', { params: { year, semester, degreeLevel, faculty, intakeBatch, searchModule } }),
  getById: (id) => api.get(`/past-papers/public/${id}`),
  download: (id) => api.get(`/past-papers/download/${id}`, { responseType: 'blob' }),
  viewUrl: (id) => `${API_URL}/past-papers/view/${id}`,
  upload: (formData) =>
    api.post('/librarian/past-papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/librarian/past-papers/${id}`),
};

export const membershipAPI = {
  apply: (data, photo, studentIdCardPdf, nationalIdPdf) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) formData.append('photo', photo);
    if (studentIdCardPdf) formData.append('studentIdCardPdf', studentIdCardPdf);
    if (nationalIdPdf) formData.append('nationalIdPdf', nationalIdPdf);
    return api.post('/membership/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getMy: () => api.get('/membership/my'),
  getPending: () => api.get('/librarian/memberships/pending'),
  getAll: () => api.get('/librarian/memberships/all'),
  review: (id, data) => api.post(`/librarian/memberships/${id}/review`, data),
};

export const eventAPI = {
  getPublicUpcoming: () => api.get('/events/public'),
  getAllPublic: () => api.get('/events/public/all'),
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

export default api;
