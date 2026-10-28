<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api, { getApiErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n';

const router = useRouter();
const { t, accessibility } = useI18n();
const form = ref({ nationalId: '', fullName: '', dob: '', gender: '', phone: '', password: '', confirmPassword: '' });
const loading = ref(false);
const error = ref('');

async function register() {
  error.value = '';
  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('passwordMismatch');
    return;
  }
  loading.value = true;
  try {
    await api.post('/auth/register', {
      nationalId: form.value.nationalId,
      fullName: form.value.fullName,
      dob: form.value.dob || undefined,
      gender: form.value.gender || undefined,
      phone: form.value.phone || undefined,
      password: form.value.password,
      language: accessibility.language,
    });
    await router.push({ path: '/login', query: { registered: '1' } });
  } catch (err) {
    error.value = getApiErrorMessage(err, t('registrationFailed'));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="public-shell login-page">
    <header class="public-nav page-width">
      <router-link class="public-brand" to="/"><img class="brand-logo" src="/boitsibiso-logo.png" alt="" /><span>Boitsibiso<span class="brand-subtitle">National ID Hub</span></span></router-link>
      <router-link class="back-link" to="/login">{{ t('signIn') }}</router-link>
    </header>
    <main class="login-layout page-width">
      <section class="login-intro"><p class="eyebrow">{{ t('register') }}</p><h1>{{ t('createCitizenAccount') }}</h1><p>{{ t('registerIntro') }}</p></section>
      <section class="login-panel" aria-labelledby="register-heading">
        <div class="panel-heading"><div class="secure-lock" aria-hidden="true">+</div><div><p class="eyebrow">{{ t('citizenExperience') }}</p><h2 id="register-heading">{{ t('createAccount') }}</h2></div></div>
        <div class="alert error" role="alert" v-if="error">{{ error }}</div>
        <form @submit.prevent="register">
          <div class="field"><label for="register-national-id">{{ t('nationalIdLabel') }}</label><input id="register-national-id" v-model.trim="form.nationalId" inputmode="numeric" maxlength="13" autocomplete="username" required /></div>
          <div class="field"><label for="register-name">{{ t('fullName') }}</label><input id="register-name" v-model.trim="form.fullName" autocomplete="name" required /></div>
          <div class="field"><label for="register-dob">{{ t('dateOfBirth') }} ({{ t('optional') }})</label><input id="register-dob" v-model="form.dob" type="date" autocomplete="bday" /></div>
          <div class="field"><label for="register-gender">{{ t('gender') }} ({{ t('optional') }})</label><select id="register-gender" v-model="form.gender"><option value="">{{ t('selectOption') }}</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></div>
          <div class="field"><label for="register-phone">{{ t('phone') }} ({{ t('optional') }})</label><input id="register-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" /></div>
          <div class="field"><label for="register-password">{{ t('password') }}</label><input id="register-password" v-model="form.password" type="password" minlength="8" autocomplete="new-password" required /></div>
          <div class="field"><label for="register-confirm-password">{{ t('confirmPassword') }}</label><input id="register-confirm-password" v-model="form.confirmPassword" type="password" minlength="8" autocomplete="new-password" required /></div>
          <button class="btn block" type="submit" :disabled="loading">{{ loading ? t('registering') : t('createAccount') }}</button>
        </form>
        <p class="muted mt-1">{{ t('alreadyRegistered') }} <router-link to="/login">{{ t('signIn') }}</router-link></p>
      </section>
    </main>
  </div>
</template>
