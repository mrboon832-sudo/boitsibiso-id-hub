<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const demo = useDemoStore();
const applications = ref([]);
const shareFeed = ref([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [appsRes, feedRes] = await Promise.all([
      api.get('/applications'),
      api.get('/audit-log'),
    ]);
    applications.value = appsRes.data.applications;
    shareFeed.value = feedRes.data.entries;
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load your application history.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => demo.activeProfileKey, load);
</script>

<template>
  <div class="page">
    <h1>Application Tracking</h1>
    <p class="muted">Showing records for {{ demo.activeProfile.label }}.</p>
    <p class="muted" v-if="loading">Loading…</p>
    <div class="alert error" v-if="error">{{ error }}</div>

    <template v-if="!loading && !error">
      <div class="card">
        <h2>Your applications</h2>
        <table class="data-table" v-if="applications.length">
          <thead>
            <tr><th>Service</th><th>Department</th><th>Channel</th><th>Status</th><th>Submitted</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in applications" :key="a.id">
              <td>{{ a.serviceType.replace(/_/g, ' ') }}</td>
              <td>{{ a.department.replace('_', ' ') }}</td>
              <td>{{ a.channel.toUpperCase() }}</td>
              <td><span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span></td>
              <td>{{ a.submittedAt }}</td>
            </tr>
          </tbody>
        </table>
        <p class="muted" v-else>No applications submitted yet.</p>
      </div>

      <div class="card">
        <h2>Data-sharing feed</h2>
        <p class="muted">Every time a department views or receives your data — whether you requested it (pull) or it happened automatically (push) — it's logged here for full transparency.</p>
        <div v-for="e in shareFeed" :key="e.id" class="log-entry">
          <span class="log-who">{{ (e.department || 'system').replace('_', ' ') }} — {{ e.action.replace(/_/g, ' ').toLowerCase() }}</span>
          <span class="log-when">{{ e.timestamp }}</span>
        </div>
        <p class="muted" v-if="!shareFeed.length">No activity recorded yet.</p>
      </div>
    </template>
  </div>
</template>
