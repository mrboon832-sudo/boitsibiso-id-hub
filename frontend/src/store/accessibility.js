import { defineStore } from 'pinia';

const KEY = 'boitsibiso_accessibility';

function readPreferences() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export const useAccessibilityStore = defineStore('accessibility', {
  state: () => {
    const saved = readPreferences();
    return {
      language: saved.language || localStorage.getItem('boitsibiso_demo_language') || 'en',
      largeText: saved.largeText ?? localStorage.getItem('boitsibiso_demo_large_text') === '1',
      dyslexiaFriendly: saved.dyslexiaFriendly ?? false,
      highContrast: saved.highContrast ?? false,
      colorBlindSafe: saved.colorBlindSafe ?? false,
      reducedMotion: saved.reducedMotion ?? false,
      speech: saved.speech ?? false,
      liveMessage: '',
    };
  },
  actions: {
    save() {
      localStorage.setItem(KEY, JSON.stringify({
        language: this.language, largeText: this.largeText, dyslexiaFriendly: this.dyslexiaFriendly,
        highContrast: this.highContrast, colorBlindSafe: this.colorBlindSafe,
        reducedMotion: this.reducedMotion, speech: this.speech,
      }));
      localStorage.setItem('boitsibiso_demo_language', this.language);
      localStorage.setItem('boitsibiso_demo_large_text', this.largeText ? '1' : '0');
      this.apply();
    },
    apply() {
      document.documentElement.lang = this.language === 'st' ? 'st' : 'en';
      document.body.classList.toggle('large-text', this.largeText);
      document.body.classList.toggle('dyslexia-friendly', this.dyslexiaFriendly);
      document.body.classList.toggle('high-contrast', this.highContrast);
      document.body.classList.toggle('colorblind-safe', this.colorBlindSafe);
      document.body.classList.toggle('reduce-motion', this.reducedMotion);
    },
    announce(message, speak = this.speech) {
      this.liveMessage = message;
      if (speak && 'speechSynthesis' in window && message) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
      }
    },
  },
});
