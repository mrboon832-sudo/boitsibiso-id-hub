<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const { t } = useI18n();
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
    <h1>{{ t('applicationTracking') }}</h1>
    <p class="muted">{{ t('showingRecords') }} {{ demo.activeProfile.label }}.</p>
    <p class="muted" v-if="loading">{{ t('loading') }}</p>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <template v-if="!loading && !error">
      <div class="card">
        <h2>{{ t('yourApplications') }}</h2>
        <table class="data-table" v-if="applications.length">
          <thead>
            <tr><th>{{ t('service') }}</th><th>{{ t('department') }}</th><th>{{ t('channel') }}</th><th>{{ t('status') }}</th><th>{{ t('submitted') }}</th></tr>
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
        <p class="muted" v-else>{{ t('noSubmitted') }}</p>
      </div>

      <div class="card">
        <h2>{{ t('dataFeed') }}</h2>
        <p class="muted">{{ t('feedIntro') }}</p>
        <div v-for="e in shareFeed" :key="e.id" class="log-entry">
          <span class="log-who">{{ (e.department || 'system').replace('_', ' ') }} — {{ e.action.replace(/_/g, ' ').toLowerCase() }}</span>
          <span class="log-when">{{ e.timestamp }}</span>
        </div>
        <p class="muted" v-if="!shareFeed.length">{{ t('noActivity') }}</p>
      </div>
    </template>
  </div>
</template>
