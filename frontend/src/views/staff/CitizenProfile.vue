<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api, { getApiErrorMessage } from '../../api/client';
import { useDemoStore } from '../../store/demo';
import { useI18n } from '../../i18n';

const route = useRoute();
const demo = useDemoStore();
const { t } = useI18n();
const citizen = ref(null);
const accessLog = ref([]);
const documents = ref([]);
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
    try {
      const documentsRes = await api.get(`/citizens/${route.params.nationalId}/documents`);
      documents.value = documentsRes.data.documents;
    } catch {
      // Keep the citizen profile usable with an older backend while it is restarting.
      documents.value = [];
    }
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
    <h1>{{ t('citizenProfile') }}</h1>
    <p class="muted" v-if="loading">{{ t('loading') }}</p>
    <div class="alert error" role="alert" v-if="error">{{ error }}</div>

    <template v-if="citizen">
      <div class="grid-2">
        <div class="card">
          <h2>{{ t('profileSummary') }}</h2>
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
          <h2>{{ t('sharingLog') }}</h2>
          <p class="muted" v-if="!accessLog.length">{{ t('noActivity') }}</p>
          <div class="table-wrap" v-else><table class="data-table"><thead><tr><th>{{ t('actorLabel') }}</th><th>{{ t('departmentLabel') }}</th><th>{{ t('actionLabel') }}</th><th>{{ t('whenLabel') }}</th></tr></thead><tbody>
            <tr v-for="e in accessLog" :key="e.id"><td>{{ e.actorName }}</td><td>{{ (e.department || 'system').replace('_', ' ') }}</td><td>{{ e.action.replace(/_/g, ' ').toLowerCase() }}</td><td>{{ e.timestamp }}</td></tr>
          </tbody></table></div>
        </div>

        <div class="card">
          <h2>{{ t('existingDocuments') }}</h2>
          <p class="muted" v-if="!documents.length">{{ t('noDocuments') }}</p>
          <div class="table-wrap" v-else><table class="data-table"><thead><tr><th>{{ t('documentLabel') }}</th><th>{{ t('numberLabel') }}</th><th>{{ t('statusLabel') }}</th><th>{{ t('departmentLabel') }}</th></tr></thead><tbody>
            <tr v-for="document in documents" :key="document.id"><td>{{ document.documentType.replace(/_/g, ' ') }}</td><td>{{ document.documentNumber }}</td><td>{{ document.status }}</td><td>{{ document.issuingDepartment.replace('_', ' ') }}</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </template>
  </div>
</template>
