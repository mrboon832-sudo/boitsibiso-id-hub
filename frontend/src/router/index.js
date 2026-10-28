import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/Landing.vue') },
  { path: '/demo', name: 'demo-home', component: () => import('../views/DemoHome.vue') },
  { path: '/ussd', name: 'ussd', component: () => import('../views/citizen/Ussd.vue') },

  { path: '/citizen/dashboard', name: 'citizen-dashboard', meta: { roles: ['citizen'] }, component: () => import('../views/citizen/Dashboard.vue') },
  { path: '/citizen/request-service', name: 'citizen-request-service', meta: { roles: ['citizen'] }, component: () => import('../views/citizen/RequestService.vue') },
  { path: '/citizen/tracking', name: 'citizen-tracking', meta: { roles: ['citizen'] }, component: () => import('../views/citizen/Tracking.vue') },
  { path: '/citizen/accessibility', name: 'citizen-accessibility', meta: { roles: ['citizen'] }, component: () => import('../views/citizen/Accessibility.vue') },

  { path: '/staff/dashboard', name: 'staff-dashboard', meta: { roles: ['home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'] }, component: () => import('../views/staff/StaffDashboard.vue') },
  { path: '/staff/process-application', name: 'staff-process-application', meta: { roles: ['home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'] }, component: () => import('../views/staff/ProcessApplication.vue') },
  { path: '/staff/citizen-profile/:nationalId', name: 'staff-citizen-profile', meta: { roles: ['home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'] }, component: () => import('../views/staff/CitizenProfile.vue') },
  { path: '/staff/sharing-log', name: 'staff-sharing-log', meta: { roles: ['home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'] }, component: () => import('../views/staff/SharingLog.vue') },
  { path: '/staff/verification-request', name: 'staff-verification-request', meta: { roles: ['traffic', 'pensions', 'police', 'passport', 'finance', 'admin'] }, component: () => import('../views/staff/VerificationRequest.vue') },
  { path: '/staff/police-flags', name: 'staff-police-flags', meta: { roles: ['police', 'passport', 'traffic', 'admin'] }, component: () => import('../views/staff/PoliceFlags.vue') },
  { path: '/staff/passport-review', name: 'staff-passport-review', meta: { roles: ['passport', 'admin'] }, component: () => import('../views/staff/PassportReview.vue') },

  { path: '/login', name: 'login', component: () => import('../views/citizen/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/citizen/Register.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.meta.roles || localStorage.getItem('boitsibiso_auth_mode') !== 'real') return true;
  const auth = useAuthStore();
  if (!auth.token || !auth.user) return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.roles.includes(auth.user.role)) return true;
  return auth.user.role === 'citizen' ? '/citizen/dashboard' : '/staff/dashboard';
});

export default router;
