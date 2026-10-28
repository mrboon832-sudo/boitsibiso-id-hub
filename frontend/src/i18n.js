import { useAccessibilityStore } from './store/accessibility';

const messages = {
  en: {
    navCitizen: 'Citizen', navStaff: 'Staff', navUssd: 'Phone / USSD', demoAccount: 'Demo account',
    accessibility: 'Accessibility Settings', accessibilityIntro: 'Choose the settings that make the Hub easier to use.',
    language: 'Language', english: 'English', sesotho: 'Sesotho', largeText: 'Use large text',
    dyslexia: 'Use dyslexia-friendly text', highContrast: 'Use high contrast', colorBlind: 'Use color-blind safe status cues',
    reducedMotion: 'Reduce motion', speech: 'Read important messages aloud', save: 'Save preferences', saved: 'Preferences saved.',
    needHelp: 'Need help?', ussdHelp: 'Use the USSD service from any phone.',
    ussdTitle: 'Boitsibiso National ID Hub', dialHint: 'Dial *330# and press Call to open the USSD menu',
    call: 'CALL', clear: 'CLEAR', session: 'SESSION', ready: 'READY', enterId: 'Enter your National ID number:',
    enterPin: 'Enter your PIN:', backHome: 'Back to demo home', endCall: 'END CALL', hangUp: 'HANG UP',
    quickAccessibility: 'Accessibility', largeTextShort: 'Large text', contrastShort: 'Contrast', allSettings: 'All settings',
    largeTextOn: 'Large text on', largeTextOff: 'Large text off', contrastOn: 'High contrast on', contrastOff: 'High contrast off',
    languageChanged: 'Language changed',
  },
  st: {
    navCitizen: 'Moahi', navStaff: 'Basebetsi', navUssd: 'Mohala / USSD', demoAccount: 'Akhaonto ea teko',
    accessibility: 'Litlhophiso tsa phihlello', accessibilityIntro: 'Khetha litlhophiso tse etsang hore Hub e be bonolo ho e sebelisa.',
    language: 'Puo', english: 'Senyesemane', sesotho: 'Sesotho', largeText: 'Sebelisa mongolo o moholo',
    dyslexia: 'Sebelisa mongolo o thusang ba nang le dyslexia', highContrast: 'Sebelisa phapang e phahameng', colorBlind: 'Sebelisa matšoao a sa itšetleheng ka mebala',
    reducedMotion: 'Fokotsa motsamao', speech: 'Bala melaetsa ea bohlokoa ka lentsoe', save: 'Boloka litlhophiso', saved: 'Litlhophiso li bolokiloe.',
    needHelp: 'U hloka thuso?', ussdHelp: 'Sebelisa tšebeletso ea USSD fonong efe kapa efe.',
    ussdTitle: 'Boitsibiso National ID Hub', dialHint: 'Tobetsa *330# ebe u tobetsa Call ho bula lenane la USSD',
    call: 'LETSATSI', clear: 'HLAKOLA', session: 'TŠEBELETSO', ready: 'E lokile', enterId: 'Kenya nomoro ea National ID:',
    enterPin: 'Kenya PIN ea hau:', backHome: 'Khutlela leqepheng la pele', endCall: 'KOALA', hangUp: 'KOALA MOHALA',
    quickAccessibility: 'Phihlello', largeTextShort: 'Mongolo o moholo', contrastShort: 'Phapang', allSettings: 'Litlhophiso tsohle',
    largeTextOn: 'Mongolo o moholo o buletsoe', largeTextOff: 'Mongolo o moholo o koetsoe', contrastOn: 'Phapang e phahameng e buletsoe', contrastOff: 'Phapang e phahameng e koetsoe',
    languageChanged: 'Puo e fetotsoe',
  },
};

export function useI18n() {
  const accessibility = useAccessibilityStore();
  const t = (key) => messages[accessibility.language]?.[key] || messages.en[key] || key;
  return { t, accessibility };
}
