import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ── Centres ──────────────────────────────────────
export const centreApi = {
  getAll: () => api.get('/centres'),
  getById: (id) => api.get(`/centres/${id}`),
  create: (data) => api.post('/centres', data),
  update: (id, data) => api.put(`/centres/${id}`, data),
  remove: (id) => api.delete(`/centres/${id}`),
};

// ── Users ────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByCentre: (centreId) => api.get(`/users/centre/${centreId}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.put(`/users/${id}/change-password`, data),
  uploadProfileImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/users/${id}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Badges ───────────────────────────────────────
export const badgeApi = {
  getAll: () => api.get('/badges'),
  getById: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
  remove: (id) => api.delete(`/badges/${id}`),
  getSubBadgesByBadge: (badgeId) => api.get(`/badges/${badgeId}/sub-badges`),
  getSubBadgesByModule: (moduleId) => api.get(`/badges/sub-badges/module/${moduleId}`),
  getSubBadge: (id) => api.get(`/badges/sub-badges/${id}`),
  createSubBadge: (data) => api.post('/badges/sub-badges', data),
  updateSubBadge: (id, data) => api.put(`/badges/sub-badges/${id}`, data),
  deleteSubBadge: (id) => api.delete(`/badges/sub-badges/${id}`),
};

// ── Modules ──────────────────────────────────────
export const moduleApi = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/modules/${id}`),
  getByCentre: (centreId) => api.get(`/modules/centre/${centreId}`),
  getApproved: () => api.get('/modules/approved'),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  approve: (id) => api.put(`/modules/${id}/approve`),
  remove: (id) => api.delete(`/modules/${id}`),
};

// ── Game Groups ──────────────────────────────────
export const groupApi = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  getByCentre: (centreId) => api.get(`/groups/centre/${centreId}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members/${userId}`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  remove: (id) => api.delete(`/groups/${id}`),
};

// ── Progress ───────��─────────────────────────────
export const progressApi = {
  getProfile: (userId) => api.get(`/progress/profile/${userId}`),
  getBadgeProgress: (userId, badgeId) => api.get(`/progress/${userId}/badge/${badgeId}`),
  completeSubBadge: (data) => api.post('/progress/complete', data),
};

// ── Leaderboard ──────────────────────��───────────
export const leaderboardApi = {
  getGlobal: () => api.get('/leaderboard'),
  getByCentre: (centreId) => api.get(`/leaderboard/centre/${centreId}`),
};

// ── Levels ───────────────────────────────────────
export const levelApi = {
  getAll: () => api.get('/levels'),
  getById: (id) => api.get(`/levels/${id}`),
  create: (data) => api.post('/levels', data),
  update: (id, data) => api.put(`/levels/${id}`, data),
  remove: (id) => api.delete(`/levels/${id}`),
};

export default api;
