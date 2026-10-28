<script setup>
import { useDemoStore, DEMO_PROFILES } from '../store/demo';
import { useI18n } from '../i18n';

const demo = useDemoStore();
const heroId = DEMO_PROFILES.thabo.username;
const { t } = useI18n();
</script>

<template>
  <div class="page">
    <h1>{{ t('demoHome') }}</h1>
    <p class="muted">{{ t('screenshotMode') }}</p>

    <div class="grid-2">
      <div class="card">
        <h2>{{ t('citizenScreens') }}</h2>
        <router-link class="btn block" to="/citizen/dashboard">{{ t('citizenDashboard') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/request-service">{{ t('requestService') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/tracking">{{ t('applicationTracking') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/accessibility">{{ t('accessibilitySettings') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/ussd">{{ t('ussdTerminal') }}</router-link>
      </div>

      <div class="card">
        <h2>{{ t('homeAffairsStaff') }}</h2>
        <router-link class="btn block" to="/staff/dashboard">{{ t('roleDashboard') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/process-application">{{ t('processApplication') }}</router-link>
        <router-link class="btn secondary block mt-1" :to="`/staff/citizen-profile/${heroId}`">{{ t('citizenProfile') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/sharing-log">{{ t('sharingLog') }}</router-link>
      </div>

      <div class="card">
        <h2>{{ t('otherDepartments') }}</h2>
        <router-link class="btn block" to="/staff/verification-request">{{ t('verificationRequest') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/passport-review">{{ t('passportReview') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/police-flags">{{ t('policeFlags') }}</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/dashboard">{{ t('notificationQueue') }}</router-link>
      </div>

      <div class="card">
        <h2>{{ t('currentDemoAccount') }}</h2>
        <p><strong>{{ demo.activeProfile.label }}</strong></p>
        <p class="muted mb-0">{{ t('languageHelp') }}</p>
      </div>
    </div>
  </div>
</template>
