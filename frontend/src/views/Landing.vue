<script setup>
import { useI18n } from '../i18n';

const { t } = useI18n();
</script>

<template>
  <div class="public-shell landing-page">
    <header class="public-nav">
      <router-link class="public-brand" to="/">
        <img class="brand-logo" src="/boitsibiso-logo.png" alt="" />
        <span>Boitsibiso<span class="brand-subtitle">National ID Hub</span></span>
      </router-link>
      <div class="public-nav-actions">
        <span class="secure-note"><span aria-hidden="true">●</span> {{ t('secureDemo') }}</span>
        <router-link class="btn btn-small" to="/login">{{ t('enterHub') }}</router-link>
      </div>
    </header>

    <main>
      <section class="landing-hero page-width">
        <div class="hero-copy">
          <p class="eyebrow">{{ t('simplerAccess') }}</p>
          <h1>{{ t('trustedIdentity') }}<br /><span>{{ t('connectedServices') }}</span></h1>
          <p class="hero-lede">{{ t('landingLead') }}</p>
          <div class="hero-actions">
            <router-link class="btn" to="/login">{{ t('exploreDemo') }} <span aria-hidden="true">→</span></router-link>
            <router-link class="text-link" to="/ussd">{{ t('seeUssd') }} <span aria-hidden="true">↗</span></router-link>
          </div>
          <p class="demo-hint"><span class="status-dot"></span> {{ t('demoReady') }}</p>
        </div>
        <div class="hero-visual" aria-label="Illustration of connected identity services">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="identity-card"><img class="hero-logo" src="/boitsibiso-logo.png" alt="Boitsibiso emblem" /></div>
          <div class="service-bubble bubble-one">⌁<small>{{ t('identity') }}</small></div>
          <div class="service-bubble bubble-two">▣<small>{{ t('services') }}</small></div>
          <div class="service-bubble bubble-three">✓<small>{{ t('verified') }}</small></div>
        </div>
      </section>

      <section class="trust-strip">
        <div class="page-width trust-content">
          <span class="trust-label">{{ t('connectedPeople') }}</span>
          <span>{{ t('homeAffairs') }}</span><span>{{ t('traffic') }}</span><span>{{ t('finance') }}</span><span>{{ t('pensions') }}</span><span>{{ t('police') }}</span><span>{{ t('passportServices') }}</span>
        </div>
      </section>

      <section class="landing-section page-width">
        <div class="section-intro"><p class="eyebrow">{{ t('whyBoitsibiso') }}</p><h2>{{ t('clearServices') }}</h2></div>
        <div class="value-grid">
          <article><div class="value-icon">◈</div><h3>{{ t('oneVerified') }}</h3><p>{{ t('oneVerifiedText') }}</p></article>
          <article><div class="value-icon">↗</div><h3>{{ t('lessWaiting') }}</h3><p>{{ t('lessWaitingText') }}</p></article>
          <article><div class="value-icon">◉</div><h3>{{ t('designedEveryone') }}</h3><p>{{ t('designedEveryoneText') }}</p></article>
        </div>
      </section>
    </main>
    <footer class="public-footer page-width"><span>Boitsibiso National ID Hub</span><span>{{ t('publicFooter') }}</span></footer>
  </div>
</template>
