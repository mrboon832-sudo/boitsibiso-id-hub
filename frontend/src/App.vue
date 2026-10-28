<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useDemoStore } from './store/demo';
import { useI18n } from './i18n';
import { useAccessibilityStore } from './store/accessibility';
import { useAuthStore } from './store/auth';
import AccessibilityBar from './components/AccessibilityBar.vue';

const demo = useDemoStore();
const auth = useAuthStore();
const { t } = useI18n();
const accessibility = useAccessibilityStore();
const route = useRoute();
const router = useRouter();
const isPublicRoute = computed(() => ['/', '/login', '/register'].includes(route.path));
const ACCOUNT_SESSIONS_KEY = 'boitsibiso_account_sessions';
const accountSessions = ref(JSON.parse(localStorage.getItem(ACCOUNT_SESSIONS_KEY) || '{}'));
const rememberedCitizens = computed(() => Object.values(accountSessions.value).filter((session) => session.mode === 'real' && session.user?.role === 'citizen'));
const selectedAccount = computed(() => {
  if (localStorage.getItem('boitsibiso_auth_mode') === 'real' && auth.user?.role === 'citizen') return `citizen:${auth.user.nationalId}`;
  return demo.activeProfileKey;
});

function persistSessions() {
  localStorage.setItem(ACCOUNT_SESSIONS_KEY, JSON.stringify(accountSessions.value));
}

function rememberCurrentAccount(key) {
  const token = localStorage.getItem('boitsibiso_token');
  const user = JSON.parse(localStorage.getItem('boitsibiso_user') || 'null');
  if (!token || !user) return;
  accountSessions.value[key] = { token, user, mode: localStorage.getItem('boitsibiso_auth_mode') || 'demo', profileKey: localStorage.getItem('boitsibiso_token_profile') || null };
  persistSessions();
}

function restoreAccount(key) {
  const session = accountSessions.value[key];
  if (!session) return false;
  localStorage.setItem('boitsibiso_token', session.token);
  localStorage.setItem('boitsibiso_user', JSON.stringify(session.user));
  localStorage.setItem('boitsibiso_auth_mode', session.mode);
  if (session.profileKey) localStorage.setItem('boitsibiso_token_profile', session.profileKey);
  else localStorage.removeItem('boitsibiso_token_profile');
  auth.$patch({ token: session.token, user: session.user });
  demo.backendReady = true;
  return true;
}

async function switchAccount(value) {
  rememberCurrentAccount(selectedAccount.value);
  if (value.startsWith('citizen:')) {
    restoreAccount(value);
    await router.push('/citizen/dashboard');
    return;
  }
  demo.setActiveProfile(value);
  const restored = restoreAccount(value);
  if (!restored) auth.$patch({ token: null, user: null });
  const target = demo.activeProfile.role === 'citizen' ? '/citizen/dashboard' : '/staff/dashboard';
  await router.push(target);
}

watch(() => auth.user, (user) => {
  if (user?.role === 'citizen' && localStorage.getItem('boitsibiso_auth_mode') === 'real') {
    rememberCurrentAccount(`citizen:${user.nationalId}`);
  }
}, { deep: true, immediate: true });
</script>

<template>
  <div class="sr-only" aria-live="polite" aria-atomic="true">{{ accessibility.liveMessage }}</div>
  <AccessibilityBar />
  <div class="topbar" v-if="!isPublicRoute && route.path !== '/ussd'">
    <router-link class="brand" to="/">
      <img class="app-brand-logo" src="/boitsibiso-logo.png" alt="" />
      Boitsibiso National ID Hub — Demo Screenshot Mode
    </router-link>
    <nav>
      <router-link to="/citizen/dashboard">{{ t('citizenNav') }}</router-link>
      <router-link to="/staff/dashboard">{{ t('staffNav') }}</router-link>
      <router-link to="/ussd">{{ t('navUssd') }}</router-link>
      <select class="profile-select" :value="selectedAccount" @change="switchAccount($event.target.value)" :aria-label="t('demoAccount')">
        <optgroup label="Citizens">
          <option v-for="profile in demo.citizenProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
          <option v-for="citizen in rememberedCitizens" :key="`citizen-${citizen.user.nationalId}`" :value="`citizen:${citizen.user.nationalId}`">{{ citizen.user.fullName }} — {{ citizen.user.nationalId }}</option>
        </optgroup>
        <optgroup label="Staff departments">
          <option v-for="profile in demo.staffProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
        </optgroup>
      </select>
    </nav>
  </div>
  <!-- Staff sidebar removed: staff navigation is handled by the top account switcher and screen links.
    <button type="button" class="sidebar-collapse" :aria-expanded="!sidebarCollapsed" aria-label="Toggle staff menu" @click="toggleSidebar">{{ sidebarCollapsed ? '›' : '‹' }}</button>
    <button type="button" class="sidebar-back" @click="router.back()"><span class="sidebar-text">← Back</span><span class="sidebar-icon">←</span></button>
    <router-link class="sidebar-home" to="/staff/dashboard"><span class="sidebar-text">{{ t('homeAffairsHub') }}</span><span class="sidebar-icon">HA</span></router-link>
    <p class="sidebar-label sidebar-text">{{ t('departmentParticipants') }}</p>
    <router-link to="/staff/process-application"><span class="sidebar-icon">AP</span><span class="sidebar-text">{{ t('applicationProcessing') }}</span></router-link>
    <router-link to="/staff/verification-request"><span class="sidebar-icon">IV</span><span class="sidebar-text">{{ t('identityVerification') }}</span></router-link>
    <router-link to="/staff/passport-review"><span class="sidebar-icon">PR</span><span class="sidebar-text">{{ t('passportReviewLabel') }}</span></router-link>
    <router-link to="/staff/police-flags"><span class="sidebar-icon">PF</span><span class="sidebar-text">{{ t('policeFlagsLabel') }}</span></router-link>
    <router-link to="/staff/citizen-profile/9804125012345"><span class="sidebar-icon">CD</span><span class="sidebar-text">{{ t('citizenDocuments') }}</span></router-link>
    <router-link to="/staff/sharing-log"><span class="sidebar-icon">AL</span><span class="sidebar-text">{{ t('auditLog') }}</span></router-link>
  -->
  <main id="main">
    <router-view />
  </main>
</template>

