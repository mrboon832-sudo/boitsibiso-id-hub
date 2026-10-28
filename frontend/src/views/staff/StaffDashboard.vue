<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const { t } = useI18n();
const queue = ref([]);
const notifications = ref([]);
const loading = ref(true);
const error = ref('');
const notificationsNotice = ref('');

const roleLabels = {
  home_affairs: 'Home Affairs',
  traffic: 'Traffic',
  pensions: 'Pensions',
  police: 'Police',
  passport: 'Passport Services',
  finance: 'Finance',
  admin: 'Administrator',
};
const roleLabelKeys = {
  home_affairs: 'homeAffairs', traffic: 'traffic', pensions: 'pensions',
  police: 'police', passport: 'passportServices', finance: 'finance', admin: 'administrator',
};

async function load() {
  loading.value = true;
  error.value = '';
  notificationsNotice.value = '';
  try {
    const { data } = await api.get('/applications');
    queue.value = data.applications;
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load the staff queue.');
  }

  try {
    const { data } = await api.get('/notifications');
    notifications.value = data.notifications;
  } catch (err) {
    notifications.value = [];
    notificationsNotice.value = getApiErrorMessage(err, 'This department does not receive push notifications in the demo rules.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => demo.activeProfileKey, load);
</script>

<template>
  <div class="page">
    <h1>{{ t(roleLabelKeys[demo.activeProfile.role] || 'departmentFallback') }} {{ t('dashboard') }}</h1>
    <p class="muted">{{ t('demoAccountText') }} {{ demo.activeProfile.label }}</p>

    <div class="alert error" role="alert" v-if="error">{{ error }}</div>
    <p class="muted" v-if="loading">{{ t('loading') }}</p>
    <div class="grid-2" v-if="!loading && !error">
      <div class="card">
        <h2>{{ t('pendingQueue') }} ({{ queue.filter(a => a.status === 'pending').length }})</h2>
        <p class="muted" v-if="!queue.length">{{ t('noQueue') }}</p>
        <div v-for="a in queue.slice(0, 6)" :key="a.id" class="log-entry">
          <span class="log-who">{{ a.nationalId }} — {{ a.serviceType.replace(/_/g, ' ') }}</span>
          <span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('notificationsReceived') }}</h2>
        <p class="muted" v-if="notificationsNotice">{{ notificationsNotice }}</p>
        <p class="muted" v-else-if="!notifications.length">{{ t('noPush') }}</p>
        <div v-for="n in notifications.slice(0, 6)" :key="n.id" class="log-entry">
          <span class="log-who">{{ n.nationalId }} — {{ n.type.replace(/_/g, ' ') }}</span>
          <span class="chip" :class="n.status">{{ n.status }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>{{ t('allStaffScreens') }}</h2>
      <p class="muted">Open any department screen for documentation screenshots. Select the matching department account first where the backend enforces a role.</p>
      <div class="screen-links">
        <router-link to="/staff/process-application">Process Application</router-link>
        <router-link to="/staff/citizen-profile/9804125012345">Citizen Profile</router-link>
        <router-link to="/staff/sharing-log">Sharing Log</router-link>
        <router-link to="/staff/verification-request">Department Verification</router-link>
        <router-link to="/staff/passport-review">Passport Review</router-link>
        <router-link to="/staff/police-flags">Police Flags</router-link>
      </div>
    </div>
  </div>
</template>
