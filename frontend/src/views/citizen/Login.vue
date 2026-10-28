<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDemoStore, DEMO_PROFILES } from '../../store/demo';
import { useI18n } from '../../i18n';

const demo = useDemoStore();
const router = useRouter();
const loading = ref(false);
const { t } = useI18n();

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
      <router-link class="back-link" to="/">← {{ t('backHome') }}</router-link>
    </header>
    <main class="login-layout page-width">
      <section class="login-intro"><p class="eyebrow">{{ t('welcomeDemo') }}</p><h1>{{ t('stepInside') }}</h1><p>{{ t('chooseView') }}</p><div class="login-assurance"><span>✓</span><div><strong>{{ t('dataSafe') }}</strong><small>{{ t('sampleProfiles') }}</small></div></div></section>
      <section class="login-panel" aria-labelledby="profile-heading"><div class="panel-heading"><div class="secure-lock">⌁</div><div><p class="eyebrow">{{ t('demoAccess') }}</p><h2 id="profile-heading">{{ t('continueAs') }}</h2></div></div><p class="muted">{{ t('selectExperience') }}</p>
        <div class="profile-choice-group"><p class="choice-label">{{ t('citizenExperience') }}</p><button class="profile-choice" :disabled="loading" @click="enterHub('thabo')"><span class="choice-icon citizen-icon">◉</span><span><strong>Thabo Mokoena</strong><small>{{ t('viewPersonal') }}</small></span><span class="choice-arrow">→</span></button><button class="profile-choice" :disabled="loading" @click="enterHub('mamello')"><span class="choice-icon citizen-icon">◉</span><span><strong>Mamello Nthako</strong><small>{{ t('viewPersonal') }}</small></span><span class="choice-arrow">→</span></button></div>
        <div class="profile-choice-group"><p class="choice-label">{{ t('publicTeam') }}</p><button class="profile-choice" :disabled="loading" @click="enterHub('homeAffairs')"><span class="choice-icon staff-icon">▦</span><span><strong>Home Affairs team</strong><small>{{ t('manageIdentity') }}</small></span><span class="choice-arrow">→</span></button></div>
        <router-link class="ussd-link" to="/ussd">{{ t('basicPhone') }}</router-link>
      </section>
    </main>
  </div>
</template>
