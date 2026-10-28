<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useDemoStore } from './store/demo';
import { useI18n } from './i18n';
import { useAccessibilityStore } from './store/accessibility';
import AccessibilityBar from './components/AccessibilityBar.vue';

const demo = useDemoStore();
const { t } = useI18n();
const accessibility = useAccessibilityStore();
const route = useRoute();
const router = useRouter();
const sidebarCollapsed = ref(localStorage.getItem('boitsibiso_staff_sidebar_collapsed') === '1');
const isPublicRoute = computed(() => route.path === '/' || route.path === '/login');
const isStaffRoute = computed(() => route.path.startsWith('/staff'));
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('boitsibiso_staff_sidebar_collapsed', sidebarCollapsed.value ? '1' : '0');
}
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
      <select class="profile-select" :value="demo.activeProfileKey" @change="demo.setActiveProfile($event.target.value)" :aria-label="t('demoAccount')">
        <optgroup label="Citizens">
          <option v-for="profile in demo.citizenProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
        </optgroup>
        <optgroup label="Staff departments">
          <option v-for="profile in demo.staffProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
        </optgroup>
      </select>
    </nav>
  </div>
  <aside v-if="isStaffRoute" class="staff-sidebar" :class="{ collapsed: sidebarCollapsed }" :aria-label="t('staffNav')">
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
  </aside>
  <main id="main" :class="{ 'staff-main': isStaffRoute, 'staff-main-collapsed': sidebarCollapsed }">
    <router-view />
  </main>
</template>

