import axios from 'axios';
import { useDemoStore } from '../store/demo';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

const demoLoginPromises = new Map();

async function ensureDemoToken() {
  const demo = useDemoStore();
  const token = localStorage.getItem('boitsibiso_token');
  const tokenProfile = localStorage.getItem('boitsibiso_token_profile');
  if (demo.backendReady && token && tokenProfile === demo.activeProfileKey) {
    return;
  }

  const existingLogin = demoLoginPromises.get(demo.activeProfileKey);
  if (existingLogin) {
    return existingLogin;
  }

  const profile = demo.activeProfile;
  const profileKey = demo.activeProfileKey;
  const loginPromise = axios.post('http://localhost:4000/api/auth/login', {
    username: profile.username,
    password: profile.password,
  }).then(({ data }) => {
    // A user can switch profiles while the login request is in flight.
    // Only commit the response if it still belongs to the selected profile.
    if (useDemoStore().activeProfileKey === profileKey) {
      localStorage.setItem('boitsibiso_token', data.token);
      localStorage.setItem('boitsibiso_user', JSON.stringify(data.user));
      localStorage.setItem('boitsibiso_token_profile', profileKey);
      demo.backendReady = true;
    }
  }).finally(() => {
    if (demoLoginPromises.get(profileKey) === loginPromise) {
      demoLoginPromises.delete(profileKey);
    }
  });
  demoLoginPromises.set(profileKey, loginPromise);
  return loginPromise;
}

export function getApiErrorMessage(error, fallback = 'The request failed.') {
  if (!error?.response) {
    return 'The backend is unavailable. Confirm that the API is running on port 4000 and that MySQL is connected.';
  }
  if (error.response.data?.error) return error.response.data.error;
  if (error.response.status === 401) return 'Your demo session could not be authenticated. Please select the profile again.';
  if (error.response.status === 403) return 'This demo profile is not authorised for this screen or action.';
  return fallback;
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
