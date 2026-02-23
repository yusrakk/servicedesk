<template>
  <section class="hero-section">
    <!-- Background Image dengan Overlay -->
    <div class="hero-background">
      <img src="/diskominfo.png" alt="" class="bg-image" />
      <div class="bg-overlay"></div>
    </div>

    <div class="hero-container">
      <div class="hero-left">
        <h1 class="hero-title">
          Hallo,<br />
          Servicedesk<br />
          Diskominfo
        </h1>
        <p class="hero-subtitle">
          Platform terpadu untuk pengaduan dan permintaan layanan IT
          seluruh OPD Provinsi Jawa Barat
        </p>
      </div>

      <div class="hero-right">
        <div class="hero-panel">
          <div class="panel-header">
            <svg class="panel-icon-header" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 class="panel-title">Lacak Tiket Anda</h3>
              <p class="panel-desc">Cek status pengaduan atau permintaan</p>
            </div>
          </div>

          <div class="panel-content">
            <form @submit.prevent="handleTrackTicket" class="track-form">
              <div class="form-group">
                <label for="ticketNumber" class="form-label">Nomor Tiket</label>
                <input
                  id="ticketNumber"
                  v-model="ticketNumber"
                  type="text"
                  placeholder="Contoh: TKT-2025-001234"
                  class="form-input"
                  required
                />
              </div>

              <button type="submit" class="btn-track" :disabled="isLoading">
                <svg v-if="!isLoading" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span v-if="isLoading" class="loader"></span>
                {{ isLoading ? 'Mencari...' : 'Lacak Sekarang' }}
              </button>
            </form>

            <div class="divider">
              <span>atau</span>
            </div>

            <div class="quick-links">
              <RouterLink to="/login" class="quick-link">
                <svg class="quick-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l-5-5 5-5m-5 5h12"/>
                </svg>
                Login untuk buat tiket baru
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ticketNumber = ref('')
const isLoading = ref(false)

const handleTrackTicket = async () => {
  if (!ticketNumber.value.trim()) return

  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
    router.push({
      name: 'LacakTiket',
      query: { ticket: ticketNumber.value }
    })
  }, 800)
}
</script>

<style scoped>
.hero-section {
  padding: 80px 0 60px;
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* Background Image + Overlay (Portal Jabar Style) */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: blur(0px) brightness(0.85);
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(45, 93, 66, 0.85) 0%,
    rgba(64, 103, 82, 0.75) 50%,
    rgba(74, 125, 88, 0.65) 100%
  );
  /* Alternatif overlay jika mau lebih gelap: */
  /* background: rgba(0, 0, 0, 0.5); */
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-left {
  color: #ffffff;
}

.hero-title {
  font-size: 56px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0 0 20px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 17px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  max-width: 500px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

/* GLASSMORPHISM PANEL */
.hero-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  position: relative;
}

/* Glass reflection */
.hero-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.panel-header {
  background: linear-gradient(135deg, 
    rgba(45, 93, 66, 0.9) 0%, 
    rgba(58, 117, 86, 0.9) 100%);
  backdrop-filter: blur(10px);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.panel-icon-header {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.panel-desc {
  font-size: 13px;
  margin: 0;
  opacity: 0.95;
}

.panel-content {
  padding: 28px 24px 24px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(255, 255, 255, 0.65) 100%
  );
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 2;
}

.track-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.form-input {
  padding: 13px 16px;
  border: 2px solid rgba(209, 213, 219, 0.6);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  font-family: inherit;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.form-input:focus {
  outline: none;
  border-color: #2d5d42;
  background: #ffffff;
  box-shadow: 
    0 0 0 4px rgba(45, 93, 66, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
}

.btn-track {
  background: linear-gradient(135deg, #2d5d42 0%, #3a7556 100%);
  color: #ffffff;
  padding: 15px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 
    0 6px 20px rgba(45, 93, 66, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.btn-track::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  transition: left 0.5s;
}

.btn-track:hover:not(:disabled)::before {
  left: 100%;
}

.btn-track:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 28px rgba(45, 93, 66, 0.45),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.btn-track:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(45, 93, 66, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.btn-track:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  margin: 20px 0;
  text-align: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.15) 50%,
    transparent
  );
}

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 16px;
  position: relative;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 12px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.quick-link:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(209, 213, 219, 0.7);
  transform: translateX(6px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.quick-link-icon {
  width: 18px;
  height: 18px;
  color: #2d5d42;
}

/* Responsive */
@media (max-width: 968px) {
  .hero-section {
    min-height: auto;
    padding: 60px 0 40px;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-title {
    font-size: 42px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .panel-header {
    padding: 20px;
  }

  .panel-content {
    padding: 24px 20px 20px;
  }
}

@media (max-width: 640px) {
  .hero-container {
    padding: 0 20px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .panel-header {
    flex-direction: column;
    text-align: center;
  }

  .form-input,
  .btn-track,
  .quick-link {
    border-radius: 10px;
  }
}
</style>