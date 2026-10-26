<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const demo = useDemoStore();
const applications = ref([]);
const loading = ref(true);
const updating = ref(null);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/applications');
    applications.value = data.applications;
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load applications.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => demo.activeProfileKey, load);

async function updateStatus(app, status) {
  updating.value = app.id;
  try {
    await api.put(`/applications/${app.id}`, { status });
    await load();
  } finally {
    updating.value = null;
  }
}
</script>

<template>
  <div class="page">
    <h1>Process Applications</h1>
    <p class="muted">Confirm identity, process the request, and move it forward. Death registrations automatically notify Pensions. Demo account: {{ demo.activeProfile.label }}.</p>

    <p class="muted" v-if="loading">Loading…</p>
    <div class="alert error" v-if="error">{{ error }}</div>
    <div class="card" v-if="!loading && !error">
      <table class="data-table" v-if="applications.length">
        <thead>
          <tr><th>National ID</th><th>Service</th><th>Channel</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in applications" :key="a.id">
            <td>
              <router-link :to="`/staff/citizen-profile/${a.nationalId}`">{{ a.nationalId }}</router-link>
            </td>
            <td>{{ a.serviceType.replace(/_/g, ' ') }}</td>
            <td>{{ a.channel.toUpperCase() }}</td>
            <td><span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span></td>
            <td>
              <select :value="a.status" @change="updateStatus(a, $event.target.value)" :disabled="updating === a.id">
                <option value="pending">Pending</option>
                <option value="in_review">In review</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="muted" v-else>No applications in your queue.</p>
    </div>
  </div>
</template>
