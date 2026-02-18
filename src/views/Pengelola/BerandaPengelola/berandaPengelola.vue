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
import IconPermintaanBaru from '../../../../public/iconpermintaanbaru.svg'
import IconProfile from '../../../../public/profileicon.svg'
import IconLembagaOrganisasi from '../../../../public/iconlembagaorganisasi.svg'

const router = useRouter()
// ceritanya backend
const jumlahPermintaanBaru = ref('')
const jumlahPenggunaTerdaftar = ref('')
const jumlahOrganisasiTerdaftar = ref('')
const isLoading = ref(true)
const nip_user = ref('')
const nama_jabatan = ref('')
const nama_organisasi = ref('')
const nama_user = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')

// State untuk fitur chat admin
const chatSessions = ref([])
const selectedSession = ref(null)
const messages = ref([])
const isLoadingChat = ref(false)
const replyText = ref('')
const chatError = ref('')

onMounted(async () => {
  const token = localStorage.getItem('Token')
  if (!token) {
    router.push('/login')
    return
  }

  await fetchDashboardData(token)
  await loadChatSessions()
})

const fetchDashboardData = async (token) => {
  try {
    isLoading.value = true

    const [profileRes, userCountRes, layananRes, organisasiRes] = await Promise.all([
      axios.get('/api/user/profile', { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/userCount', { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/allPelayanan', { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/organisasiCount', { headers: { Authorization: 'Bearer ' + token } }),
    ])

    // Simpan data
    const profile = profileRes.data
    nip_user.value = profile.NIP
    nama_jabatan.value = profile.user_jabatan?.Nama_Jabatan || '-'
    nama_organisasi.value = profile.user_organisasi?.Nama_OPD || '-'

    jumlahPenggunaTerdaftar.value = userCountRes.data
    jumlahPermintaanBaru.value = layananRes.data
    jumlahOrganisasiTerdaftar.value = organisasiRes.data

    // Cache
    localStorage.setItem('nip_user', profile.NIP)
    localStorage.setItem('nama_jabatan', profile.user_jabatan?.Nama_Jabatan || '-')
    localStorage.setItem('nama_organisasi', profile.user_organisasi?.Nama_OPD || '-')

  } catch (error) {
    console.error('Gagal memuat dashboard:', error)
    router.push('/login') // Jika error karena token invalid
  } finally {
    isLoading.value = false
  }
}

// ================= Fitur Chat Admin =================
const getAdminToken = () => {
  const token = localStorage.getItem('Token')
  if (!token) {
    router.push('/login')
    throw new Error('Token admin tidak ditemukan')
  }
  return token
}

const loadChatSessions = async () => {
  try {
    isLoadingChat.value = true
    chatError.value = ''
    const token = getAdminToken()

    const res = await axios.get('/api/admin/chat/list', {
      headers: { Authorization: 'Bearer ' + token },
    })

    chatSessions.value = res.data.data || []
  } catch (error) {
    console.error('Gagal memuat daftar chat:', error)
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

    const token = getAdminToken()
    const res = await axios.get(`/api/admin/chat/detail/${session.id}`, {
      headers: { Authorization: 'Bearer ' + token },
    })

    const data = res.data.data
    selectedSession.value = data
    messages.value = data.messages || []
  } catch (error) {
    console.error('Gagal memuat percakapan:', error)
    chatError.value = 'Gagal memuat percakapan'
  } finally {
    isLoadingChat.value = false
  }
}

const kirimBalasan = async () => {
  if (!replyText.value.trim() || !selectedSession.value) return

  try {
    const token = getAdminToken()
    const res = await axios.post(
      `/api/admin/chat/reply/${selectedSession.value.id}`,
      { message: replyText.value },
      { headers: { Authorization: 'Bearer ' + token } },
    )

    const newMsg = res.data.data
    messages.value.push(newMsg)
    replyText.value = ''
  } catch (error) {
    console.error('Gagal mengirim balasan:', error)
    chatError.value = 'Gagal mengirim balasan'
  }
}
</script>

<template>
    <h1 class="dashboard-title">Selamat datang, {{ nama_user }}</h1>

<!-- Ringkasan: 3 kotak atas -->
<div class="box-row">
  <div class="summary-box">
    <p class="label">Permintaan Baru</p>
    <div class="summary-content">
      <img :src="IconPermintaanBaru" alt="📄" class="icon"/>
      <div class="loading-data" v-if="isLoading">Memuat data...</div>
      <p class="value">{{ jumlahPermintaanBaru }}</p>
    </div>
  </div>
  <div class="summary-box">
    <p class="label">Pengguna Terdaftar</p>
    <div class="summary-content">
      <img :src="IconProfile" alt="👤" class="icon"/>
      <div class="loading-data" v-if="isLoading">Memuat data...</div>
      <p class="value">{{ jumlahPenggunaTerdaftar }}</p>
    </div>
  </div>
  <div class="summary-box">
    <p class="label">Organisasi Terdaftar</p>
    <div class="summary-content">
      <img :src="IconLembagaOrganisasi" alt="👥" class="icon"/>
      <div class="loading-data" v-if="isLoading">Memuat data...</div>
      <p class="value">{{ jumlahOrganisasiTerdaftar }}</p>
    </div>
  </div>
</div>

<!-- Chart Pie: 2 kotak -->
<div class="box-row">
  <div class="chart-box">
    <div class="chart-container">
      <ChartProgressKeseluruhan/>
    </div>
  </div>
  <div class="chart-box">
    <div class="chart-container">
      <ChartProgressBulanIni/>
    </div>
  </div>
</div>

<!-- Chart bawahnya: 4 baris -->
<div class="bar-chart-section">
  <div class="chart-full">
    <ChartPermintaanLayanan/>
  </div>
  <div class="chart-full">
    <ChartBarPermintaanBerdasarkanStatus/>
  </div>
  <div class="chart-full">
    <ChartBarPermintaanBerdasarkanPengelolaTeknis/>
  </div>
  <div class="chart-full">
    <ChartBarPenilaianLayananServiceDesk/>
  </div>
</div>

<!-- Daftar Chat Pengguna -->
<div class="chat-admin-section">
  <h2 class="section-title">Chat Pengguna</h2>

  <div class="chat-layout">
    <div class="chat-session-list">
      <div v-if="isLoadingChat" class="loading-data">Memuat daftar chat...</div>
      <div v-else>
        <p v-if="chatError" class="chat-error">{{ chatError }}</p>
        <p v-if="!chatError && chatSessions.length === 0" class="no-data">
          Belum ada sesi chat.
        </p>
        <ul v-else class="session-items">
          <li
            v-for="session in chatSessions"
            :key="session.id"
            class="session-item"
            :class="{ active: selectedSession && selectedSession.id === session.id }"
            @click="pilihSession(session)"
          >
            <div class="session-id">ID: {{ session.id }}</div>
            <div class="session-meta">
              <span>IP: {{ session.ip_address }}</span>
              <span>Belum dibaca: {{ session.unread_count }}</span>
            </div>
            <div class="session-time">
              Terakhir aktif: {{ session.last_active_at }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="chat-conversation" v-if="selectedSession">
      <h3 class="conversation-title">
        Percakapan dengan sesi {{ selectedSession.id }}
      </h3>
      <div class="messages">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-row"
          :class="msg.sender_type === 'guest' ? 'guest' : 'admin'"
        >
          <div class="msg-bubble">
            <div class="msg-header">
              <span class="msg-sender">
                {{ msg.sender_type === 'guest' ? 'User' : 'Admin' }}
              </span>
              <span class="msg-time">
                {{ msg.created_at }}
              </span>
            </div>
            <p class="msg-text">{{ msg.message }}</p>
          </div>
        </div>
      </div>

      <div class="reply-box">
        <textarea
          v-model="replyText"
          placeholder="Tulis balasan untuk user..."
          class="reply-input"
          rows="3"
        ></textarea>
        <button
          class="reply-button"
          :disabled="!replyText.trim()"
          @click="kirimBalasan"
        >
          Kirim Balasan
        </button>
      </div>
    </div>

    <div class="chat-conversation empty" v-else>
      <p>Pilih salah satu sesi chat di sebelah kiri untuk melihat percakapan.</p>
    </div>
  </div>
</div>
</template>

<style scoped>
.dashboard {
  padding: 30px;
  background-color: #f5f2fb;
  min-height: 100vh;
}

.dashboard-title {
  text-align: left;
  color: black;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
}

.box-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.summary-box {
  text-align: left;
  flex: 1;
  min-width: 250px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  color: black;
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 40px;
  width: 45px;
}

.value {
  color: black;
  font-size: 35px;
  font-weight: bold;
  margin: 0;
}

.chart-box {
  flex: 1;
  min-width: 250px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding-left: 16px;
  padding-right: 16px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-chart-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.chart-full {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  box-sizing: border-box;
  height: 300px; /* Match the chart height for consistency */
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-title {
  color: black;
  font-weight: 600;
  margin-bottom: 12px;
}

.loading-data {
  text-align: center;
  font-size: 1.1rem;
}

.no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%; /* Ensure it fills the container */
}

/* ====== Chat admin section ====== */
.chat-admin-section {
  margin-top: 32px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.chat-layout {
  display: flex;
  gap: 16px;
  min-height: 260px;
}

.chat-session-list {
  width: 35%;
  border-right: 1px solid #e5e7eb;
  padding-right: 12px;
  overflow-y: auto;
  max-height: 320px;
}

.session-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.session-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 8px;
  background-color: #f9fafb;
  transition: background-color 0.2s, border-color 0.2s;
}

.session-item:hover {
  background-color: #eef2ff;
  border-color: #4f46e5;
}

.session-item.active {
  background-color: #e0f2fe;
  border-color: #0ea5e9;
}

.session-id {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.session-time {
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
}

.chat-conversation {
  flex: 1;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
}

.chat-conversation.empty {
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.conversation-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.messages {
  flex: 1;
  border-radius: 8px;
  background-color: #f9fafb;
  padding: 8px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.msg-row {
  display: flex;
  margin-bottom: 6px;
}

.msg-row.guest {
  justify-content: flex-start;
}

.msg-row.admin {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: 80%;
  background-color: #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
}

.msg-row.admin .msg-bubble {
  background-color: #10b981;
  color: #ffffff;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 2px;
}

.msg-sender {
  font-weight: 600;
}

.msg-time {
  opacity: 0.8;
}

.msg-text {
  margin: 0;
  word-wrap: break-word;
}

.reply-box {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.reply-input {
  flex: 1;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 8px 10px;
  font-size: 13px;
  resize: vertical;
}

.reply-button {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background-color: #10b981;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.reply-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.chat-error {
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 8px;
}
</style>