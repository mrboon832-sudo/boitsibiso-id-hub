<script setup>
import { ref } from 'vue';
import api from '../../api/client';

const SERVICES = [
  { value: 'id_renewal', label: 'National ID renewal', department: 'Home Affairs' },
  { value: 'license_renewal', label: "Driver's license renewal", department: 'Traffic' },
  { value: 'pension_claim', label: 'Pension claim', department: 'Pensions' },
  { value: 'passport_application', label: 'Passport application', department: 'Passport Services' },
  { value: 'death_registration', label: 'Register a death', department: 'Home Affairs' },
];

const serviceType = ref('');
const notes = ref('');
const submitting = ref(false);
const success = ref(null);
const error = ref('');

async function submit() {
  error.value = '';
  success.value = null;
  if (!serviceType.value) {
    error.value = 'Please choose a service.';
    return;
  }
  submitting.value = true;
  try {
    const { data } = await api.post('/applications', {
      serviceType: serviceType.value,
      channel: 'web',
      notes: notes.value || undefined,
    });
    success.value = data.application;
    serviceType.value = '';
    notes.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not submit your request.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page" style="max-width: 560px;">
    <h1>Request a Service</h1>
    <p class="muted">One form covers ID renewal, licenses, pensions, passports and death registration — Home Affairs' Core Identity Data means you won't need to resubmit a certified copy.</p>

    <div class="alert info" role="status" aria-live="polite" v-if="success">
      Request submitted: <strong>{{ success.serviceType.replace(/_/g, ' ') }}</strong> ({{ success.department.replace('_', ' ') }}) — status
      <span class="chip" :class="success.status">{{ success.status }}</span>.
      <router-link to="/citizen/tracking">Track it here.</router-link>
    </div>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="field">
          <label for="service">Which service do you need?</label>
          <select id="service" v-model="serviceType">
            <option value="" disabled>Select a service…</option>
            <option v-for="s in SERVICES" :key="s.value" :value="s.value">{{ s.label }} — {{ s.department }}</option>
          </select>
        </div>
        <div class="field">
          <label for="notes">Additional notes (optional)</label>
          <textarea id="notes" v-model="notes" rows="3" placeholder="Anything the department should know"></textarea>
        </div>
        <button class="btn block" type="submit" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit request' }}
        </button>
      </form>
    </div>
  </div>
</template>
