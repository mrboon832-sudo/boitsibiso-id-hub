<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from '../i18n';

const router = useRouter();
const { t, accessibility } = useI18n();

function saveAndAnnounce(message) {
  accessibility.save();
  accessibility.announce(message);
}

function toggleLargeText() {
  accessibility.largeText = !accessibility.largeText;
  saveAndAnnounce(accessibility.largeText ? t('largeTextOn') : t('largeTextOff'));
}

function toggleContrast() {
  accessibility.highContrast = !accessibility.highContrast;
  saveAndAnnounce(accessibility.highContrast ? t('contrastOn') : t('contrastOff'));
}

function changeLanguage(event) {
  accessibility.language = event.target.value;
  accessibility.save();
  accessibility.announce(t('languageChanged'));
}
</script>

<template>
  <aside class="accessibility-bar" :aria-label="t('quickAccessibility')">
    <span class="accessibility-label">{{ t('quickAccessibility') }}</span>
    <label class="accessibility-language">
      <span class="sr-only">{{ t('language') }}</span>
      <select :value="accessibility.language" @change="changeLanguage">
        <option value="en">{{ t('english') }}</option>
        <option value="st">{{ t('sesotho') }}</option>
      </select>
    </label>
    <button type="button" class="accessibility-toggle" :aria-pressed="accessibility.largeText" @click="toggleLargeText">A+ {{ t('largeTextShort') }}</button>
    <button type="button" class="accessibility-toggle" :aria-pressed="accessibility.highContrast" @click="toggleContrast">Contrast {{ t('contrastShort') }}</button>
    <button type="button" class="accessibility-settings" @click="router.push('/citizen/accessibility')">{{ t('allSettings') }}</button>
  </aside>
</template>
