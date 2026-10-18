import axios from 'axios';
import { useDemoStore } from '../store/demo';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

async function ensureDemoToken() {
  const demo = useDemoStore();
  if (demo.backendReady && localStorage.getItem('boitsibiso_token')) {
    return;
  }

  const profile = demo.activeProfile;
  const { data } = await axios.post('http://localhost:4000/api/auth/login', {
    username: profile.username,
    password: profile.password,
  });
  localStorage.setItem('boitsibiso_token', data.token);
  localStorage.setItem('boitsibiso_user', JSON.stringify(data.user));
  demo.backendReady = true;
}

api.interceptors.request.use(async (config) => {
  await ensureDemoToken();
  config.headers.Authorization = `Bearer ${localStorage.getItem('boitsibiso_token')}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const demo = useDemoStore();
    const originalRequest = err.config || {};
    if (err.response?.status === 401 && !originalRequest.retryingDemoLogin) {
      demo.backendReady = false;
      originalRequest.retryingDemoLogin = true;
      await ensureDemoToken();
      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${localStorage.getItem('boitsibiso_token')}`,
      };
      return api.request(originalRequest);
    }
    return Promise.reject(err);
  }
);

export default api;
