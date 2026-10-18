<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/client';

const nationalId = ref('9804125012345');
const entries = ref([]);
const loading = ref(false);
const searched = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  searched.value = !!nationalId.value;
  error.value = '';
  try {
    const { data } = await api.get('/audit-log', {
      params: nationalId.value ? { nationalId: nationalId.value } : {},
    });
    entries.value = data.entries;
  } catch (err) {
    error.value = 'Select a staff demo account in the toolbar to load the sharing log.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <h1>Notification Rules & Sharing Log</h1>
    <p class="muted">Every pull request and push notification across departments is logged here — the central proof of traceability.</p>
    <div class="alert error" v-if="error">{{ error }}</div>

    <div class="card">
      <div class="field" style="max-width: 320px;">
        <label for="filter">Filter by National ID</label>
        <input id="filter" v-model="nationalId" @keyup.enter="load" placeholder="e.g. 195501011000" />
      </div>
      <button class="btn secondary" @click="load" :disabled="loading">{{ loading ? 'Loading…' : 'Filter' }}</button>
    </div>

    <div class="card">
      <table class="data-table" v-if="entries.length">
        <thead>
          <tr><th>When</th><th>Actor</th><th>Department</th><th>Action</th><th>National ID</th></tr>
        </thead>
        <tbody>
          <tr v-for="e in entries" :key="e.id">
            <td>{{ e.timestamp }}</td>
            <td>{{ e.actorName }}</td>
            <td>{{ (e.department || '—').replace('_', ' ') }}</td>
            <td>{{ e.action.replace(/_/g, ' ').toLowerCase() }}</td>
            <td>{{ e.nationalId || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="muted" v-else>No log entries found.</p>
    </div>
  </div>
</template>
