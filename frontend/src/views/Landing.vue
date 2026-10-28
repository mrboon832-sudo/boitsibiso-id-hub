<template>
  <div class="public-shell landing-page">
    <header class="public-nav">
      <router-link class="public-brand" to="/">
        <img class="brand-logo" src="/boitsibiso-logo.png" alt="" />
        <span>Boitsibiso<span class="brand-subtitle">National ID Hub</span></span>
      </router-link>
      <div class="public-nav-actions">
        <span class="secure-note"><span aria-hidden="true">●</span> Secure public service demo</span>
        <router-link class="btn btn-small" to="/login">Enter the hub</router-link>
      </div>
    </header>

    <main>
      <section class="landing-hero page-width">
        <div class="hero-copy">
          <p class="eyebrow">A simpler way to access essential services</p>
          <h1>One trusted identity.<br /><span>Everyday services, connected.</span></h1>
          <p class="hero-lede">Boitsibiso brings identity services together in one clear, accessible hub—so citizens and public service teams can get the right things done with confidence.</p>
          <div class="hero-actions">
            <router-link class="btn" to="/login">Explore the demo <span aria-hidden="true">→</span></router-link>
            <router-link class="text-link" to="/ussd">See the USSD experience <span aria-hidden="true">↗</span></router-link>
          </div>
          <p class="demo-hint"><span class="status-dot"></span> Demo ready · No account required</p>
        </div>
        <div class="hero-visual" aria-label="Illustration of connected identity services">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="identity-card"><img class="hero-logo" src="/boitsibiso-logo.png" alt="Boitsibiso emblem" /></div>
          <div class="service-bubble bubble-one">⌁<small>Identity</small></div>
          <div class="service-bubble bubble-two">▣<small>Services</small></div>
          <div class="service-bubble bubble-three">✓<small>Verified</small></div>
        </div>
      </section>

      <section class="trust-strip">
        <div class="page-width trust-content">
          <span class="trust-label">Connected for people and teams</span>
          <span>Home Affairs</span><span>Traffic</span><span>Finance</span><span>Pensions</span><span>Police</span><span>Passport Services</span>
        </div>
      </section>

      <section class="landing-section page-width">
        <div class="section-intro"><p class="eyebrow">Why Boitsibiso</p><h2>Public services that feel clear, human and connected.</h2></div>
        <div class="value-grid">
          <article><div class="value-icon">◈</div><h3>One verified identity</h3><p>Use one trusted profile across the services that matter most.</p></article>
          <article><div class="value-icon">↗</div><h3>Less waiting, more clarity</h3><p>Track requests, see progress and know what happens next.</p></article>
          <article><div class="value-icon">◉</div><h3>Designed for everyone</h3><p>Accessible digital and USSD journeys built for real communities.</p></article>
        </div>
      </section>
    </main>
    <footer class="public-footer page-width"><span>Boitsibiso National ID Hub</span><span>Public service, made simpler.</span></footer>
  </div>
</template>
