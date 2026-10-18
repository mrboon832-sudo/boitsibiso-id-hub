<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDemoStore } from './store/demo';

const demo = useDemoStore();
const route = useRoute();
const isUssdRoute = computed(() => route.path === '/ussd');
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="topbar" v-if="!isUssdRoute">
    <router-link class="brand" to="/">
      Boitsibiso National ID Hub — Demo Screenshot Mode
    </router-link>
    <nav>
      <router-link to="/citizen/dashboard">Citizen</router-link>
      <router-link to="/staff/dashboard">Staff</router-link>
      <router-link to="/ussd">Phone / USSD</router-link>
      <select class="profile-select" :value="demo.activeProfileKey" @change="demo.setActiveProfile($event.target.value)" aria-label="Demo account">
        <optgroup label="Citizens">
          <option v-for="profile in demo.citizenProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
        </optgroup>
        <optgroup label="Staff departments">
          <option v-for="profile in demo.staffProfiles" :key="profile.key" :value="profile.key">{{ profile.label }}</option>
        </optgroup>
      </select>
    </nav>
  </div>
  <main id="main">
    <router-view />
  </main>
</template>

