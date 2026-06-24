<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ChartProgressKeseluruhan from './Chart/ChartPie-ProgressKeseluruhan.vue'
import ChartProgressBulanIni from './Chart/ChartPie-ProgressBulanIni.vue'
import ChartPermintaanLayanan from './Chart/ChartPie-PermintaanLayanan.vue'
import ChartBarPermintaanBerdasarkanStatus from './Chart/ChartBar-PermintaanBerdasarkanStatus.vue'
import ChartBarPermintaanBerdasarkanPengelolaTeknis from './Chart/ChartBar-PermintaanBerdasarkanPengelolaTeknis.vue'
import ChartBarPenilaianLayananServiceDesk from './Chart/ChartBar-PenilaianLayananServiceDesk-.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const jumlahPermintaanBaru     = ref('-')
const jumlahPenggunaTerdaftar  = ref('-')
const jumlahOrganisasiTerdaftar = ref('-')
const isLoading     = ref(true)
const nama_user     = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')
const nama_jabatan  = ref('')
const nama_organisasi = ref('')

// Chat
const chatSessions    = ref([])
const selectedSession = ref(null)
const messages        = ref([])
const isLoadingChat   = ref(false)
const replyText       = ref('')
const chatError       = ref('')

// Greeting
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
  await fetchDashboardData(token)
  await loadChatSessions()
})

const fetchDashboardData = async (token) => {
  try {
    isLoading.value = true
    const [profileRes, userCountRes, layananRes, organisasiRes] = await Promise.all([
      axios.get('/api/user/profile',     { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/userCount',        { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/allPelayanan',     { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/organisasiCount',  { headers: { Authorization: 'Bearer ' + token } }),
    ])
    const profile = profileRes.data
    nama_jabatan.value   = profile.user_jabatan?.Nama_Jabatan || '-'
    nama_organisasi.value = profile.user_organisasi?.Nama_OPD || '-'
    jumlahPenggunaTerdaftar.value  = userCountRes.data
    jumlahPermintaanBaru.value     = layananRes.data
    jumlahOrganisasiTerdaftar.value = organisasiRes.data
    localStorage.setItem('nip_user',        profile.NIP)
    localStorage.setItem('nama_jabatan',    profile.user_jabatan?.Nama_Jabatan || '-')
    localStorage.setItem('nama_organisasi', profile.user_organisasi?.Nama_OPD || '-')
  } catch (e) {
    console.error('Gagal memuat dashboard:', e)
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}

const getAdminToken = () => {
  const token = localStorage.getItem('Token')
  if (!token) { router.push('/login'); throw new Error('Token tidak ditemukan') }
  return token
}

const loadChatSessions = async () => {
  try {
    isLoadingChat.value = true
    chatError.value = ''
    const res = await axios.get('/api/admin/chat/list', {
      headers: { Authorization: 'Bearer ' + getAdminToken() }
    })
    chatSessions.value = res.data.data || []
  } catch (e) {
    chatError.value = 'Gagal memuat daftar chat'
  } finally {
    isLoadingChat.value = false
  }
}

const pilihSession = async (session) => {
  try {
    isLoadingChat.value = true
    chatError.value = ''
    selectedSession.value = session
    messages.value = []
    const res = await axios.get(`/api/admin/chat/detail/${session.id}`, {
      headers: { Authorization: 'Bearer ' + getAdminToken() }
    })
    selectedSession.value = res.data.data
    messages.value = res.data.data.messages || []
  } catch (e) {
    chatError.value = 'Gagal memuat percakapan'
  } finally {
    isLoadingChat.value = false
  }
}

const kirimBalasan = async () => {
  if (!replyText.value.trim() || !selectedSession.value) return
  try {
    const res = await axios.post(
      `/api/admin/chat/reply/${selectedSession.value.id}`,
      { message: replyText.value },
      { headers: { Authorization: 'Bearer ' + getAdminToken() } }
    )
    messages.value.push(res.data.data)
    replyText.value = ''
  } catch (e) {
    chatError.value = 'Gagal mengirim balasan'
  }
}
</script>

<template>
  <div class="beranda-pengelola">

    <!-- Hero -->
    <div class="hero">
      <div class="hero__content">
        <div class="hero__badge">
          <span class="badge-dot"></span>
          {{ greeting }}
        </div>
        <h1 class="hero__title">{{ nama_user || 'Pengelola' }}</h1>
        <p class="hero__sub">{{ nama_jabatan }} &nbsp;·&nbsp; {{ nama_organisasi }}</p>
      </div>
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
    </div>

    <div class="body">

      <!-- Stats Cards -->
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
        <div class="chart-card">
          <ChartProgressKeseluruhan />
        </div>
        <div class="chart-card">
          <ChartProgressBulanIni />
        </div>
      </div>

      <!-- Charts Bar -->
      <div class="section-label-wrap" style="margin-top: 2rem;">
        <span class="section-label">Analitik</span>
        <h2 class="section-heading">Detail Permintaan</h2>
      </div>
      <div class="charts-bar-grid">
        <div class="chart-card chart-card--full">
          <ChartPermintaanLayanan />
        </div>
        <div class="chart-card chart-card--full">
          <ChartBarPermintaanBerdasarkanStatus />
        </div>
        <div class="chart-card chart-card--full">
          <ChartBarPermintaanBerdasarkanPengelolaTeknis />
        </div>
        <div class="chart-card chart-card--full">
          <ChartBarPenilaianLayananServiceDesk />
        </div>
      </div>

      <!-- Chat Admin -->
      <div class="section-label-wrap" style="margin-top: 2rem;">
        <span class="section-label">Komunikasi</span>
        <h2 class="section-heading">Chat Pengguna</h2>
      </div>
      <div class="chat-card">
        <div class="chat-layout">

          <!-- Session List -->
          <div class="chat-sessions">
            <div class="chat-sessions__header">
              <span>Sesi Aktif</span>
              <span class="chat-sessions__count">{{ chatSessions.length }}</span>
            </div>
            <div v-if="isLoadingChat" class="chat-loading">
              <div class="spinner"></div>
              Memuat...
            </div>
            <p v-else-if="chatError" class="chat-error">{{ chatError }}</p>
            <p v-else-if="chatSessions.length === 0" class="chat-empty">Belum ada sesi chat.</p>
            <ul v-else class="session-list">
              <li
                v-for="session in chatSessions"
                :key="session.id"
                class="session-item"
                :class="{ 'session-item--active': selectedSession?.id === session.id }"
                @click="pilihSession(session)"
              >
                <div class="session-item__top">
                  <span class="session-item__id">Sesi #{{ session.id }}</span>
                  <span v-if="session.unread_count > 0" class="session-item__badge">{{ session.unread_count }}</span>
                </div>
                <p class="session-item__ip">{{ session.ip_address }}</p>
                <p class="session-item__time">{{ session.last_active_at }}</p>
              </li>
            </ul>
          </div>

          <!-- Conversation -->
          <div class="chat-conversation">
            <template v-if="selectedSession">
              <div class="chat-conversation__header">
                <div class="chat-conversation__avatar">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <p class="chat-conversation__title">Sesi #{{ selectedSession.id }}</p>
                  <p class="chat-conversation__sub">{{ selectedSession.ip_address }}</p>
                </div>
              </div>
              <div class="messages">
                <div
                  v-for="msg in messages"
                  :key="msg.id"
                  class="msg"
                  :class="msg.sender_type === 'guest' ? 'msg--guest' : 'msg--admin'"
                >
                  <div class="msg__bubble">
                    <div class="msg__meta">
                      <span class="msg__sender">{{ msg.sender_type === 'guest' ? 'User' : 'Admin' }}</span>
                      <span class="msg__time">{{ msg.created_at }}</span>
                    </div>
                    <p class="msg__text">{{ msg.message }}</p>
                  </div>
                </div>
              </div>
              <div class="reply-box">
                <textarea
                  v-model="replyText"
                  placeholder="Tulis balasan..."
                  class="reply-input"
                  rows="2"
                ></textarea>
                <button class="reply-btn" :disabled="!replyText.trim()" @click="kirimBalasan">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7l12-5-5 12-2-4-5-3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                  </svg>
                  Kirim
                </button>
              </div>
            </template>
            <div v-else class="chat-conversation__empty">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="5" y="7" width="30" height="22" rx="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M13 29l-5 5v-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 16h14M13 21h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <p>Pilih sesi chat untuk melihat percakapan</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.beranda-pengelola {
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
  --shadow-sm:      0 1px 3px rgba(13,26,18,.06);
  --shadow-md:      0 4px 16px rgba(13,26,18,.08);

  font-family: var(--font);
  min-height: 100vh;
  background: var(--color-mist);
}

/* ── HERO ── */
.hero {
  position: relative;
  background: var(--color-forest);
  border-radius: 24px;
  margin: 0 0 1.5rem;
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
.hero__sub { font-size: .875rem; color:rgba(255,255,255,.74); }
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
.stat-card__icon--green  { background: var(--color-foam); color: var(--color-emerald); }
.stat-card__icon--blue   { background: #eff6ff; color: #2563eb; }
.stat-card__icon--amber  { background: #fffbeb; color: #d97706; }

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
  grid-template-columns: 1fr 1fr;
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

/* ── CHAT ── */
.chat-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.chat-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 420px;
}

/* Sessions */
.chat-sessions {
  border-right: 1px solid var(--color-foam);
  overflow-y: auto;
}
.chat-sessions__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  font-size: .8125rem;
  font-weight: 700;
  color: var(--color-charcoal);
  border-bottom: 1px solid var(--color-foam);
}
.chat-sessions__count {
  background: var(--color-foam);
  color: var(--color-emerald);
  font-size: .7rem;
  font-weight: 700;
  padding: .15rem .5rem;
  border-radius: 99px;
}
.chat-loading {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: 1rem 1.25rem;
  font-size: .8125rem;
  color: var(--color-stone);
}
.spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--color-foam);
  border-top-color: var(--color-mint);
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.chat-empty, .chat-error {
  padding: 1.25rem;
  font-size: .8125rem;
  color: var(--color-stone);
}
.chat-error { color: #ef4444; }

.session-list { list-style: none; padding: .5rem; margin: 0; }
.session-item {
  padding: .875rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background .15s;
  border: 1px solid transparent;
}
.session-item:hover { background: var(--color-mist); }
.session-item--active { background: var(--color-foam); border-color: rgba(46,184,106,.2); }
.session-item__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .25rem; }
.session-item__id { font-size: .8125rem; font-weight: 700; color: var(--color-ink); }
.session-item__badge {
  background: var(--color-mint);
  color: white;
  font-size: .65rem;
  font-weight: 700;
  padding: .1rem .4rem;
  border-radius: 99px;
}
.session-item__ip  { font-size: .75rem; color: var(--color-stone); margin-bottom: .125rem; }
.session-item__time { font-size: .7rem; color: var(--color-silver); }

/* Conversation */
.chat-conversation {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-conversation__header {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-foam);
  flex-shrink: 0;
}
.chat-conversation__avatar {
  width: 36px; height: 36px;
  background: var(--color-foam);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-emerald);
  flex-shrink: 0;
}
.chat-conversation__title { font-size: .875rem; font-weight: 700; color: var(--color-ink); line-height: 1; margin-bottom: 2px; }
.chat-conversation__sub   { font-size: .7rem; color: var(--color-stone); }

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
  background: var(--color-mist);
}
.msg { display: flex; }
.msg--guest { justify-content: flex-start; }
.msg--admin { justify-content: flex-end; }
.msg__bubble {
  max-width: 72%;
  padding: .625rem .875rem;
  border-radius: 12px;
  font-size: .8125rem;
}
.msg--guest .msg__bubble { background: var(--color-white); border: 1px solid rgba(168,200,180,.2); color: var(--color-ink); }
.msg--admin .msg__bubble { background: linear-gradient(135deg, var(--color-mint), var(--color-emerald)); color: white; }
.msg__meta { display: flex; justify-content: space-between; gap: .75rem; margin-bottom: .25rem; }
.msg__sender { font-size: .7rem; font-weight: 700; opacity: .8; }
.msg__time   { font-size: .65rem; opacity: .6; }
.msg__text   { margin: 0; line-height: 1.5; word-break: break-word; }

.reply-box {
  display: flex;
  gap: .75rem;
  padding: 1rem;
  border-top: 1px solid var(--color-foam);
  flex-shrink: 0;
  align-items: flex-end;
}
.reply-input {
  flex: 1;
  font-family: var(--font);
  font-size: .8125rem;
  color: var(--color-ink);
  background: var(--color-mist);
  border: 1.5px solid transparent;
  border-radius: 10px;
  padding: .625rem .875rem;
  resize: none;
  outline: none;
  transition: border-color .15s;
}
.reply-input:focus { border-color: var(--color-mint); background: var(--color-white); }
.reply-btn {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .625rem 1.125rem;
  background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  color: white;
  border: none;
  border-radius: 10px;
  font-family: var(--font);
  font-size: .8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s, transform .15s;
  white-space: nowrap;
}
.reply-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.reply-btn:disabled { opacity: .4; cursor: not-allowed; }

.chat-conversation__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  color: var(--color-silver);
  font-size: .875rem;
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .charts-pie-grid { grid-template-columns: 1fr; }
  .chat-layout { grid-template-columns: 240px 1fr; }
}
@media (max-width: 768px) {
  .hero { padding: 2rem 1.25rem 2.5rem; }
  .body { padding: 1.25rem; }
  .stats-grid { grid-template-columns: 1fr; }
  .chat-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .chat-sessions { border-right: none; border-bottom: 1px solid var(--color-foam); max-height: 200px; }
}
</style>