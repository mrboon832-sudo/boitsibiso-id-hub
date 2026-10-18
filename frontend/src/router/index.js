import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'demo-home', component: () => import('../views/DemoHome.vue') },
  { path: '/ussd', name: 'ussd', component: () => import('../views/citizen/Ussd.vue') },

  { path: '/citizen/dashboard', name: 'citizen-dashboard', component: () => import('../views/citizen/Dashboard.vue') },
  { path: '/citizen/request-service', name: 'citizen-request-service', component: () => import('../views/citizen/RequestService.vue') },
  { path: '/citizen/tracking', name: 'citizen-tracking', component: () => import('../views/citizen/Tracking.vue') },
  { path: '/citizen/accessibility', name: 'citizen-accessibility', component: () => import('../views/citizen/Accessibility.vue') },

  { path: '/staff/dashboard', name: 'staff-dashboard', component: () => import('../views/staff/StaffDashboard.vue') },
  { path: '/staff/process-application', name: 'staff-process-application', component: () => import('../views/staff/ProcessApplication.vue') },
  { path: '/staff/citizen-profile/:nationalId', name: 'staff-citizen-profile', component: () => import('../views/staff/CitizenProfile.vue') },
  { path: '/staff/sharing-log', name: 'staff-sharing-log', component: () => import('../views/staff/SharingLog.vue') },
  { path: '/staff/verification-request', name: 'staff-verification-request', component: () => import('../views/staff/VerificationRequest.vue') },
  { path: '/staff/police-flags', name: 'staff-police-flags', component: () => import('../views/staff/PoliceFlags.vue') },
  { path: '/staff/passport-review', name: 'staff-passport-review', component: () => import('../views/staff/PassportReview.vue') },

  { path: '/login', redirect: '/' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
