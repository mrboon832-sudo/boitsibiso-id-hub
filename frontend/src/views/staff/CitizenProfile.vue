<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';

const route = useRoute();
const demo = useDemoStore();
const citizen = ref(null);
const accessLog = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref('');

const form = ref({ address: '', district: '', phone: '', status: '', maritalStatus: '', deceasedDate: '' });

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [citizenRes, logRes] = await Promise.all([
      api.get(`/citizens/${route.params.nationalId}`),
      api.get('/audit-log', { params: { nationalId: route.params.nationalId } }),
    ]);
    citizen.value = citizenRes.data.citizen;
    accessLog.value = logRes.data.entries;
    form.value = {
      address: citizen.value.address,
      district: citizen.value.district,
      phone: citizen.value.phone,
      status: citizen.value.status,
      maritalStatus: citizen.value.maritalStatus,
      deceasedDate: citizen.value.deceasedDate || '',
    };
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load citizen record.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => route.params.nationalId, load);
watch(() => demo.activeProfileKey, load);

async function save() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await api.put(`/citizens/${route.params.nationalId}`, form.value);
    success.value = 'Record updated.';
    await load();
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not save changes.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h1>Citizen Profile Management</h1>
    <p class="muted" v-if="loading">Loading…</p>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <template v-if="citizen">
      <div class="grid-2">
        <div class="card">
          <h2>Core Identity & Civil Status Data</h2>
          <p><strong>{{ citizen.fullName }}</strong> — {{ citizen.nationalId }}</p>
          <p class="muted">DOB {{ citizen.dob }} · {{ citizen.gender }} · {{ citizen.district }}</p>
          <div class="alert info" role="status" aria-live="polite" v-if="success">{{ success }}</div>

          <div class="field"><label>Address</label><input v-model="form.address" /></div>
          <div class="field"><label>District</label><input v-model="form.district" /></div>
          <div class="field"><label>Phone</label><input v-model="form.phone" /></div>
          <div class="field">
            <label>Marital status</label>
            <select v-model="form.maritalStatus">
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div class="field" v-if="form.status === 'deceased'">
            <label>Date of death confirmation</label>
            <input type="date" v-model="form.deceasedDate" />
          </div>
          <p class="muted" v-if="form.status === 'deceased'">Saving this will automatically notify Pensions to open a death benefit case.</p>
          <button class="btn block" @click="save" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>

        <div class="card">
          <h2>Access & audit log for this citizen</h2>
          <p class="muted" v-if="!accessLog.length">No access recorded yet.</p>
          <div v-for="e in accessLog" :key="e.id" class="log-entry">
            <span class="log-who">{{ e.actorName }} ({{ (e.department || 'system').replace('_', ' ') }})</span>
            <span class="log-when">{{ e.action.replace(/_/g, ' ').toLowerCase() }} · {{ e.timestamp }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
