<template>
  <section class="info-section">
    <div class="info-container">
      <h2 class="section-title">Statistik Layanan</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h10V4H7zm2 2h6v2H9V6zm0 4h6v2H9v-2zm0 4h4v2H9v-2z"/>
            </svg>
          </div>
          <div class="stat-value">1,234</div>
          <div class="stat-label">Total Tiket</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="stat-value">2.5 jam</div>
          <div class="stat-label">Waktu Respon Rata-rata</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="stat-value">98%</div>
          <div class="stat-label">Tingkat Kepuasan</div>
        </div>
      </div>

      <div class="faq-section">
        <h3 class="faq-title">Pertanyaan Umum</h3>
        <div class="faq-grid">
          <div class="faq-card">
            <h4 class="faq-question">Bagaimana cara mengajukan tiket?</h4>
            <p class="faq-answer">Login ke sistem, pilih menu Pengaduan atau Permintaan, isi formulir, dan submit.</p>
          </div>
          <div class="faq-card">
            <h4 class="faq-question">Berapa lama waktu penyelesaian?</h4>
            <p class="faq-answer">Tergantung jenis dan prioritas. Rata-rata 1-3 hari kerja.</p>
          </div>
          <div class="faq-card">
            <h4 class="faq-question">Siapa yang bisa menggunakan layanan ini?</h4>
            <p class="faq-answer">Seluruh pegawai OPD Provinsi Jawa Barat yang terdaftar.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-section {
  padding: 60px 0 80px;
  position: relative;
  z-index: 1;
}

.info-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 40px 0;
  text-align: center;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* Glass reflection */
.stat-card::before {
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

.stat-card:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-8px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.stat-icon-wrapper {
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

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.faq-section {
  margin-top: 60px;
}

.faq-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.faq-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 28px 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.faq-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.faq-question {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.faq-answer {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 968px) {
  .stats-grid,
  .faq-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .section-title {
    font-size: 32px;
  }

  .stat-value {
    font-size: 36px;
  }

  .faq-title {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .info-container {
    padding: 0 20px;
  }

  .section-title {
    font-size: 28px;
  }

  .stat-card,
  .faq-card {
    padding: 24px 20px;
  }

  .stat-icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

  .stat-value {
    font-size: 32px;
  }
}
</style>