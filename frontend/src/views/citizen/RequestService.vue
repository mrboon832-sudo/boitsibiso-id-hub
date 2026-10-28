<script setup>
import { ref, computed } from 'vue';
import api from '../../api/client';
import { useI18n } from '../../i18n';

const { t } = useI18n();
const SERVICES = computed(() => [
  { value: 'id_renewal', label: t('nationalIdRenewal'), department: t('homeAffairs') },
  { value: 'license_renewal', label: t('licenseRenewal'), department: t('traffic') },
  { value: 'pension_claim', label: t('pensionClaim'), department: t('pensions') },
  { value: 'passport_application', label: t('passportApplication'), department: t('passportServices') },
  { value: 'death_registration', label: t('deathRegistration'), department: t('homeAffairs') },
]);
const serviceLabels = computed(() => ({
  id_renewal: t('nationalIdRenewal'),
  license_renewal: t('licenseRenewal'),
  pension_claim: t('pensionClaim'),
  passport_application: t('passportApplication'),
  death_registration: t('deathRegistration'),
}));
const departmentLabels = computed(() => ({ home_affairs: t('homeAffairs'), traffic: t('traffic'), pensions: t('pensions'), passport: t('passportServices') }));

const serviceType = ref('');
const notes = ref('');
const submitting = ref(false);
const success = ref(null);
const error = ref('');

async function submit() {
  error.value = '';
  success.value = null;
  if (!serviceType.value) {
    error.value = t('pleaseChoose');
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
    error.value = err.response?.data?.error || t('submitFailed');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page" style="max-width: 560px;">
    <h1>{{ t('requestService') }}</h1>
    <p class="muted">{{ t('requestIntro') }}</p>

    <div class="alert info" role="status" aria-live="polite" v-if="success">
      {{ t('requestSubmitted') }} <strong>{{ serviceLabels[success.serviceType] }}</strong> ({{ departmentLabels[success.department] || success.department }}) — {{ t('status').toLowerCase() }}
      <span class="chip" :class="success.status">{{ success.status }}</span>.
      <router-link to="/citizen/tracking">{{ t('trackIt') }}</router-link>
    </div>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="field">
          <label for="service">{{ t('chooseService') }}</label>
          <select id="service" v-model="serviceType">
            <option value="" disabled>{{ t('selectService') }}</option>
            <option v-for="s in SERVICES" :key="s.value" :value="s.value">{{ s.label }} — {{ s.department }}</option>
          </select>
        </div>
        <div class="field">
          <label for="notes">{{ t('extraNotes') }}</label>
          <textarea id="notes" v-model="notes" rows="3" :placeholder="t('notesPlaceholder')"></textarea>
        </div>
        <button class="btn block" type="submit" :disabled="submitting">
          {{ submitting ? t('submitting') : t('submitRequest') }}
        </button>
      </form>
    </div>
  </div>
</template>
