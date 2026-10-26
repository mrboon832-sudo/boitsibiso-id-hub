<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const demo = useDemoStore();
const citizen = ref(null);
const applications = ref([]);
const shareFeed = ref([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [citizenRes, appsRes, feedRes] = await Promise.all([
      api.get('/citizens/me'),
      api.get('/applications'),
      api.get('/audit-log'),
    ]);
    citizen.value = citizenRes.data.citizen;
    applications.value = appsRes.data.applications;
    shareFeed.value = feedRes.data.entries.slice(0, 5);
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load your citizen dashboard.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => demo.activeProfileKey, load);
</script>

<template>
  <div class="page">
    <h1>Welcome, {{ citizen?.fullName || demo.activeProfile.label }}</h1>
    <p class="muted" v-if="loading">Loading your profile…</p>
    <div class="alert error" v-if="error">{{ error }}</div>

    <div class="grid-2" v-if="citizen">
      <div class="card">
        <h2>Profile summary</h2>
        <p><strong>National ID:</strong> {{ citizen.nationalId }}</p>
        <p><strong>Status:</strong> <span class="chip" :class="citizen.status">{{ citizen.status }}</span></p>
        <p><strong>District:</strong> {{ citizen.district }}</p>
        <p><strong>Phone:</strong> {{ citizen.phone }}</p>
      </div>

      <div class="card">
        <h2>Quick actions</h2>
        <router-link class="btn block" to="/citizen/request-service">Request a Service</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/tracking">Track My Applications</router-link>
      </div>

      <div class="card">
        <h2>Active applications</h2>
        <p class="muted" v-if="!applications.length">No applications yet.</p>
        <div v-for="a in applications.slice(0, 4)" :key="a.id" class="log-entry">
          <span class="log-who">{{ a.serviceType.replace(/_/g, ' ') }} ({{ a.department.replace('_', ' ') }})</span>
          <span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span>
        </div>
      </div>

      <div class="card">
        <h2>Who has accessed my data</h2>
        <p class="muted" v-if="!shareFeed.length">No data-sharing activity yet.</p>
        <div v-for="e in shareFeed" :key="e.id" class="log-entry">
          <span class="log-who">{{ (e.department || 'system').replace('_', ' ') }} — {{ e.action.replace(/_/g, ' ').toLowerCase() }}</span>
          <span class="log-when">{{ e.timestamp }}</span>
        </div>
        <router-link class="mt-1" style="display:inline-block" to="/citizen/tracking">View full log →</router-link>
      </div>
    </div>
  </div>
</template>
