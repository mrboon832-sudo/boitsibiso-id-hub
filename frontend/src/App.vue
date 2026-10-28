<script setup>
import { computed } from 'vue';
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
const isPublicRoute = computed(() => route.path === '/' || route.path === '/login');
const isStaffRoute = computed(() => route.path.startsWith('/staff'));
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
  <aside v-if="isStaffRoute" class="staff-sidebar" :aria-label="t('staffNav')">
    <button type="button" class="sidebar-back" @click="router.back()">← Back</button>
    <router-link class="sidebar-home" to="/staff/dashboard">Home Affairs hub</router-link>
    <p class="sidebar-label">Department participants</p>
    <router-link to="/staff/process-application">Application processing</router-link>
    <router-link to="/staff/verification-request">Identity verification</router-link>
    <router-link to="/staff/passport-review">Passport review</router-link>
    <router-link to="/staff/police-flags">Police flags</router-link>
    <router-link to="/staff/citizen-profile/9804125012345">Citizen documents</router-link>
    <router-link to="/staff/sharing-log">Sharing and audit log</router-link>
  </aside>
  <main id="main">
    <router-view />
  </main>
</template>

