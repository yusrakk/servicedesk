<template>
  <section class="quick-actions">
    <div class="actions-container">
      <div class="action-card" @click="handleAction('/user/permintaan/baru')">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            <path d="M15 3v5a1 1 0 001 1h5"/>
          </svg>
        </div>
        <h3 class="card-title">Ajukan Pengaduan</h3>
        <p class="card-description">Laporkan masalah atau kendala IT</p>
      </div>

      <div class="action-card" @click="handleAction('/user/permintaan/baru')">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <h3 class="card-title">Permintaan Layanan</h3>
        <p class="card-description">Request layanan IT & infrastruktur</p>
      </div>

      <div class="action-card" @click="handleAction('/lacak')">
        <div class="card-icon-wrapper">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3 class="card-title">Lacak Tiket</h3>
        <p class="card-description">Cek status tiket Anda</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleAction = (path) => {
  router.push(path)
}
</script>

<style scoped>
.quick-actions {
  padding: 40px 0;
  position: relative;
  z-index: 1;
}

.actions-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.action-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* Glass reflection */
.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.card-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.action-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.35) 0%, 
    rgba(255, 255, 255, 0.25) 100%);
}

.card-icon {
  width: 40px;
  height: 40px;
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.card-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 968px) {
  .actions-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .action-card {
    padding: 32px 28px;
  }

  .card-icon-wrapper {
    width: 70px;
    height: 70px;
  }

  .card-icon {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 640px) {
  .actions-container {
    padding: 0 20px;
  }

  .action-card {
    padding: 28px 24px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-description {
    font-size: 13px;
  }
}
</style>