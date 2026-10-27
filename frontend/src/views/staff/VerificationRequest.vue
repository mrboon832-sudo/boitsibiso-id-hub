<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const demo = useDemoStore();
const nationalId = ref('9804125012345');
const purpose = ref('');
const result = ref(null);
const history = ref([]);
const error = ref('');
const loading = ref(false);

async function loadHistory() {
  error.value = '';
  try {
    const { data } = await api.get('/verification-requests');
    history.value = data.requests;
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load verification history.');
  }
}
onMounted(loadHistory);
watch(() => demo.activeProfileKey, loadHistory);

async function requestVerification() {
  error.value = '';
  result.value = null;
  if (!nationalId.value || !purpose.value) {
    error.value = 'National ID and purpose are required.';
    return;
  }
  loading.value = true;
  try {
    const { data } = await api.post('/verification-requests', {
      nationalId: nationalId.value.trim(),
      purpose: purpose.value,
    });
    result.value = data.request;
    await loadHistory();
  } catch (err) {
    error.value = err.response?.data?.error || 'Verification request failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h1>Department Verification Request</h1>
    <p class="muted">Pull Core Identity Data from Home Affairs instead of asking the citizen for a certified copy. Demo account: {{ demo.activeProfile.label }}.</p>

    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <div class="card">
      <div class="field"><label>Citizen National ID</label><input v-model="nationalId" placeholder="e.g. 195501011000" /></div>
      <div class="field"><label>Purpose of request</label><input v-model="purpose" placeholder="e.g. Driver's license renewal identity confirmation" /></div>
      <button class="btn block" @click="requestVerification" :disabled="loading">{{ loading ? 'Requesting…' : 'Request verification' }}</button>
    </div>

    <div class="card" v-if="result">
      <h2>Core Identity Data received</h2>
      <table class="data-table">
        <tbody>
          <tr v-for="(v, k) in result.dataShared" :key="k"><th>{{ k }}</th><td>{{ v }}</td></tr>
        </tbody>
      </table>
      <p class="muted">Logged as a requested share at {{ result.respondedAt }}.</p>
    </div>

    <div class="card">
      <h2>Recent requests from your department</h2>
      <p class="muted" v-if="!history.length">No requests yet.</p>
      <div v-for="h in history" :key="h.id" class="log-entry">
        <span class="log-who">{{ h.nationalId }} — {{ h.purpose }}</span>
        <span class="log-when"><span class="chip" :class="h.status">{{ h.status }}</span> {{ h.requestedAt }}</span>
      </div>
    </div>
  </div>
</template>
