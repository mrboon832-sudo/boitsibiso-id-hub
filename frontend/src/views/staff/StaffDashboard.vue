<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const demo = useDemoStore();
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
    <h1>{{ roleLabels[demo.activeProfile.role] || 'Department' }} Dashboard</h1>
    <p class="muted">Demo account: {{ demo.activeProfile.label }}</p>

    <div class="alert error" v-if="error">{{ error }}</div>
    <p class="muted" v-if="loading">Loading…</p>
    <div class="grid-2" v-if="!loading && !error">
      <div class="card">
        <h2>Pending queue ({{ queue.filter(a => a.status === 'pending').length }})</h2>
        <p class="muted" v-if="!queue.length">No applications for your department yet.</p>
        <div v-for="a in queue.slice(0, 6)" :key="a.id" class="log-entry">
          <span class="log-who">{{ a.nationalId }} — {{ a.serviceType.replace(/_/g, ' ') }}</span>
          <span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span>
        </div>
      </div>

      <div class="card">
        <h2>Notifications received</h2>
        <p class="muted" v-if="notificationsNotice">{{ notificationsNotice }}</p>
        <p class="muted" v-else-if="!notifications.length">No push notifications yet.</p>
        <div v-for="n in notifications.slice(0, 6)" :key="n.id" class="log-entry">
          <span class="log-who">{{ n.nationalId }} — {{ n.type.replace(/_/g, ' ') }}</span>
          <span class="chip" :class="n.status">{{ n.status }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>All staff screens</h2>
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
