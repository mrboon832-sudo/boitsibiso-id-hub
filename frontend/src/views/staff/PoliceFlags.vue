<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const { t } = useI18n();
const nationalId = ref('9207157012347');
const flag = ref(null);
const flagType = ref('');
const severity = ref('medium');
const notes = ref('');
const error = ref('');
const success = ref('');
const requests = ref([]);
const loading = ref(false);

async function loadRequests() {
  error.value = '';
  try {
    const { data } = await api.get('/police-flags/requests/list');
    requests.value = data.requests;
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load police flag requests.');
  }
}
onMounted(loadRequests);
watch(() => demo.activeProfileKey, loadRequests);

async function checkFlag() {
  error.value = '';
  flag.value = null;
  if (!nationalId.value) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/police-flags/${nationalId.value.trim()}`);
    flag.value = data.flag;
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not check flag.';
  } finally {
    loading.value = false;
  }
}

async function addFlag() {
  error.value = '';
  success.value = '';
  if (!nationalId.value || !flagType.value) {
    error.value = 'National ID and flag type are required.';
    return;
  }
  try {
    await api.post('/police-flags', {
      nationalId: nationalId.value.trim(),
      flagType: flagType.value,
      severity: severity.value,
      notes: notes.value,
    });
    success.value = 'Flag added.';
    flagType.value = '';
    notes.value = '';
    await checkFlag();
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not add flag.';
  }
}

async function respond(reqId, status) {
  await api.put(`/police-flags/requests/${reqId}`, { status });
  await loadRequests();
}
</script>

<template>
  <div class="page">
    <h1>{{ t('policeFlags') }}</h1>
    <p class="muted">Police control disclosure — other departments only ever see whether a flag exists, never the case details.</p>

    <div class="alert error" role="alert" v-if="error">{{ error }}</div>
    <div class="alert info" role="status" aria-live="polite" v-if="success">{{ success }}</div>

    <div class="card">
      <div class="field"><label>{{ t('citizenNationalId') }}</label><input v-model="nationalId" placeholder="e.g. 196104041003" /></div>
      <button class="btn secondary" @click="checkFlag" :disabled="loading">Check existing flag</button>

      <div class="mt-1" v-if="flag">
        <p><strong>Flag type:</strong> {{ flag.flagType }}</p>
        <p><strong>Severity:</strong> <span class="chip flagged">{{ flag.severity }}</span></p>
        <p><strong>Notes:</strong> {{ flag.notes }}</p>
      </div>
      <p class="muted mt-1" v-else-if="nationalId && !loading">No active flag found for this citizen.</p>
    </div>

    <div class="card">
      <h2>{{ t('addNewFlag') }}</h2>
      <div class="field">
        <label>{{ t('flagType') }}</label>
        <select v-model="flagType">
          <option value="">Select…</option>
          <option value="outstanding_warrant">Outstanding warrant</option>
          <option value="wanted_for_questioning">Wanted for questioning</option>
          <option value="travel_restriction">Travel restriction</option>
        </select>
      </div>
      <div class="field">
        <label>{{ t('severity') }}</label>
        <select v-model="severity">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div class="field"><label>{{ t('notesInternal') }}</label><textarea v-model="notes" rows="2"></textarea></div>
      <button class="btn block" @click="addFlag">{{ t('addFlag') }}</button>
    </div>

    <div class="card">
      <h2>{{ t('policeFlags') }}</h2>
      <p class="muted" v-if="!requests.length">No pending requests.</p>
      <div v-for="r in requests" :key="r.id" class="log-entry">
        <span class="log-who">{{ r.requesting_department }} — {{ r.national_id }}</span>
        <span>
          <span class="chip" :class="r.status">{{ r.status }}</span>
          <template v-if="r.status === 'pending'">
            <button class="btn secondary" style="padding: 0.2rem 0.6rem; margin-left: 0.5rem;" @click="respond(r.id, 'approved')">{{ t('approve') }}</button>
            <button class="btn danger" style="padding: 0.2rem 0.6rem; margin-left: 0.5rem;" @click="respond(r.id, 'denied')">{{ t('deny') }}</button>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>
