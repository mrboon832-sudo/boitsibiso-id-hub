<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDemoStore, DEMO_PROFILES } from '../../store/demo';

const demo = useDemoStore();
const router = useRouter();
const loading = ref(false);

async function enterHub(profileKey) {
  loading.value = true;
  demo.setActiveProfile(profileKey);
  await router.push(DEMO_PROFILES[profileKey].role === 'citizen' ? '/citizen/dashboard' : '/staff/dashboard');
  loading.value = false;
}
</script>

<template>
  <div class="public-shell login-page">
    <header class="public-nav page-width">
      <router-link class="public-brand" to="/"><img class="brand-logo" src="/boitsibiso-logo.png" alt="" /><span>Boitsibiso<span class="brand-subtitle">National ID Hub</span></span></router-link>
      <router-link class="back-link" to="/">← Back to home</router-link>
    </header>
    <main class="login-layout page-width">
      <section class="login-intro"><p class="eyebrow">Welcome to the demo</p><h1>Step inside the<br /><span>National ID Hub.</span></h1><p>Choose a view to explore how Boitsibiso connects citizens and public service teams. This is a guided demo—no account or password needed.</p><div class="login-assurance"><span>✓</span><div><strong>Your data is safe here</strong><small>This demo uses sample profiles and information.</small></div></div></section>
      <section class="login-panel" aria-labelledby="profile-heading"><div class="panel-heading"><div class="secure-lock">⌁</div><div><p class="eyebrow">Demo access</p><h2 id="profile-heading">Continue as</h2></div></div><p class="muted">Select the experience you would like to see.</p>
        <div class="profile-choice-group"><p class="choice-label">Citizen experience</p><button class="profile-choice" :disabled="loading" @click="enterHub('thabo')"><span class="choice-icon citizen-icon">◉</span><span><strong>Thabo Mokoena</strong><small>Citizen · View personal services</small></span><span class="choice-arrow">→</span></button><button class="profile-choice" :disabled="loading" @click="enterHub('mamello')"><span class="choice-icon citizen-icon">◉</span><span><strong>Mamello Nthako</strong><small>Citizen · View personal services</small></span><span class="choice-arrow">→</span></button></div>
        <div class="profile-choice-group"><p class="choice-label">Public service team</p><button class="profile-choice" :disabled="loading" @click="enterHub('homeAffairs')"><span class="choice-icon staff-icon">▦</span><span><strong>Home Affairs team</strong><small>Staff · Manage identity services</small></span><span class="choice-arrow">→</span></button></div>
        <router-link class="ussd-link" to="/ussd">Prefer a basic phone? Try the USSD simulator →</router-link>
      </section>
    </main>
  </div>
</template>
