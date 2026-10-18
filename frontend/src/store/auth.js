import { defineStore } from 'pinia';
import api from '../api/client';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('boitsibiso_token') || null,
    user: JSON.parse(localStorage.getItem('boitsibiso_user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role,
    isCitizen: (state) => state.user?.role === 'citizen',
    isStaff: (state) => !!state.user && state.user.role !== 'citizen',
  },
  actions: {
    async login(username, password) {
      const { data } = await api.post('/auth/login', { username, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('boitsibiso_token', data.token);
      localStorage.setItem('boitsibiso_user', JSON.stringify(data.user));
      return data.user;
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('boitsibiso_token');
      localStorage.removeItem('boitsibiso_user');
    },
    async updatePreferences(prefs) {
      const { data } = await api.put('/auth/preferences', prefs);
      this.user = data.user;
      localStorage.setItem('boitsibiso_user', JSON.stringify(data.user));
    },
  },
});
