<script setup>
import { ref, watchEffect } from 'vue';

const language = ref(localStorage.getItem('boitsibiso_demo_language') || 'en');
const largeText = ref(localStorage.getItem('boitsibiso_demo_large_text') === '1');
const saved = ref(false);

watchEffect(() => {
  document.body.classList.toggle('large-text', largeText.value);
});

function save() {
  localStorage.setItem('boitsibiso_demo_language', language.value);
  localStorage.setItem('boitsibiso_demo_large_text', largeText.value ? '1' : '0');
  saved.value = true;
  setTimeout(() => (saved.value = false), 2500);
}
</script>

<template>
  <div class="page" style="max-width: 480px;">
    <h1>Accessibility Settings</h1>
    <p class="muted">Digital literacy and needs vary — these settings help make the Hub usable for everyone.</p>

    <div class="alert info" v-if="saved">Preferences saved.</div>

    <div class="card">
      <div class="field">
        <label for="language">Language</label>
        <select id="language" v-model="language">
          <option value="en">English</option>
          <option value="st">Sesotho</option>
        </select>
      </div>
      <div class="field">
        <label>
          <input type="checkbox" v-model="largeText" style="width: auto; margin-right: 0.5rem;" />
          Use large text
        </label>
      </div>
      <button class="btn block" @click="save">Save preferences</button>
    </div>

    <div class="card">
      <h3>Need help?</h3>
      <p class="muted mb-0">Visit any Home Affairs office and ask staff to assist you in person, or use the <router-link to="/ussd">USSD service</router-link> from any phone.</p>
    </div>
  </div>
</template>
