<script setup>
import { ref } from 'vue';
import { useI18n } from '../../i18n';
import api from '../../api/client';

const { t, accessibility } = useI18n();
const saved = ref(false);

async function save() {
  accessibility.save();
  try {
    await api.put('/auth/preferences', {
      language: accessibility.language,
      largeText: accessibility.largeText,
    });
  } catch {
    // Local preferences remain usable when the API is temporarily offline.
  }
  accessibility.announce(t('saved'));
  saved.value = true;
  setTimeout(() => (saved.value = false), 2500);
}
</script>

<template>
  <div class="page" style="max-width: 480px;">
    <h1>{{ t('accessibility') }}</h1>
    <p class="muted">{{ t('accessibilityIntro') }}</p>
    <div class="alert info" role="status" aria-live="polite" v-if="saved">{{ t('saved') }}</div>
    <div class="card">
      <div class="field">
        <label for="language">{{ t('language') }}</label>
        <select id="language" v-model="accessibility.language">
          <option value="en">{{ t('english') }}</option>
          <option value="st">{{ t('sesotho') }}</option>
        </select>
      </div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.largeText" /> {{ t('largeText') }}</label></div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.dyslexiaFriendly" /> {{ t('dyslexia') }}</label></div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.highContrast" /> {{ t('highContrast') }}</label></div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.colorBlindSafe" /> {{ t('colorBlind') }}</label></div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.reducedMotion" /> {{ t('reducedMotion') }}</label></div>
      <div class="field checkbox-field"><label><input type="checkbox" v-model="accessibility.speech" /> {{ t('speech') }}</label></div>
      <button class="btn block" @click="save">{{ t('save') }}</button>
    </div>
    <div class="card">
      <h3>{{ t('needHelp') }}</h3>
      <p class="muted mb-0">{{ t('ussdHelp') }} <router-link to="/ussd">USSD</router-link>.</p>
    </div>
  </div>
</template>
