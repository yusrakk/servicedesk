<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="container header__inner">
      <!-- Logo -->
      <a href="/" class="header__logo">
        <div class="logo-mark">
          <img src="/LogoServiceDesk.svg" alt="Logo ServiceDesk" class="logo-img" />
        </div>
        <div class="logo-text">
          <span class="logo-title">ServiceDesk</span>
          <span class="logo-sub">Diskominfo Jawa Barat</span>
        </div>
      </a>

      <!-- Desktop Nav -->
      <nav class="header__nav">
        <a href="#" class="nav-link" :class="{ active: $route?.path === '/' }">Beranda</a>
        <!-- <a href="/tentang" class="nav-link">Tentang Kami</a> -->
      </nav>

      <!-- Actions -->
      <div class="header__actions">
        <a href="/login" class="btn btn-primary btn--sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2h2.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H9M6 10l3-3-3-3M9 7H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Login
        </a>

        <!-- Mobile Hamburger -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" :class="{ open: mobileOpen }"><span></span><span></span><span></span></button>
      </div>
    </div>

    <!-- Mobile Nav -->
    <transition name="mobile-nav">
      <div v-if="mobileOpen" class="mobile-nav">
        <div class="container">
          <a href="/" class="mobile-nav__link" @click="mobileOpen = false">Beranda</a>
          <!-- <a href="/tentang" class="mobile-nav__link" @click="mobileOpen = false">Tentang Kami</a> -->
          <a href="/login" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem">Login</a>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const mobileOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1a3a2a, #0f5c38);
  backdrop-filter: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition:
    background var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
  padding: 0;
}

.header--scrolled {
  background: linear-gradient(135deg, #1a3a2a, #0f5c38);
  backdrop-filter: none;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}

.header__inner {
  display: flex;
  align-items: center;
  height: 68px;
  gap: var(--space-8);
}

/* Logo */
.header__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  flex-shrink: 0;
}
.logo-mark {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
}
.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.header__logo:hover .logo-mark {
  transform: rotate(-5deg) scale(1.05);
}
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 2px;
}
.logo-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: #2eb86a;
  letter-spacing: -0.01em;
}
.logo-sub {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* Nav */
.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: auto;
}
.nav-link {
  font-size: var(--text-sm);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition:
    color var(--duration-fast),
    background var(--duration-fast);
}
.nav-link:hover,
.nav-link.active {
  color: #2eb86a;
  background: rgba(46, 184, 106, 0.12);
}

/* Actions */
.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.btn--sm {
  padding: var(--space-2) var(--space-4) !important;
  font-size: var(--text-xs) !important;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: var(--space-2);
  background: none;
  border: none;
  cursor: pointer;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: all var(--duration-normal) var(--ease-out);
  transform-origin: center;
}
.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Nav */
.mobile-nav {
  background: #1a3a2a;
  border-top: 1px solid rgba(46, 184, 106, 0.2);
  padding: var(--space-5) 0;
  box-shadow: var(--shadow-md);
}
.mobile-nav__link {
  display: block;
  font-size: var(--text-base);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(46, 184, 106, 0.15);
  transition: color var(--duration-fast);
}
.mobile-nav__link:hover {
  color: #2eb86a;
}

/* Transition */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .header__nav {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .logo-sub {
    display: none;
  }
  .header__inner {
    gap: var(--space-4);
  }
}
@media (max-width: 360px) {
  .logo-title {
    font-size: 0.875rem;
  }
}
</style>
