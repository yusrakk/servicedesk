<template>
  <section class="hero">
    <!-- Background -->
    <div class="hero__bg">
      <div class="hero__gradient"></div>
      <div class="hero__grid"></div>
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
    </div>

    <div class="container hero__inner">
      <!-- Left: Copy -->
      <div class="hero__copy">
        <div class="hero__badge animate-fade-up">
          <span class="badge-dot"></span>
          Sistem Layanan Aktif
        </div>

        <h1 class="hero__title animate-fade-up delay-1">
          Platform Layanan<br>
          <em>IT Terpadu</em><br>
          Jawa Barat
        </h1>

        <p class="hero__desc animate-fade-up delay-2">
          Satu platform untuk seluruh pengaduan dan permintaan layanan teknologi informasi OPD Provinsi Jawa Barat.
        </p>

        <div class="hero__ctas animate-fade-up delay-3">
          <a href="/pengaduan" class="btn btn-primary btn--lg">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Buat Pengaduan
          </a>
          <a href="/lacak" class="btn btn-ghost btn--lg">
            Lacak Tiket
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <!-- Mini stats -->
        <div class="hero__stats animate-fade-up delay-4">
          <div class="hero-stat">
            <span class="hero-stat__value">1,234</span>
            <span class="hero-stat__label">Total Tiket</span>
          </div>
          <div class="hero-stat__divider"></div>
          <div class="hero-stat">
            <span class="hero-stat__value">2.5 jam</span>
            <span class="hero-stat__label">Waktu Respons</span>
          </div>
          <div class="hero-stat__divider"></div>
          <div class="hero-stat">
            <span class="hero-stat__value">98%</span>
            <span class="hero-stat__label">Kepuasan</span>
          </div>
        </div>
      </div>

      <!-- Right: Track Ticket Card -->
      <div class="hero__card animate-scale-in delay-2">
        <div class="track-card">
          <div class="track-card__header">
            <div class="track-card__icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3h12a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="var(--color-mint)" stroke-width="1.5"/>
                <path d="M5 7h8M5 10h5" stroke="var(--color-mint)" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <p class="track-card__title">Lacak Tiket Anda</p>
              <p class="track-card__sub">Cek status pengaduan atau permintaan</p>
            </div>
          </div>

          <div class="track-card__form">
            <label class="form-label">Nomor Tiket</label>
            <input
              v-model="ticketNumber"
              type="text"
              class="input"
              placeholder="Contoh: TKT-2025-001234"
            />

            <button class="btn btn-primary btn--full" @click="trackTicket" :disabled="!ticketNumber">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Lacak Sekarang
            </button>
          </div>

          <div class="track-card__divider">
            <span>atau</span>
          </div>

          <a href="/login" class="track-card__login">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2h2.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M6 10l3-3-3-3M9 7H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Login untuk lihat tiket Anda
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Scroll Hint -->
    <div class="hero__scroll">
      <div class="scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const ticketNumber = ref('')

const trackTicket = () => {
  if (ticketNumber.value) {
    window.location.href = `/lacak?id=${ticketNumber.value}`
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 68px;
}

/* Background layers */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-forest) 0%,
    var(--color-emerald) 50%,
    #1a5c38 100%
  );
}
.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}
.hero__orb--1 {
  width: 500px;
  height: 500px;
  background: var(--color-mint);
  top: -100px;
  right: -100px;
  animation: orbFloat 8s ease-in-out infinite;
}
.hero__orb--2 {
  width: 350px;
  height: 350px;
  background: #0a3d22;
  bottom: -80px;
  left: 10%;
  animation: orbFloat 10s ease-in-out infinite reverse;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}

/* Content */
.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: var(--space-16);
  align-items: center;
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

/* Copy */
.hero__copy { color: var(--color-white); }

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
}
.badge-dot {
  width: 7px;
  height: 7px;
  background: var(--color-mint);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(46,184,106,0.3);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(46,184,106,0.3); }
  50% { box-shadow: 0 0 0 6px rgba(46,184,106,0.1); }
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.5vw, 4rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-white);
  margin-bottom: var(--space-6);
}
.hero__title em {
  font-style: normal;
  color: var(--color-mint);
  position: relative;
}

.hero__desc {
  font-size: var(--text-lg);
  line-height: 1.7;
  color: rgba(255,255,255,0.7);
  max-width: 480px;
  margin-bottom: var(--space-8);
}

.hero__ctas {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
  flex-wrap: wrap;
}
.btn--lg {
  padding: var(--space-4) var(--space-8) !important;
  font-size: var(--text-base) !important;
}

/* Override ghost button for dark bg */
.hero .btn-ghost {
  color: rgba(255,255,255,0.85);
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.06);
}
.hero .btn-ghost:hover {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.12);
  color: white;
}

/* Mini stats */
.hero__stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.hero-stat__value {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-white);
  line-height: 1;
}
.hero-stat__label {
  display: block;
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.55);
  margin-top: 2px;
}
.hero-stat__divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.15);
}

/* Track Card */
.hero__card { position: relative; }
.track-card {
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.5);
}
.track-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-foam);
}
.track-card__icon {
  width: 40px;
  height: 40px;
  background: var(--color-foam);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.track-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1;
  margin-bottom: 4px;
}
.track-card__sub {
  font-size: var(--text-xs);
  color: var(--color-stone);
}
.track-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.form-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-charcoal);
  letter-spacing: 0.03em;
  display: block;
  margin-bottom: var(--space-1);
}
.btn--full {
  width: 100%;
  justify-content: center;
}
.btn--full:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

.track-card__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-4) 0;
}
.track-card__divider::before,
.track-card__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-foam);
}
.track-card__divider span {
  font-size: var(--text-xs);
  color: var(--color-stone);
  white-space: nowrap;
}

.track-card__login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-emerald);
  text-decoration: none;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast), color var(--duration-fast);
}
.track-card__login:hover {
  background: var(--color-foam);
  color: var(--color-jade);
}

/* Scroll hint */
.hero__scroll {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  z-index: 1;
}
.scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.2); transform-origin: top; }
}

@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    padding-top: var(--space-12);
    padding-bottom: var(--space-12);
  }
  .hero__card { max-width: 480px; }
}

@media (max-width: 640px) {
  .hero__ctas { flex-direction: column; align-items: flex-start; }
  .hero__stats { flex-wrap: wrap; gap: var(--space-4); }
  .hero-stat__divider { display: none; }
}
</style>
