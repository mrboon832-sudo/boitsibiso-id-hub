<script setup>
import { ref, nextTick } from 'vue';
import axios from 'axios';
import { getApiErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });
const { t, accessibility } = useI18n();

const USSD_CODE = '*330#';

// 'dialer' = phone home screen where the user keys in the USSD code,
// 'call'   = an active USSD session showing the gateway's menu screens.
const mode = ref('dialer');
const dialedNumber = ref('');
const dialError = ref('');

const sessionId = ref(null);
const history = ref([]);
const input = ref('');
const ended = ref(false);
const loading = ref(false);

function appendScreen(text) {
  history.value.push(text);
  accessibility.announce(text);
  nextTick(() => {
    const screen = document.querySelector('.phone-terminal');
    if (screen) screen.scrollTop = screen.scrollHeight;
  });
}

function localizeScreen(text) {
  if (accessibility.language !== 'st') return text;
  return text.replace('Enter your National ID number:', 'Kenya nomoro ea National ID:')
    .replace('Enter your PIN:', 'Kenya PIN ea hau:')
    .replace('My applications', 'Likopo tsa ka')
    .replace('Request a service', 'Kopa tšebeletso')
    .replace('My data-sharing log', 'Tlaleho ea data ea ka')
    .replace('Exit', 'Tsoa');
}

function pressDialerKey(key) {
  dialError.value = '';
  dialedNumber.value += key;
}

function backspaceDialer() {
  dialError.value = '';
  dialedNumber.value = dialedNumber.value.slice(0, -1);
}

function clearDialer() {
  dialedNumber.value = '';
  dialError.value = '';
}

async function call() {
  if (loading.value) return;
  if (dialedNumber.value !== USSD_CODE) {
    dialError.value = dialedNumber.value
      ? `Connection problem or invalid USSD code. Dial ${USSD_CODE}`
      : `Enter ${USSD_CODE} then press Call`;
    return;
  }
  loading.value = true;
  try {
    const { data } = await api.post('/ussd/start');
    sessionId.value = data.sessionId;
    ended.value = false;
    history.value = [];
    appendScreen(localizeScreen(data.text.replace(/^CON /, '')));
    mode.value = 'call';
    dialedNumber.value = '';
  } catch (e) {
    dialError.value = t('ussdError');
    accessibility.announce(dialError.value);
  } finally {
    loading.value = false;
  }
}

async function send(value = input.value) {
  if (!sessionId.value || loading.value) return;
  loading.value = true;
  try {
    history.value.push(`> ${value || '(enter)'}`);
    const { data } = await api.post('/ussd/input', { sessionId: sessionId.value, text: value });
    appendScreen(localizeScreen(data.text.replace(/^(CON|END) /, '')));
    ended.value = !!data.ended;
    input.value = '';
  } catch (e) {
    appendScreen(`ERROR: ${getApiErrorMessage(e, 'USSD request failed.')}`);
  } finally {
    loading.value = false;
  }
}

function endCall() {
  sessionId.value = null;
  ended.value = false;
  history.value = [];
  input.value = '';
  mode.value = 'dialer';
  dialedNumber.value = '';
  dialError.value = '';
}

const dialerKeys = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
];
</script>

<template>
  <div class="phone-page">
    <div class="phone-shell" aria-label="USSD feature phone simulator">
      <div class="phone-speaker"></div>

      <!-- Dialer / home screen: user keys in *330# to open the USSD menu -->
      <div v-if="mode === 'dialer'" class="phone-screen">
        <div class="phone-statusbar">
          <span>BOITSIBISO</span>
          <span>{{ t('ready') }}</span>
        </div>
        <div class="phone-dial-display">
          <span class="dial-number">{{ dialedNumber || '\u00A0' }}</span>
          <p class="dial-hint" v-if="!dialError">{{ t('dialHint') }}</p>
          <p class="dial-hint error" v-else>{{ dialError }}</p>
        </div>
        <div class="phone-keypad dialer-keypad">
          <button
            v-for="([digit, letters]) in dialerKeys"
            :key="digit"
            class="phone-key dial-digit"
            type="button"
            @click="pressDialerKey(digit)"
          >
            <span class="digit">{{ digit }}</span>
            <span class="letters" v-if="letters">{{ letters }}</span>
          </button>
          <button class="phone-key call" type="button" @click="call" :disabled="loading">{{ t('call') }}</button>
          <button class="phone-key" type="button" @click="backspaceDialer" aria-label="Backspace">&#9003;</button>
          <button class="phone-key end" type="button" @click="clearDialer">{{ t('clear') }}</button>
        </div>
        <router-link class="phone-home-link" to="/">&larr; Back to demo home</router-link>
      </div>

      <!-- Active USSD call: live session driven by the shared backend -->
      <div v-else class="phone-screen">
        <div class="phone-statusbar" aria-live="polite">
          <span>{{ USSD_CODE }}</span>
          <span>{{ ended ? t('hangUp') : t('session') }}</span>
        </div>
        <div class="phone-terminal" aria-live="polite" aria-atomic="false" role="log">
          <div v-for="(line, index) in history" :key="index" :class="['terminal-line', { input: line.startsWith('>') }]">
            {{ line }}
          </div>
        </div>
        <form v-if="!ended" @submit.prevent="send()" class="phone-input-row">
          <span>&gt;</span>
          <label class="sr-only" for="ussd-input">{{ t('enterId') }}</label>
          <input id="ussd-input" v-model="input" maxlength="40" placeholder="number / ID / PIN" autofocus />
        </form>
        <div class="phone-keypad">
          <template v-if="!ended">
            <button v-for="number in [1, 2, 3, 4, 5, 0]" :key="number" class="phone-key" type="button" @click="send(String(number))">{{ number }}</button>
          </template>
          <button class="phone-key end" type="button" @click="endCall">{{ ended ? t('hangUp') : t('endCall') }}</button>
        </div>
      </div>
    </div>

    <p class="phone-help">Feature-phone simulator. Dial <strong>{{ USSD_CODE }}</strong> on the keypad and press Call to reach the same live backend that the web app uses — any application you submit here shows up instantly for web and staff users.</p>
  </div>
</template>
