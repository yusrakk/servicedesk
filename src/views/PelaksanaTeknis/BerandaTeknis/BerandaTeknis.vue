<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ChartProgressKeseluruhan from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressKeseluruhan.vue'
import ChartProgressBulanIni from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressBulanIni.vue'
import ChartPermintaanLayanan from '../../Pengelola/BerandaPengelola/Chart/ChartPie-PermintaanLayanan.vue'
import ChartBarPermintaanBerdasarkanStatus from '../../Pengelola/BerandaPengelola/Chart/ChartBar-PermintaanBerdasarkanStatus.vue'
import ChartBarPermintaanBerdasarkanPengelolaTeknis from '../../Pengelola/BerandaPengelola/Chart/ChartBar-PermintaanBerdasarkanPengelolaTeknis.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const jumlahPermintaanBaru      = ref('-')
const jumlahPenggunaTerdaftar   = ref('-')
const jumlahOrganisasiTerdaftar = ref('-')
const isLoading      = ref(true)
const nama_jabatan   = ref('')
const nama_organisasi = ref('')
const nama_user = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')

const greeting = (() => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})()

onMounted(async () => {
  const token = localStorage.getItem('Token')
  if (!token) { router.push('/login'); return }

  try {
    const [profileRes, userCountRes, layananRes, organisasiRes] = await Promise.all([
      axios.get('/api/user/profile',    { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/userCount',       { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/allPelayanan',    { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/organisasiCount', { headers: { Authorization: 'Bearer ' + token } }),
    ])
    const profile = profileRes.data
    nama_jabatan.value    = profile.user_jabatan?.Nama_Jabatan || '-'
    nama_organisasi.value = profile.user_organisasi?.Nama_OPD || '-'
    jumlahPenggunaTerdaftar.value   = userCountRes.data
    jumlahPermintaanBaru.value      = layananRes.data
    jumlahOrganisasiTerdaftar.value = organisasiRes.data
    localStorage.setItem('nip_user',        profile.NIP)
    localStorage.setItem('nama_jabatan',    profile.user_jabatan?.Nama_Jabatan || '-')
    localStorage.setItem('nama_organisasi', profile.user_organisasi?.Nama_OPD || '-')
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="beranda-teknis">

    <!-- Hero -->
    <div class="hero">
      <div class="hero__content">
        <div class="hero__badge">
          <span class="badge-dot"></span>
          {{ greeting }} — Pelaksana Teknis
        </div>
        <h1 class="hero__title">{{ nama_user || 'Pelaksana Teknis' }}</h1>
        <p class="hero__sub">{{ nama_jabatan }} &nbsp;·&nbsp; {{ nama_organisasi }}</p>
      </div>
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
    </div>

    <div class="body">

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-card__body">
            <p class="stat-card__label">Permintaan Layanan</p>
            <div v-if="isLoading" class="stat-card__skeleton"></div>
            <p v-else class="stat-card__value">{{ jumlahPermintaanBaru }}</p>
          </div>
          <div class="stat-card__accent"></div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke="currentColor" stroke-width="1.6"/>
              <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-card__body">
            <p class="stat-card__label">Pengguna Terdaftar</p>
            <div v-if="isLoading" class="stat-card__skeleton"></div>
            <p v-else class="stat-card__value">{{ jumlahPenggunaTerdaftar }}</p>
          </div>
          <div class="stat-card__accent"></div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--amber">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
              <path d="M7 8h2M7 11h6M7 14h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M13 2v4M7 2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-card__body">
            <p class="stat-card__label">Organisasi Terdaftar</p>
            <div v-if="isLoading" class="stat-card__skeleton"></div>
            <p v-else class="stat-card__value">{{ jumlahOrganisasiTerdaftar }}</p>
          </div>
          <div class="stat-card__accent"></div>
        </div>
      </div>

      <!-- Charts Pie -->
      <div class="section-label-wrap">
        <span class="section-label">Progress</span>
        <h2 class="section-heading">Statistik Permintaan</h2>
      </div>
      <div class="charts-pie-grid">
        <div class="chart-card"><ChartProgressKeseluruhan /></div>
        <div class="chart-card"><ChartProgressBulanIni /></div>
        <div class="chart-card"><ChartPermintaanLayanan /></div>
      </div>

      <!-- Charts Bar -->
      <div class="section-label-wrap mt">
        <span class="section-label">Analitik</span>
        <h2 class="section-heading">Detail Permintaan</h2>
      </div>
      <div class="charts-bar-grid">
        <div class="chart-card chart-card--full">
          <ChartBarPermintaanBerdasarkanStatus />
        </div>
        <div class="chart-card chart-card--full">
          <ChartBarPermintaanBerdasarkanPengelolaTeknis />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.beranda-teknis {
  --color-forest:   #1a3a2a;
  --color-emerald:  #0f5c38;
  --color-mint:     #2eb86a;
  --color-foam:     #e8f4ee;
  --color-ink:      #0d1a12;
  --color-charcoal: #2c3e35;
  --color-stone:    #5a7566;
  --color-silver:   #b8ccc2;
  --color-mist:     #f0f6f2;
  --color-white:    #ffffff;
  --font:           'Plus Jakarta Sans', sans-serif;
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-sm:      0 1px 3px rgba(13,26,18,.06);
  --shadow-md:      0 4px 16px rgba(13,26,18,.08);

  font-family: var(--font);
  min-height: 100vh;
  background: var(--color-mist);
}

/* ── HERO ── */
.hero {
  position: relative;
  background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-emerald) 60%, #1a5c38 100%);
  padding: 2.5rem 2rem 3.5rem;
  overflow: hidden;
}
.hero__content { position: relative; z-index: 1; }
.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(255,255,255,.75);
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  padding: .3rem .9rem;
  border-radius: 99px;
  margin-bottom: 1rem;
}
.badge-dot {
  width: 6px; height: 6px;
  background: var(--color-mint);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(46,184,106,.3);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 3px rgba(46,184,106,.3); }
  50%      { box-shadow: 0 0 0 6px rgba(46,184,106,.1); }
}
.hero__title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -.03em;
  line-height: 1.1;
  margin-bottom: .5rem;
}
.hero__sub { font-size: .875rem; color: rgba(255,255,255,.6); }
.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .2;
  pointer-events: none;
}
.hero__orb--1 { width: 320px; height: 320px; background: var(--color-mint); top: -80px; right: -60px; animation: orbFloat 8s ease-in-out infinite; }
.hero__orb--2 { width: 200px; height: 200px; background: #0a3d22; bottom: -60px; left: 20%; animation: orbFloat 11s ease-in-out infinite reverse; }
@keyframes orbFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-15px); } }

/* ── BODY ── */
.body { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.mt { margin-top: 2rem; }

/* Section labels */
.section-label-wrap { margin-bottom: 1.25rem; }
.section-label {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--color-mint);
  margin-bottom: .5rem;
}
.section-label::before {
  content: '';
  display: block;
  width: 18px; height: 2px;
  background: var(--color-mint);
  border-radius: 2px;
}
.section-heading {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -.02em;
}

/* ── STATS ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: box-shadow .25s, transform .25s;
}
.stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.stat-card__accent {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-mint), var(--color-emerald));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .3s var(--ease-out);
}
.stat-card:hover .stat-card__accent { transform: scaleX(1); }
.stat-card__icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card__icon--green { background: var(--color-foam); color: var(--color-emerald); }
.stat-card__icon--blue  { background: #eff6ff; color: #2563eb; }
.stat-card__icon--amber { background: #fffbeb; color: #d97706; }
.stat-card__body { flex: 1; }
.stat-card__label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: .375rem;
}
.stat-card__value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -.03em;
  line-height: 1;
}
.stat-card__skeleton {
  width: 60px; height: 32px;
  background: linear-gradient(90deg, var(--color-mist) 25%, var(--color-foam) 50%, var(--color-mist) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── CHARTS ── */
.charts-pie-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 1rem;
}
.charts-bar-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.chart-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.chart-card--full { height: 320px; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .stats-grid      { grid-template-columns: 1fr 1fr; }
  .charts-pie-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .hero  { padding: 2rem 1.25rem 2.5rem; }
  .body  { padding: 1.25rem; }
  .stats-grid      { grid-template-columns: 1fr; }
  .charts-pie-grid { grid-template-columns: 1fr; }
}
</style>