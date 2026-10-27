<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const user = await auth.login(username.value.trim(), password.value);
    router.push(user.role === 'citizen' ? '/citizen/dashboard' : '/staff/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page" style="max-width: 460px;">
    <h1>Boitsibiso National ID Hub</h1>
    <p class="muted">One verified identity, connecting Home Affairs, Traffic, Finance, Pensions, Police and Passport Services.</p>

    <div class="card mt-1">
      <h2>Sign in</h2>
      <div class="alert error" role="alert" v-if="error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="field">
          <label for="username">National ID / Staff username</label>
          <input id="username" v-model="username" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" autocomplete="current-password" required />
        </div>
        <button class="btn block" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h3>No smartphone? No problem.</h3>
      <p class="muted">Citizens without web access can use the USSD simulator below — the same menu that would run on any feature phone.</p>
      <router-link class="btn secondary block" to="/ussd">Open USSD Simulator</router-link>
    </div>

    <div class="card">
      <h3>Demo credentials</h3>
      <p class="muted mb-0">Citizen: National ID as both username and password (e.g. <code>195501011000</code>).<br />
      Staff: e.g. <code>ha.officer</code>, <code>traffic.officer</code>, <code>pensions.officer</code>, <code>police.officer</code>, <code>passport.mokoena</code>, <code>finance.officer</code>, <code>admin</code> — password <code>Password123!</code></p>
    </div>
  </div>
</template>
