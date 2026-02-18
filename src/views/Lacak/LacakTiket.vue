<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const ticketNumber = ref('')
const isLoading = ref(false)
const isFound = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// Data pelayanan
const pelayananData = ref(null)
const steps = ref([])
const stepsStatus = ref([])

const formatTanggal = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const searchTicket = async () => {
  if (!ticketNumber.value.trim()) {
    showError.value = true
    errorMessage.value = 'Mohon masukkan nomor tiket'
    return
  }

  isLoading.value = true
  showError.value = false
  isFound.value = false
  pelayananData.value = null

  try {
    // Ambil data pelayanan
    const response = await axios.get(`/api/lacak/${ticketNumber.value}`)

    if (response.data) {
      pelayananData.value = response.data

      // Ambil progress data
      try {
        const progressResponse = await axios.get(`/api/lacak/${ticketNumber.value}/progress`)
        steps.value = progressResponse.data.slice(0, 5).map(item =>
          item.progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui'
        )
        stepsStatus.value = progressResponse.data.slice(0, 5).map(item => item.Is_Done)
      } catch (progressError) {
        console.error('Error fetching progress:', progressError)
        steps.value = []
        stepsStatus.value = []
      }

      isFound.value = true
    } else {
      showError.value = true
      errorMessage.value = 'Tiket tidak ditemukan'
    }
  } catch (error) {
    console.error('Error searching ticket:', error)
    showError.value = true
    errorMessage.value = 'Tiket tidak ditemukan. Mohon periksa kembali nomor tiket Anda.'
    pelayananData.value = null
  } finally {
    isLoading.value = false
  }
}

const resetSearch = () => {
  ticketNumber.value = ''
  isFound.value = false
  showError.value = false
  pelayananData.value = null
  steps.value = []
  stepsStatus.value = []
}
</script>

<template>
  <div class="lacak-container">
    <!-- Tombol Login -->
    <div class="login-top-bar">
      <button @click="router.push('/login')" class="top-login-btn">
        Login
      </button>
    </div>
    <!-- Header -->
    <div class="lacak-header">
      <h1 class="lacak-title">Lacak Tiket Pelayanan</h1>
      <p class="lacak-subtitle">Masukkan nomor tiket untuk melacak status pelayanan Anda</p>
    </div>

    <!-- Search Box -->
    <div class="search-box" v-if="!isFound">
      <div class="search-input-wrapper">
        <input
          type="text"
          v-model="ticketNumber"
          @keyup.enter="searchTicket"
          placeholder="Contoh: P-00001"
          class="search-input"
          :disabled="isLoading"
        />
        <button
          @click="searchTicket"
          class="search-button"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">🔍</span>
          <span v-else>Memuat...</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="showError" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Mencari tiket...</p>
    </div>

    <!-- Result -->
    <div v-if="isFound && pelayananData" class="result-container">
      <!-- Back Button -->
      <button @click="resetSearch" class="back-button">
        ← Cari Tiket Lain
      </button>

      <!-- Ticket Info Card -->
      <div class="ticket-info-card">
        <div class="ticket-header">
          <h2 class="ticket-title">Tiket #{{ pelayananData.ID_Pelayanan }}</h2>
          <span
            :class="['status-badge', pelayananData.status_pelayanan?.Nama_Status?.toLowerCase()]"
          >
            {{ pelayananData.status_pelayanan?.Nama_Status || 'Unknown' }}
          </span>
        </div>

        <div class="ticket-details">
          <div class="detail-row">
            <span class="detail-label">Perihal:</span>
            <span class="detail-value">{{ pelayananData.Perihal }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Layanan:</span>
            <span class="detail-value">{{ pelayananData.sub__jenis__pelayanan?.Nama_Sub_Jenis_Pelayanan }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tipe Layanan:</span>
            <span class="detail-value">{{ pelayananData.jenis__pelayanan?.Nama_Jenis_Pelayanan }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Organisasi:</span>
            <span class="detail-value">{{ pelayananData.user?.user_organisasi?.Nama_OPD }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tanggal Laporan:</span>
            <span class="detail-value">{{ formatTanggal(pelayananData.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Pelaksana Teknis:</span>
            <span class="detail-value">
              {{ pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum' }} {{ pelayananData.teknis_pelayanan?.Nama_Belakang || 'Tersedia' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Progress Tracking -->
      <div class="progress-card">
        <h3 class="progress-title">Progress Pelayanan</h3>
        <div class="step-wrapper">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step-row"
          >
            <div
              class="circle"
              :class="stepsStatus[index] === 1 ? 'circle-blue' : 'circle-inactive'"
            >
              {{ index + 1 }}
            </div>
            <div
              class="step-label"
              :class="stepsStatus[index] === 1 ? 'label-blue' : ''"
            >
              {{ step }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="lacak-footer">
      <p>Service Desk 3.0 Diskominfo Jawa Barat</p>
    </div>
  </div>
</template>

<style scoped>
.lacak-container {
  min-height: 100vh;
  background-color: #FAF4FF;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Top Login Bar */
.login-top-bar {
  position: absolute;
  top: 1rem;
  right: 2rem;
  z-index: 100;
}

.top-login-btn {
  background-color: #099d49;
  color: white;
  border: none;
  border-radius: 100px;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.top-login-btn:hover {
  background-color: #52AE6E;
  transform: scale(1.02);
}

.lacak-header {
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
}

.lacak-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #099d49;
}

.lacak-subtitle {
  font-size: 1.1rem;
  color: #6B6B6B;
}

.search-box {
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex-grow: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background-color: #ffffff;
  color: #333;
}

.search-input:disabled {
  background-color: #f5f5f5;
}

.search-input:focus {
  background-color: #ffffff;
  color: #333;
}

.search-button {
  padding: 1rem 2rem;
  background-color: #099d49;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.search-button:hover:not(:disabled) {
  transform: scale(1.02);
  background-color: #52AE6E;
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #006920;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-container {
  width: 100%;
  max-width: 900px;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #006920;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
}

.back-button:hover {
  transform: scale(1.02);
  background-color: #52AE6E;
}

.ticket-info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.ticket-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.status-badge {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.baru {
  background-color: #e8f5e9;
  color: #006920;
}

.status-badge.disetujui {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge.proses {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.selesai {
  background-color: #e8f5e9;
  color: #006920;
}

.status-badge.tutup {
  background-color: #f5f5f5;
  color: #616161;
}

.status-badge.ditolak {
  background-color: #ffebee;
  color: #c62828;
}

.ticket-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
}

.detail-label {
  width: 200px;
  font-weight: 600;
  color: #6B6B6B;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  flex-grow: 1;
}

.progress-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
}

.progress-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #006920;
  margin-bottom: 2rem;
  text-align: center;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.circle-blue {
  background-color: #006920;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 105, 32, 0.4);
}

.circle-inactive {
  background-color: #f0f0f0;
  color: #999;
  border: 3px solid #e0e0e0;
}

.step-label {
  font-size: 1.1rem;
  color: #666;
  flex-grow: 1;
  padding: 1rem;
  border-radius: 10px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.label-blue {
  color: #006920;
  font-weight: 600;
  background-color: #e8f5e9;
  border-left: 5px solid #006920;
}

.lacak-footer {
  margin-top: 3rem;
  color: #6B6B6B;
  text-align: center;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .lacak-title {
    font-size: 1.8rem;
  }

  .search-input-wrapper {
    flex-direction: column;
  }

  .ticket-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.3rem;
  }

  .detail-label {
    width: 100%;
  }
}
</style>
