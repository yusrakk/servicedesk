<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const nama_user = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')
const nip_user = ref('')
const nama_jabatan = ref('')
const nama_organisasi = ref('')
const isLoading = ref(true)

// Greeting berdasarkan jam
const greeting = (() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})()

onMounted(() => {
  const token = localStorage.getItem('Token')
  if (!token) router.push('/login')
})

onBeforeMount(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/user/profile', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(response => {
    nip_user.value = response.data.NIP
    nama_jabatan.value = response.data.user_jabatan.Nama_Jabatan
    nama_organisasi.value = response.data.user_organisasi.Nama_OPD
    localStorage.setItem('nip_user', response.data.NIP)
    localStorage.setItem('nama_jabatan', response.data.user_jabatan.Nama_Jabatan)
    localStorage.setItem('nama_organisasi', response.data.user_organisasi.Nama_OPD)
  })
  .catch(error => console.error(error))
  .finally(() => isLoading.value = false)
})
</script>

<template>
  <div class="beranda">

    <!-- Hero greeting -->
    <div class="beranda__hero">
      <div class="hero__content">
        <div class="hero__badge">
          <span class="badge-dot"></span>
          {{ greeting }}
        </div>
        <h1 class="hero__title">{{ nama_user || 'Pengguna' }}</h1>
        <p class="hero__sub">
          {{ nama_jabatan || '—' }} &nbsp;·&nbsp; {{ nama_organisasi || '—' }}
        </p>
      </div>
      <!-- Decorative orbs -->
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
    </div>

    <!-- Main content -->
    <div class="beranda__body">

      <!-- Section label -->
      <div class="section-intro">
        <span class="section-label">Layanan</span>
        <h2 class="section-heading">Ada yang bisa kami bantu?</h2>
        <p class="section-desc">Pilih layanan di bawah untuk memulai permintaan.</p>
      </div>

      <!-- Cards -->
      <div class="cards-grid">

        <!-- Permintaan Baru -->
        <div class="service-card service-card--primary" @click="router.push('/permintaanBaru')">
          <div class="service-card__icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="11" stroke="currentColor" stroke-width="1.75"/>
              <path d="M13 8v10M8 13h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Permintaan Baru</h3>
            <p class="service-card__desc">Ajukan permintaan layanan IT baru kepada Diskominfo Jabar.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn" @click.stop="router.push('/permintaanBaru')">
              Mulai Permintaan
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="service-card__glow"></div>
        </div>

        <!-- Permintaan Diproses -->
        <div class="service-card" @click="router.push('/permintaanDiproses')">
          <div class="service-card__icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="11" stroke="currentColor" stroke-width="1.75"/>
              <path d="M13 8v5l3.5 3.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Sedang Diproses</h3>
            <p class="service-card__desc">Pantau status permintaan yang sedang dalam proses penanganan.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn service-card__btn--ghost" @click.stop="router.push('/permintaanDiproses')">
              Lihat Status
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Hasil Pemenuhan -->
        <div class="service-card" @click="router.push('/hasilPemenuhanBASLA')">
          <div class="service-card__icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="11" stroke="currentColor" stroke-width="1.75"/>
              <path d="M8.5 13l3 3 6-6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Hasil Pemenuhan</h3>
            <p class="service-card__desc">Lihat hasil dan output dari permintaan layanan yang telah selesai.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn service-card__btn--ghost" @click.stop="router.push('/hasilPemenuhanBASLA')">
              Lihat Hasil
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Riwayat -->
        <div class="service-card" @click="router.push('/riwayat')">
          <div class="service-card__icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 3C7.5 3 3 7.5 3 13s4.5 10 10 10 10-4.5 10-10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <path d="M13 3v4M3 13H7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <path d="M13 9v4l3 2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Riwayat</h3>
            <p class="service-card__desc">Akses seluruh riwayat permintaan layanan yang pernah diajukan.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn service-card__btn--ghost" @click.stop="router.push('/riwayat')">
              Lihat Riwayat
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <!-- Info strip -->
      <div class="info-strip">
        <div class="info-strip__item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M8 5v3.5M8 10v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          Butuh bantuan? Hubungi Helpdesk Diskominfo
        </div>
        <a href="mailto:servicedesk@jabarprov.go.id" class="info-strip__link">
          servicedesk@jabarprov.go.id
        </a>
      </div>

    </div>
  </div>
</template>

<style scoped>
.beranda {
  --color-forest:   #1a3a2a;
  --color-emerald:  #0f5c38;
  --color-jade:     #1a7a4a;
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
  --shadow-sm:      0 1px 3px rgba(13,26,18,.06), 0 1px 2px rgba(13,26,18,.04);
  --shadow-md:      0 4px 16px rgba(13,26,18,.08), 0 2px 6px rgba(13,26,18,.04);
  --shadow-lg:      0 12px 40px rgba(13,26,18,.12);
  --shadow-green:   0 8px 32px rgba(46,184,106,.24);

  font-family: var(--font);
  min-height: 100vh;
  background: var(--color-mist);
}

/* ── HERO ─────────────────────────────────────────── */
.beranda__hero {
  position: relative;
  background: var(--color-forest);
  border-radius: 24px;
  margin: 0 0 1.5rem;
  padding: 3rem 2rem 4rem;
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
  color:rgba(255,255,255,.74);
  background:rgba(255,255,255,.12);
  border:1px solid rgba(255,255,255,.18);
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
  color:#ffffff;
  letter-spacing: -.03em;
  line-height: 1.1;
  margin-bottom: .5rem;
}
.hero__sub {
  font-size: .875rem;
  color:rgba(255,255,255,.74);
  font-weight: 400;
}

/* Orbs */
.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .2;
  pointer-events: none;
}
.hero__orb--1 {
  width: 320px; height: 320px;
  background: var(--color-mint);
  top: -80px; right: -60px;
  animation: orbFloat 8s ease-in-out infinite;
}
.hero__orb--2 {
  width: 200px; height: 200px;
  background: #0a3d22;
  bottom: -60px; left: 20%;
  animation: orbFloat 11s ease-in-out infinite reverse;
}
@keyframes orbFloat {
  0%,100% { transform: translate(0,0); }
  50%      { transform: translate(20px,-15px); }
}

/* ── BODY ─────────────────────────────────────────── */
.beranda__body {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* Section intro */
.section-intro { margin-bottom: 1.75rem; }
.section-label {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--color-mint);
  margin-bottom: .75rem;
}
.section-label::before {
  content: '';
  display: block;
  width: 18px; height: 2px;
  background: var(--color-mint);
  border-radius: 2px;
}
.section-heading {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -.02em;
  margin-bottom: .4rem;
}
.section-desc {
  font-size: .875rem;
  color: var(--color-stone);
}

/* ── CARDS ─────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.service-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow .28s var(--ease-out), transform .28s var(--ease-out);
}
.service-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.service-card:hover .service-card__icon {
  background: var(--color-mint);
  color: var(--color-white);
}

/* Primary card */
.service-card--primary {
  background: linear-gradient(135deg, var(--color-forest), var(--color-emerald));
  border-color: transparent;
}
.service-card--primary .service-card__title { color: var(--color-white); }
.service-card--primary .service-card__desc  { color: rgba(255,255,255,.65); }
.service-card--primary .service-card__icon  {
  background: rgba(255,255,255,.15);
  color: var(--color-white);
  border-color: rgba(255,255,255,.2);
}
.service-card--primary:hover .service-card__icon {
  background: rgba(255,255,255,.25);
  color: var(--color-white);
}

.service-card__glow {
  position: absolute;
  width: 200px; height: 200px;
  background: var(--color-mint);
  border-radius: 50%;
  filter: blur(60px);
  opacity: .15;
  top: -60px; right: -60px;
  pointer-events: none;
}

.service-card__icon {
  width: 52px; height: 52px;
  background: var(--color-foam);
  border: 1px solid rgba(168,200,180,.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-emerald);
  flex-shrink: 0;
  transition: background .25s, color .25s;
}

.service-card__body { flex: 1; }
.service-card__title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -.01em;
  margin-bottom: .4rem;
}
.service-card__desc {
  font-size: .8125rem;
  color: var(--color-stone);
  line-height: 1.6;
}

.service-card__footer {
  padding-top: .75rem;
  border-top: 1px solid rgba(168,200,180,.15);
}
.service-card--primary .service-card__footer {
  border-top-color: rgba(255,255,255,.1);
}

.service-card__btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-family: var(--font);
  font-size: .8125rem;
  font-weight: 700;
  padding: .55rem 1.1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all .2s var(--ease-out);
  background: var(--color-mint);
  color: var(--color-white);
  box-shadow: var(--shadow-green);
}
.service-card__btn:hover {
  background: var(--color-jade);
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(46,184,106,.35);
}
.service-card__btn--ghost {
  background: var(--color-foam);
  color: var(--color-emerald);
  box-shadow: none;
  border: 1.5px solid rgba(46,184,106,.2);
}
.service-card__btn--ghost:hover {
  background: rgba(46,184,106,.12);
  border-color: var(--color-mint);
  box-shadow: none;
}

/* ── INFO STRIP ──────────────────────────────────── */
.info-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .75rem;
  padding: 1rem 1.25rem;
  background: var(--color-white);
  border-radius: 12px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: var(--shadow-sm);
}
.info-strip__item {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .8125rem;
  color: var(--color-stone);
}
.info-strip__link {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--color-emerald);
  text-decoration: none;
  transition: color .15s;
}
.info-strip__link:hover { color: var(--color-mint); text-decoration: underline; }

/* ── RESPONSIVE ──────────────────────────────────── */
@media (max-width: 768px) {
  .beranda__hero  { padding: 2rem 1.25rem 2.5rem; }
  .beranda__body  { padding: 1.25rem; }
  .cards-grid     { grid-template-columns: 1fr; }
  .info-strip     { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .hero__title { font-size: 1.375rem; }
}
</style>