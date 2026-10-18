<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/client';

const nationalId = ref('9207157012347');
const citizen = ref(null);
const flag = ref(undefined); // undefined = not checked yet, null = no flag, object = flag exists
const error = ref('');
const loading = ref(false);
const requesting = ref(false);
const requestSent = ref(false);

onMounted(() => lookup());

async function lookup() {
  error.value = '';
  citizen.value = null;
  flag.value = undefined;
  requestSent.value = false;
  if (!nationalId.value) return;
  loading.value = true;
  try {
    const verifyRes = await api.post('/verification-requests', {
      nationalId: nationalId.value.trim(),
      purpose: 'Passport application identity confirmation',
    });
    citizen.value = verifyRes.data.request.dataShared;

    const flagRes = await api.get(`/police-flags/${nationalId.value.trim()}`);
    flag.value = flagRes.data.flag;
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not retrieve applicant details.';
  } finally {
    loading.value = false;
  }
}

async function requestPoliceCheck() {
  requesting.value = true;
  try {
    await api.post('/police-flags/requests', { nationalId: nationalId.value.trim() });
    requestSent.value = true;
  } finally {
    requesting.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h1>Passport Applicant Review</h1>
    <p class="muted">Core Identity Data is pulled automatically from Home Affairs; if Police has already shared a flag it appears here immediately.</p>

    <div class="alert error" v-if="error">{{ error }}</div>

    <div class="card">
      <div class="field"><label>Applicant National ID</label><input v-model="nationalId" placeholder="e.g. 196104041003" /></div>
      <button class="btn block" @click="lookup" :disabled="loading">{{ loading ? 'Retrieving…' : 'Retrieve applicant' }}</button>
    </div>

    <div class="grid-2" v-if="citizen">
      <div class="card">
        <h2>Core Identity Data</h2>
        <p><strong>{{ citizen.fullName }}</strong></p>
        <p class="muted">DOB {{ citizen.dob }} · {{ citizen.gender }} · {{ citizen.district }}</p>
        <p><strong>Status:</strong> <span class="chip" :class="citizen.status">{{ citizen.status }}</span></p>
      </div>

      <div class="card">
        <h2>Police flag status</h2>
        <template v-if="flag === undefined">
          <p class="muted">Checking…</p>
        </template>
        <template v-else-if="flag === null">
          <p class="chip active">No flag found</p>
        </template>
        <template v-else>
          <p class="chip flagged">Flag on record</p>
          <p class="muted">Only the existence of the flag is shared — Police retains the case details.</p>
        </template>

        <button class="btn secondary mt-1" @click="requestPoliceCheck" :disabled="requesting || requestSent">
          {{ requestSent ? 'Police check requested' : (requesting ? 'Sending…' : 'Request a fresh Police check') }}
        </button>
      </div>
    </div>
  </div>
</template>
