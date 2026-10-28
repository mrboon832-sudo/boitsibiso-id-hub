import { defineStore } from 'pinia';

export const DEMO_PROFILES = {
  thabo: {
    key: 'thabo',
    label: 'Thabo — Citizen',
    username: '9804125012345',
    password: '9804125012345',
    role: 'citizen',
  },
  mamello: {
    key: 'mamello',
    label: "Mamello — Citizen",
    username: '8109236012346',
    password: '8109236012346',
    role: 'citizen',
  },
  homeAffairs: {
    key: 'homeAffairs',
    label: 'Home Affairs staff',
    username: 'ha.officer',
    password: 'Password123!',
    role: 'home_affairs',
  },
  traffic: {
    key: 'traffic',
    label: 'Traffic staff',
    username: 'traffic.officer',
    password: 'Password123!',
    role: 'traffic',
  },
  pensions: {
    key: 'pensions',
    label: 'Pensions staff',
    username: 'pensions.officer',
    password: 'Password123!',
    role: 'pensions',
  },
  police: {
    key: 'police',
    label: 'Police staff',
    username: 'police.officer',
    password: 'Password123!',
    role: 'police',
  },
  passport: {
    key: 'passport',
    label: 'Passport staff',
    username: 'passport.mokoena',
    password: 'Password123!',
    role: 'passport',
  },
  finance: {
    key: 'finance',
    label: 'Finance staff',
    username: 'finance.officer',
    password: 'Password123!',
    role: 'finance',
  },
  admin: {
    key: 'admin',
    label: 'Administrator',
    username: 'admin',
    password: 'Password123!',
    role: 'admin',
  },
};

export const useDemoStore = defineStore('demo', {
  state: () => ({
    activeProfileKey: localStorage.getItem('boitsibiso_demo_profile') || 'thabo',
    backendReady: false,
  }),
  getters: {
    activeProfile: (state) => DEMO_PROFILES[state.activeProfileKey] || DEMO_PROFILES.thabo,
    citizenProfiles: () => Object.values(DEMO_PROFILES).filter((profile) => profile.role === 'citizen'),
    staffProfiles: () => Object.values(DEMO_PROFILES).filter((profile) => profile.role !== 'citizen'),
  },
  actions: {
    setActiveProfile(key) {
      this.activeProfileKey = DEMO_PROFILES[key] ? key : 'thabo';
      this.backendReady = false;
      // A demo profile change is an authentication change. Do not let the
      // next request reuse the previous persona's token or user snapshot.
      localStorage.removeItem('boitsibiso_token');
      localStorage.removeItem('boitsibiso_user');
      localStorage.removeItem('boitsibiso_token_profile');
      localStorage.setItem('boitsibiso_auth_mode', 'demo');
      localStorage.setItem('boitsibiso_demo_profile', this.activeProfileKey);
    },
  },
});
