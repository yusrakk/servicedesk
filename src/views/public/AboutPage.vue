<template>
  <div class="about-page">
    <PublicHeader />

    <!-- Hero -->
    <section class="about-hero">
      <div class="container">
        <span class="section-label" style="color: rgba(255,255,255,0.7)">Tentang Kami</span>
        <h1 class="about-hero__title">Melayani dengan<br><em>Teknologi</em></h1>
        <p class="about-hero__sub">
          Diskominfo Jawa Barat berkomitmen untuk menyediakan layanan teknologi informasi yang andal, efisien, dan transparan bagi seluruh ASN Provinsi Jawa Barat.
        </p>
      </div>
      <div class="about-hero__image">
        <div class="image-placeholder">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.3">
            <rect x="8" y="16" width="48" height="32" rx="4" stroke="white" stroke-width="2"/>
            <path d="M8 24h48M24 16v32M40 16v32" stroke="white" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Mission -->
    <section class="about-mission">
      <div class="container about-mission__inner">
        <div class="animate-fade-up">
          <span class="section-label">Visi</span>
          <h2 class="section-heading" style="font-size: var(--text-2xl); margin-top: var(--space-3)">
            Tata Kelola TIK yang Terintegrasi dan Berkelanjutan
          </h2>
        </div>
        <div class="mission-cards">
          <div v-for="(item, i) in missions" :key="i" class="mission-card animate-fade-up" :style="{ animationDelay: `${i*100}ms` }">
            <div class="mission-card__num">{{ String(i+1).padStart(2,'0') }}</div>
            <h3 class="mission-card__title">{{ item.title }}</h3>
            <p class="mission-card__desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team / OPD Info -->
    <section class="about-info">
      <div class="container">
        <div class="info-grid">
          <div class="info-block card" style="padding: var(--space-8)">
            <span class="section-label">Identitas</span>
            <h3 class="info-block__heading">Dinas Komunikasi dan Informatika</h3>
            <p class="info-block__text">
              Dinas Komunikasi dan Informatika Provinsi Jawa Barat adalah perangkat daerah yang menangani urusan komunikasi, informatika, statistik, dan persandian di Provinsi Jawa Barat.
            </p>
            <div class="info-contact">
              <div class="contact-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 7 4.5 7S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="var(--color-emerald)" stroke-width="1.4"/><circle cx="8" cy="6" r="1.5" stroke="var(--color-emerald)" stroke-width="1.4"/></svg>
                Jl. Tamansari No. 55, Bandung 40132
              </div>
              <div class="contact-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="var(--color-emerald)" stroke-width="1.4"/><path d="M1.5 5l6.5 4.5L14.5 5" stroke="var(--color-emerald)" stroke-width="1.4"/></svg>
                diskominfo@jabarprov.go.id
              </div>
              <div class="contact-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 10.5c-.5 1.2-1.6 1.8-2.8 1.3C8 10.5 5.5 8 4.2 5.3 3.7 4.1 4.2 3 5.4 2.5l.6-.2 1.8 3-.6.5c-.3.3-.8.8-.5 1.5.7 1.2 1.9 2.4 3.1 3.1.7.4 1.2-.2 1.5-.5l.6-.6 3 1.8-.5.9z" stroke="var(--color-emerald)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                (022) 2023-5678
              </div>
            </div>
          </div>
          <div class="info-block card" style="padding: var(--space-8)">
            <span class="section-label">Service Desk</span>
            <h3 class="info-block__heading">Tentang Platform Ini</h3>
            <p class="info-block__text">
              Platform ServiceDesk Diskominfo dibangun untuk mempermudah seluruh ASN Provinsi Jawa Barat dalam mengakses layanan IT, melaporkan kendala teknis, dan melacak progres penanganan secara real-time.
            </p>
            <div class="info-features">
              <div v-for="f in features" :key="f" class="info-feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="var(--color-mint)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ f }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <PublicFooter />
  </div>
</template>

<script setup>
import PublicHeader from './components/PublicHeader.vue'
import PublicFooter from './components/PublicFooter.vue'

const missions = [
  {
    title: 'Pengaduan Transparan',
    desc: 'Setiap pengaduan tercatat, terlacak, dan ditangani secara sistematis dengan SLA yang terukur.',
  },
  {
    title: 'Respon Cepat',
    desc: 'Tim teknis kami berkomitmen untuk merespons setiap tiket dalam waktu kurang dari 2 jam kerja.',
  },
  {
    title: 'Layanan Terintegrasi',
    desc: 'Satu platform untuk semua layanan IT: email, jaringan, server, aplikasi, dan infrastruktur.',
  },
]

const features = [
  'Sistem tiket berbasis prioritas',
  'Notifikasi real-time via email',
  'Laporan dan statistik layanan',
  'Integrasi dengan SSO Jabar',
  'Mobile-friendly interface',
]
</script>

<style scoped>
.about-page { min-height: 100vh; }

.about-hero {
  background: linear-gradient(135deg, var(--color-forest), var(--color-emerald));
  padding: calc(68px + var(--space-12)) 0 0;
  position: relative;
  overflow: hidden;
}
.about-hero .container {
  padding-bottom: var(--space-12);
  position: relative;
  z-index: 1;
}
.about-hero__title {
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: white;
  margin: var(--space-3) 0 var(--space-5);
  line-height: 1.05;
}
.about-hero__title em { font-style: normal; color: var(--color-mint); }
.about-hero__sub {
  font-size: var(--text-lg);
  color: rgba(255,255,255,0.65);
  max-width: 560px;
  line-height: 1.7;
}
.about-hero__image {
  height: 180px;
  background: rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-8);
}
.image-placeholder { display: flex; align-items: center; justify-content: center; }

/* Mission */
.about-mission { padding: var(--space-24) 0; background: var(--color-white); }
.about-mission__inner { display: flex; flex-direction: column; gap: var(--space-12); }
.mission-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}
.mission-card {
  padding: var(--space-6);
  background: var(--color-mist);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(168,200,180,0.2);
}
.mission-card__num {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-foam);
  line-height: 1;
  margin-bottom: var(--space-4);
  letter-spacing: -0.04em;
  /* Outlined effect */
  -webkit-text-stroke: 1.5px var(--color-sage);
  color: transparent;
}
.mission-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-3);
}
.mission-card__desc { font-size: var(--text-sm); color: var(--color-stone); line-height: 1.7; }

/* Info */
.about-info { padding: 0 0 var(--space-24); background: var(--color-mist); }
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
.info-block__heading {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  margin: var(--space-3) 0 var(--space-4);
  letter-spacing: -0.02em;
}
.info-block__text { font-size: var(--text-sm); color: var(--color-stone); line-height: 1.75; margin-bottom: var(--space-6); }

.info-contact { display: flex; flex-direction: column; gap: var(--space-3); }
.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-charcoal);
  line-height: 1.5;
}

.info-features { display: flex; flex-direction: column; gap: var(--space-2); }
.info-feature {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-charcoal);
}

@media (max-width: 1024px) {
  .mission-cards { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .about-mission, .about-info { padding: var(--space-16) 0; }
}
</style>