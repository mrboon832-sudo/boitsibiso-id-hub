<script setup>
import { ref, onMounted, watch } from 'vue';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const { t } = useI18n();
const citizen = ref(null);
const applications = ref([]);
const shareFeed = ref([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [citizenRes, appsRes, feedRes] = await Promise.all([
      api.get('/citizens/me'),
      api.get('/applications'),
      api.get('/audit-log'),
    ]);
    citizen.value = citizenRes.data.citizen;
    applications.value = appsRes.data.applications;
    shareFeed.value = feedRes.data.entries.slice(0, 5);
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Could not load your citizen dashboard.');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => demo.activeProfileKey, load);
</script>

<template>
  <div class="page">
    <h1>{{ t('welcome') }}, {{ citizen?.fullName || demo.activeProfile.label }}</h1>
    <p class="muted" v-if="loading">{{ t('loading') }}</p>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <div class="grid-2" v-if="citizen">
      <div class="card">
        <h2>{{ t('profileSummary') }}</h2>
        <p><strong>{{ t('nationalId') }}:</strong> {{ citizen.nationalId }}</p>
        <p><strong>{{ t('status') }}:</strong> <span class="chip" :class="citizen.status">{{ citizen.status }}</span></p>
        <p><strong>{{ t('district') }}:</strong> {{ citizen.district }}</p>
        <p><strong>{{ t('phone') }}:</strong> {{ citizen.phone }}</p>
      </div>

      <div class="card">
        <h2>{{ t('quickActions') }}</h2>
        <router-link class="btn block" to="/citizen/request-service">{{ t('requestService') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/tracking">{{ t('trackApplications') }}</router-link>
      </div>

      <div class="card">
        <h2>{{ t('activeApplications') }}</h2>
        <p class="muted" v-if="!applications.length">{{ t('noApplications') }}</p>
        <div class="table-wrap" v-else><table class="data-table"><thead><tr><th>Service</th><th>Department</th><th>Status</th></tr></thead><tbody>
          <tr v-for="a in applications.slice(0, 4)" :key="a.id"><td>{{ a.serviceType.replace(/_/g, ' ') }}</td><td>{{ a.department.replace('_', ' ') }}</td><td><span class="chip" :class="a.status">{{ a.status.replace('_', ' ') }}</span></td></tr>
        </tbody></table></div>
      </div>

      <div class="card">
        <h2>{{ t('accessedData') }}</h2>
        <p class="muted" v-if="!shareFeed.length">{{ t('noSharing') }}</p>
        <div class="table-wrap" v-if="shareFeed.length"><table class="data-table"><thead><tr><th>Department</th><th>Action</th><th>When</th></tr></thead><tbody>
          <tr v-for="e in shareFeed" :key="e.id"><td>{{ (e.department || 'system').replace('_', ' ') }}</td><td>{{ e.action.replace(/_/g, ' ').toLowerCase() }}</td><td>{{ e.timestamp }}</td></tr>
        </tbody></table></div>
        <router-link class="mt-1" style="display:inline-block" to="/citizen/tracking">{{ t('viewFullLog') }}</router-link>
      </div>
    </div>
  </div>
</template>
