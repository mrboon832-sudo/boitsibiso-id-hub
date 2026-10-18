<script setup>
import { useDemoStore, DEMO_PROFILES } from '../store/demo';

const demo = useDemoStore();
const heroId = DEMO_PROFILES.thabo.username;
</script>

<template>
  <div class="page">
    <h1>Boitsibiso National ID Hub</h1>
    <p class="muted">Screenshot mode: choose a persona below, then open any screen directly. The backend is still protected by role rules; the demo toolbar signs in as the selected demo account when a screen needs data.</p>

    <div class="grid-2">
      <div class="card">
        <h2>Citizen screens</h2>
        <router-link class="btn block" to="/citizen/dashboard">Citizen Dashboard</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/request-service">Request a Service</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/tracking">Application Tracking</router-link>
        <router-link class="btn secondary block mt-1" to="/citizen/accessibility">Accessibility Settings</router-link>
        <router-link class="btn secondary block mt-1" to="/ussd">USSD Phone Terminal</router-link>
      </div>

      <div class="card">
        <h2>Home Affairs staff</h2>
        <router-link class="btn block" to="/staff/dashboard">Role Dashboard</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/process-application">Process Application</router-link>
        <router-link class="btn secondary block mt-1" :to="`/staff/citizen-profile/${heroId}`">Citizen Profile</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/sharing-log">Sharing Log</router-link>
      </div>

      <div class="card">
        <h2>Other departments</h2>
        <router-link class="btn block" to="/staff/verification-request">Department Verification Request</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/passport-review">Passport Applicant Review</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/police-flags">Add / View Police Flag</router-link>
        <router-link class="btn secondary block mt-1" to="/staff/dashboard">Notification Received / Role Queue</router-link>
      </div>

      <div class="card">
        <h2>Current demo account</h2>
        <p><strong>{{ demo.activeProfile.label }}</strong></p>
        <p class="muted mb-0">Use the toolbar selector at the top of the app to switch between citizens and departments without a login screen.</p>
      </div>
    </div>
  </div>
</template>
