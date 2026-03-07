<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import ChartProgressKeseluruhan from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressKeseluruhan.vue'
import ChartProgressBulanIni from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressBulanIni.vue'

const router = useRouter()
const nama_user       = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')
const nip_user        = ref('')
const nama_jabatan    = ref('')
const nama_organisasi = ref('')

const greeting = (() => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})()

onMounted(() => {
  const token = localStorage.getItem('Token')
  if (!token) router.push('/login')
})

onBeforeMount(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/user/profile', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      nip_user.value        = res.data.NIP
      nama_jabatan.value    = res.data.user_jabatan.Nama_Jabatan
      nama_organisasi.value = res.data.user_organisasi.Nama_OPD
      localStorage.setItem('nip_user',        res.data.NIP)
      localStorage.setItem('nama_jabatan',    res.data.user_jabatan.Nama_Jabatan)
      localStorage.setItem('nama_organisasi', res.data.user_organisasi.Nama_OPD)
    })
    .catch(e => console.error(e))
})
</script>

<template>
  <div class="beranda-unit">
    <div class="hero">
      <div class="hero__content">
        <div class="hero__badge"><span class="badge-dot"></span>{{ greeting }} — Unit Pelaksana</div>
        <h1 class="hero__title">{{ nama_user || 'Unit Pelaksana' }}</h1>
        <p class="hero__sub">{{ nama_jabatan }} &nbsp;·&nbsp; {{ nama_organisasi }}</p>
      </div>
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
    </div>

    <div class="body">

      <!-- Action Cards -->
      <div class="section-label-wrap">
        <span class="section-label">Tugas</span>
        <h2 class="section-heading">Apa yang ingin dilaksanakan?</h2>
      </div>
      <div class="cards-grid">

        <div class="service-card service-card--primary" @click="router.push('/approval')">
          <div class="service-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Persetujuan Permintaan</h3>
            <p class="service-card__desc">Setujui permintaan pelayanan yang diajukan kepada Diskominfo Jabar.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn" @click.stop="router.push('/approval')">
              Buka Persetujuan
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="service-card__glow"></div>
        </div>

        <div class="service-card" @click="router.push('/disposisi')">
          <div class="service-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="service-card__body">
            <h3 class="service-card__title">Disposisi Permintaan</h3>
            <p class="service-card__desc">Disposisikan permintaan pelayanan yang telah disetujui ke pelaksana teknis.</p>
          </div>
          <div class="service-card__footer">
            <button class="service-card__btn service-card__btn--ghost" @click.stop="router.push('/disposisi')">
              Buka Disposisi
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>

      </div>

      <!-- Charts -->
      <div class="section-label-wrap mt">
        <span class="section-label">Overview</span>
        <h2 class="section-heading">Progress Permintaan</h2>
      </div>
      <div class="charts-grid">
        <div class="chart-card"><ChartProgressKeseluruhan /></div>
        <div class="chart-card"><ChartProgressBulanIni /></div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.beranda-unit {
  --color-forest:  #1a3a2a; --color-emerald: #0f5c38; --color-mint: #2eb86a;
  --color-foam:    #e8f4ee; --color-ink:     #0d1a12; --color-stone: #5a7566;
  --color-mist:    #f0f6f2; --color-white:   #ffffff;
  --font:          'Plus Jakarta Sans', sans-serif;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-sm:     0 1px 3px rgba(13,26,18,.06);
  --shadow-lg:     0 12px 40px rgba(13,26,18,.12);
  --shadow-green:  0 8px 32px rgba(46,184,106,.24);
  font-family: var(--font); min-height: 100vh; background: var(--color-mist);
}

/* HERO */
.hero {
  position: relative;
  background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-emerald) 60%, #1a5c38 100%);
  padding: 2.5rem 2rem 3.5rem; overflow: hidden;
}
.hero__content { position: relative; z-index: 1; }
.hero__badge {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: rgba(255,255,255,.75); background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15); padding: .3rem .9rem; border-radius: 99px; margin-bottom: 1rem;
}
.badge-dot { width: 6px; height: 6px; background: var(--color-mint); border-radius: 50%; box-shadow: 0 0 0 3px rgba(46,184,106,.3); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px rgba(46,184,106,.3); } 50% { box-shadow: 0 0 0 6px rgba(46,184,106,.1); } }
.hero__title { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; color: white; letter-spacing: -.03em; line-height: 1.1; margin-bottom: .5rem; }
.hero__sub   { font-size: .875rem; color: rgba(255,255,255,.6); }
.hero__orb   { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .2; pointer-events: none; }
.hero__orb--1 { width: 320px; height: 320px; background: var(--color-mint); top: -80px; right: -60px; animation: orbFloat 8s ease-in-out infinite; }
.hero__orb--2 { width: 200px; height: 200px; background: #0a3d22; bottom: -60px; left: 20%; animation: orbFloat 11s ease-in-out infinite reverse; }
@keyframes orbFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-15px); } }

/* BODY */
.body { padding: 2rem; max-width: 1100px; margin: 0 auto; }
.mt   { margin-top: 2rem; }
.section-label-wrap { margin-bottom: 1.25rem; }
.section-label { display: inline-flex; align-items: center; gap: .5rem; font-size: .7rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-mint); margin-bottom: .5rem; }
.section-label::before { content: ''; display: block; width: 18px; height: 2px; background: var(--color-mint); border-radius: 2px; }
.section-heading { font-size: 1.25rem; font-weight: 800; color: var(--color-ink); letter-spacing: -.02em; }

/* CARDS */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
.service-card { background: var(--color-white); border-radius: 16px; border: 1px solid rgba(168,200,180,.2); box-shadow: var(--shadow-sm); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; cursor: pointer; position: relative; overflow: hidden; transition: box-shadow .28s var(--ease-out), transform .28s var(--ease-out); }
.service-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
.service-card:hover .service-card__icon { background: var(--color-mint); color: white; }
.service-card--primary { background: linear-gradient(135deg, var(--color-forest), var(--color-emerald)); border-color: transparent; }
.service-card--primary .service-card__title { color: white; }
.service-card--primary .service-card__desc  { color: rgba(255,255,255,.65); }
.service-card--primary .service-card__icon  { background: rgba(255,255,255,.15); color: white; border-color: rgba(255,255,255,.2); }
.service-card--primary:hover .service-card__icon { background: rgba(255,255,255,.25); }
.service-card--primary .service-card__footer { border-top-color: rgba(255,255,255,.1); }
.service-card__glow { position: absolute; width: 200px; height: 200px; background: var(--color-mint); border-radius: 50%; filter: blur(60px); opacity: .15; top: -60px; right: -60px; pointer-events: none; }
.service-card__icon { width: 52px; height: 52px; background: var(--color-foam); border: 1px solid rgba(168,200,180,.3); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--color-emerald); flex-shrink: 0; transition: background .25s, color .25s; }
.service-card__body { flex: 1; }
.service-card__title { font-size: 1rem; font-weight: 800; color: var(--color-ink); letter-spacing: -.01em; margin-bottom: .4rem; }
.service-card__desc  { font-size: .8125rem; color: var(--color-stone); line-height: 1.6; }
.service-card__footer { padding-top: .75rem; border-top: 1px solid rgba(168,200,180,.15); }
.service-card__btn { display: inline-flex; align-items: center; gap: .4rem; font-family: var(--font); font-size: .8125rem; font-weight: 700; padding: .55rem 1.1rem; border-radius: 8px; border: none; cursor: pointer; background: var(--color-mint); color: white; box-shadow: var(--shadow-green); transition: all .2s var(--ease-out); }
.service-card__btn:hover { background: var(--color-emerald); transform: translateY(-1px); }
.service-card__btn--ghost { background: var(--color-foam); color: var(--color-emerald); box-shadow: none; border: 1.5px solid rgba(46,184,106,.2); }
.service-card__btn--ghost:hover { background: rgba(46,184,106,.12); border-color: var(--color-mint); }

/* CHARTS */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.chart-card { background: var(--color-white); border-radius: 16px; border: 1px solid rgba(168,200,180,.2); box-shadow: var(--shadow-sm); padding: 1.5rem; height: 320px; display: flex; align-items: center; justify-content: center; overflow: hidden; }

@media (max-width: 768px) {
  .hero { padding: 2rem 1.25rem 2.5rem; }
  .body { padding: 1.25rem; }
  .charts-grid { grid-template-columns: 1fr; }
  .cards-grid  { grid-template-columns: 1fr; }
}
</style>