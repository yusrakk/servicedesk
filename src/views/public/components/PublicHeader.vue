<template>
  <header class="public-header">
    <div class="header-container">
      <RouterLink to="/" class="header-left">
        <div class="logo-wrapper">
          <!-- LOGO -->
          <div class="logo-image-container">
            <img src="/logo-diskominfo.png" alt="Diskominfo Jabar" class="logo-img" />
          </div>
          <div class="logo-text-wrapper">
            <span class="logo-title">ServiceDesk</span>
            <span class="logo-subtitle">Diskominfo Jawa Barat</span>
          </div>
        </div>
      </RouterLink>

      <nav class="header-nav">
        <RouterLink to="/" class="nav-link">Beranda</RouterLink>
        <RouterLink to="/about" class="nav-link">Tentang Kami</RouterLink>
        <RouterLink to="/login" class="btn-login">Login</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.public-header {
  background: rgba(42, 97, 66, 0.5);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* ⬅️ INI KUNCI */
.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  min-height: 96px; /* HEADER JADI LEGIT */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.2s;
}

.header-left:hover {
  transform: scale(1.02);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* CONTAINER LOGO */
.logo-image-container {
  height: 64px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ⬅️ LOGO REAL SIZE, NO DISTORT */
.logo-img {
  height: 64px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25));
}

.logo-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.8px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  position: relative;
  padding: 6px 0;
}

.nav-link.router-link-active {
  color: #ffffff;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
}

.btn-login {
  background: #ffffff;
  color: #2d5d42;
  padding: 12px 32px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .header-container {
    min-height: 80px;
    padding: 0 20px;
  }

  .logo-image-container {
    height: 48px;
  }

  .logo-img {
    height: 48px;
  }

  .logo-title {
    font-size: 20px;
  }

  .logo-subtitle {
    font-size: 13px;
  }
}

</style>