<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const { t } = useI18n();
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
    error.value = getApiErrorMessage(err, t('couldNotLoad'));
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
    <h1>{{ t('processApplications') }}</h1>
    <p class="muted">{{ t('processIntro') }} {{ t('demoAccountText') }} {{ demo.activeProfile.label }}.</p>

    <p class="muted" v-if="loading">{{ t('loading') }}</p>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>
    <div class="card" v-if="!loading && !error">
      <table class="data-table" v-if="applications.length">
        <thead>
          <tr><th>{{ t('nationalId') }}</th><th>{{ t('service') }}</th><th>{{ t('channel') }}</th><th>{{ t('status') }}</th><th>{{ t('actions') }}</th></tr>
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
                <option value="pending">{{ t('pending') }}</option>
                <option value="in_review">{{ t('inReview') }}</option>
                <option value="confirmed">{{ t('confirmed') }}</option>
                <option value="completed">{{ t('completed') }}</option>
                <option value="rejected">{{ t('rejected') }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="muted" v-else>{{ t('noQueueApps') }}</p>
    </div>
  </div>
</template>
