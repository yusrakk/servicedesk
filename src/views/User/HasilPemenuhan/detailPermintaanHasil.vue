<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// Auto-refresh interval
let refreshInterval = null
const isRefreshing = ref(false)

// Manajemen state
const userId = ref(localStorage.getItem('user_id'));
const pelayananId = ref(route.query.layanan || '-')
const steps = ref([])
const stepsStatus = ref([])
const status = ref('')
const perihal = ref('')
const tanggal = ref('')
const nama_depanPengaju = ref('')
const no_telp = ref('')
const nama_belakangPengaju = ref('')
const nama_depanTeknis = ref('') 
const nama_belakangTeknis = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan = ref('')
const deskripsi = ref('')
const organisasi = ref('')

const surat_dinas = ref('')
const lampiran = ref('')
const SuratDinas_Path = ref(null)
const Lampiran_Path = ref(null)
const HasilBA_Path = ref(null)
const HasilSLA_Path = ref(null)
const HasilPemenuhan_Path = ref(null)
const src_HasilPemenuhan = ref(route.query.hasil_pemenuhan || '-')
const src_HasilBA = ref(route.query.hasil_ba || '-')
const src_HasilSLA = ref(route.query.hasil_sla || '-')
const messages = ref([])

const activeTab = ref('informasi')

// Loading
const isLoading = ref(true)
const isDataLoaded = ref(false)

// Cache untuk mencegah API calls berulang
const dataCache = ref(null)

// Computed properties untuk optimasi
const pelayananData = computed(() => ({
  deskripsi: deskripsi.value,
  organisasi: organisasi.value,
  surat_dinas: surat_dinas.value,
  lampiran: lampiran.value,
  src_HasilPemenuhan: src_HasilPemenuhan.value,
  src_HasilBA: src_HasilBA.value,
  src_HasilSLA: src_HasilSLA.value,
  sub_jenis_pelayanan: sub_jenis_pelayanan.value,
  jenis_pelayanan: jenis_pelayanan.value,
  nama_depanPengaju: nama_depanPengaju.value,
  nama_belakangPengaju: nama_belakangPengaju.value,
  no_telp: no_telp.value,
  nama_depanTeknis: nama_depanTeknis.value,
  nama_belakangTeknis: nama_belakangTeknis.value,
  perihal: perihal.value,
  tanggal: tanggal.value,
  steps: steps.value,
  stepsStatus: stepsStatus.value,
  status: status.value
}))

// Fungsi untuk fetch data dengan caching
const fetchPelayananData = async () => {
  if (dataCache.value && dataCache.value.id === pelayananId.value) {
    // Gunakan data dari cache
    const cached = dataCache.value
    deskripsi.value = cached.deskripsi
    organisasi.value = cached.organisasi
    surat_dinas.value = cached.surat_dinas
    lampiran.value = cached.lampiran
    src_HasilPemenuhan.value = cached.src_HasilPemenuhan
    src_HasilBA.value = cached.src_HasilBA
    src_HasilSLA.value = cached.src_HasilSLA
    sub_jenis_pelayanan.value = cached.sub_jenis_pelayanan
    jenis_pelayanan.value = cached.jenis_pelayanan
    nama_depanPengaju.value = cached.nama_depanPengaju
    nama_belakangPengaju.value = cached.nama_belakangPengaju
    no_telp.value = cached.no_telp
    nama_depanTeknis.value = cached.nama_depanTeknis
    nama_belakangTeknis.value = cached.nama_belakangTeknis
    perihal.value = cached.perihal
    tanggal.value = cached.tanggal
    rating.value = cached.rating
    reviewText.value = cached.reviewText
    reviewSubmitted.value = cached.reviewSubmitted
    steps.value = cached.steps
    stepsStatus.value = cached.stepsStatus
    status.value = cached.status
    isDataLoaded.value = true
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const token = localStorage.getItem('Token')
    
    const [pelayananResponse, progressResponse] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`, {
        headers: { Authorization: 'Bearer ' + token }
      }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, {
        headers: { Authorization: 'Bearer ' + token }
      })
    ])

    // Set data
    const pelayananData = pelayananResponse.data
    deskripsi.value = pelayananData.Deskripsi
    organisasi.value = pelayananData.user.user_organisasi.Nama_OPD
    surat_dinas.value = pelayananData.Surat_Dinas_Path
    lampiran.value = pelayananData.Lampiran_Path
    src_HasilPemenuhan.value = pelayananData.Hasil_Pemenuhan_Path || '-'
    src_HasilBA.value = pelayananData.BA_Path || '-'
    src_HasilSLA.value = pelayananData.SLA_Path || '-'
    sub_jenis_pelayanan.value = pelayananData.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = pelayananData.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_depanPengaju.value = pelayananData.user.Nama_Depan
    nama_belakangPengaju.value = pelayananData.user.Nama_Belakang
    no_telp.value = pelayananData.No_Telp || '-'
    nama_depanTeknis.value = pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangTeknis.value = pelayananData.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value = pelayananData.Perihal
    tanggal.value = pelayananData.created_at
    status.value = pelayananData.ID_Status

    // Cek apakah user sudah memberikan ulasan
    if (pelayananData.Rating) {
      rating.value = pelayananData.Rating
      reviewText.value = pelayananData.Isi_Survey || ''
      reviewSubmitted.value = true
    } else {
      rating.value = 0
      reviewText.value = ''
      reviewSubmitted.value = false
    }

    messages.value = pelayananData.pelayanan_pesan.map(pesan => ({
      id_user: pesan.ID_User,
      text: pesan.Pesan,
      sender: `${pesan.pesan_user.Nama_Depan} ${pesan.pesan_user.Nama_Belakang} - ${pesan.pesan_user.user_role.Nama_Role}`,
      time: new Date(pesan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dokumen_path:pesan.Dokumen_Path
    }))

    // Set progress data
    const progressData = progressResponse.data
    steps.value = progressData.slice(0, 5).map(item =>
      item.progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui'
    )
    stepsStatus.value = progressData.slice(0, 5).map(item => item.Is_Done)

    // Cache data
    dataCache.value = {
      id: pelayananId.value,
      deskripsi: deskripsi.value,
      organisasi: organisasi.value,
      surat_dinas: surat_dinas.value,
      lampiran: lampiran.value,
      src_HasilPemenuhan: src_HasilPemenuhan.value,
      src_HasilBA: src_HasilBA.value,
      src_HasilSLA: src_HasilSLA.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value,
      jenis_pelayanan: jenis_pelayanan.value,
      nama_depanPengaju: nama_depanPengaju.value,
      nama_belakangPengaju: nama_belakangPengaju.value,
      no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value,
      nama_belakangTeknis: nama_belakangTeknis.value,
      perihal: perihal.value,
      tanggal: tanggal.value,
      rating: rating.value,
      reviewText: reviewText.value,
      reviewSubmitted: reviewSubmitted.value,
      steps: steps.value,
      stepsStatus: stepsStatus.value,
      status: status.value
    }

    SuratDinas_Path.value = surat_dinas.value ? '/files' + surat_dinas.value : null
    Lampiran_Path.value = lampiran.value ? '/files' + lampiran.value : null
    HasilPemenuhan_Path.value = src_HasilPemenuhan.value && src_HasilPemenuhan.value !== '-' ? '/files' + src_HasilPemenuhan.value : null
    HasilBA_Path.value = src_HasilBA.value && src_HasilBA.value !== '-' ? '/files' + src_HasilBA.value : null
    HasilSLA_Path.value = src_HasilSLA.value && src_HasilSLA.value !== '-' ? '/files' + src_HasilSLA.value : null

    isDataLoaded.value = true
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const namaFileSuratDinas = computed(() => {
  const fileName = surat_dinas.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_Surat_Dinas.pdf`
})

const namaFileLampiran = computed(() => {
  const fileName = lampiran.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_Lampiran.pdf`
})

const namaFileHasilPemenuhan = computed(() => {
  if (!src_HasilPemenuhan.value || src_HasilPemenuhan.value === '-') return 'Tidak ada file'
  try {
    const fileName = src_HasilPemenuhan.value.split('/').pop()
    const parts = fileName.split('_')
    const tanggal = parts[0] || 'Unknown'
    const waktu = parts[1] || 'Unknown'
    return `${tanggal}_${waktu}_HasilPemenuhan.pdf`
  } catch (error) {
    return 'Hasil_Pemenuhan.pdf'
  }
})

const namaFileHasilBA = computed(() => {
  if (!src_HasilBA.value || src_HasilBA.value === '-') return 'Tidak ada file'
  try {
    const fileName = src_HasilBA.value.split('/').pop()
    const parts = fileName.split('_')
    const tanggal = parts[0] || 'Unknown'
    const waktu = parts[1] || 'Unknown'
    return `${tanggal}_${waktu}_HasilBA.pdf`
  } catch (error) {
    return 'Hasil_BA.pdf'
  }
})

const namaFileHasilSLA = computed(() => {
  if (!src_HasilSLA.value || src_HasilSLA.value === '-') return 'Tidak ada file'
  try {
    const fileName = src_HasilSLA.value.split('/').pop()
    const parts = fileName.split('_')
    const tanggal = parts[0] || 'Unknown'
    const waktu = parts[1] || 'Unknown'
    return `${tanggal}_${waktu}_HasilSLA.pdf`
  } catch (error) {
    return 'Hasil_SLA.pdf'
  }
})

const rating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const reviewSubmitted = ref(null)

const dokumen = ref(null)
const newMessage = ref('')
const fileInput = ref(null);

const isImage = (path) => {
  return /\.(jpg|jpeg|png)$/i.test(path);
};

const handleFileUpload = (event) => {
  dokumen.value = event.target.files[0];
};

const addMessage = async () => {
  if (!newMessage.value && !dokumen.value) return

  const formData = new FormData()
  formData.append('ID_User', userId.value)
  formData.append('Pesan', newMessage.value)
  if (dokumen.value) {
    formData.append('Dokumen_Path', dokumen.value)
  }

  const token = localStorage.getItem('Token')

  try {
    const res = await axios.post(`/api/pesan/${pelayananId.value}`, formData, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'multipart/form-data',
      },
    })

    messages.value.push({
      id_user: userId.value,
      text: newMessage.value,
      dokumen_path: res.data.dokumen, 
      sender: `${localStorage.getItem('nama_depan')} ${localStorage.getItem('nama_belakang')} - ${localStorage.getItem('nama_role')}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    newMessage.value = ''
    dokumen.value = null
  } catch (error) {
    console.error('Gagal mengirim pesan:', error)
  }
}

const setRating = (newRating) => {
  rating.value = newRating
}

const submitReview = async () => {
  if (rating.value === 0) {
    alert('Mohon berikan rating bintang terlebih dahulu.')
    return
  }
  try {
    const token = localStorage.getItem('Token')
    await axios.put(`/api/pelayanan/survey/${pelayananId.value}`, {
      Rating: rating.value,
      Isi_Survey: reviewText.value,
      ID_Status: 6
    }, { headers: { Authorization: 'Bearer ' + token } })
    reviewSubmitted.value = true
    status.value = 6
  } catch (error) {
    console.error('Gagal mengirim ulasan:', error)
    alert('Gagal mengirim ulasan. Silakan coba lagi.')
  }
}

// Fungsi print halaman
const printPage = () => {
  window.print()
}

// Fungsi refresh manual
const refreshData = async () => {
  // Clear cache untuk memaksa reload data terbaru
  dataCache.value = null
  isRefreshing.value = true
  await fetchPelayananData()
  isRefreshing.value = false
}

// Fungsi untuk menangani perubahan tab (tanpa router navigation)
const handleTabChange = (tab) => {
  activeTab.value = tab
  // Update URL tanpa navigation
  const newQuery = { ...route.query, tab }
  router.replace({ query: newQuery })
}

// Fungsi untuk mendapatkan class step berdasarkan status
const getStepClass = (index, currentStatus) => {
  // Jika status ditolak (3), semua step jadi merah
  if (currentStatus === 3) {
    return 'circle-red'
  }

  // Cek jika stepsStatus ada dan valid
  if (!stepsStatus.value || !Array.isArray(stepsStatus.value)) {
    return 'circle-inactive'
  }

  // Jika step sudah selesai (Is_Done = 1)
  if (stepsStatus.value[index] === 1) {
    return 'circle-blue'
  }

  // Step yang belum selesai
  return 'circle-inactive'
}

// Setup auto-refresh
const setupAutoRefresh = () => {
  // Auto-refresh setiap 30 detik jika status belum selesai (5 atau 6)
  refreshInterval = setInterval(async () => {
    const currentStatus = status.value
    // Hanya refresh jika status belum selesai/tutup (belum 5 atau 6)
    if (currentStatus !== 5 && currentStatus !== 6 && pelayananId.value && pelayananId.value !== '-') {
      await refreshData()
    } else {
      // Stop auto-refresh jika sudah selesai
      clearInterval(refreshInterval)
    }
  }, 30000) // 30 detik
}

// Watch untuk perubahan pelayananId
watch(() => pelayananId.value, (newId) => {
  if (newId && newId !== '-') {
    fetchPelayananData()
  }
})

onMounted(() => {
  if (pelayananId.value && pelayananId.value !== '-') {
    fetchPelayananData()
    setupAutoRefresh()
  }
})

onUnmounted(() => {
  // Clear interval ketika component di-unmount
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
<div class="container">
  <!-- Loading State -->
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Memuat data...</p>
  </div>

  <!-- Content -->
  <div v-else-if="isDataLoaded">
    <!-- Action Buttons -->
    <div class="action-buttons-container">
      <!-- Refresh Button (selalu muncul) -->
      <button @click="refreshData" class="refresh-button" :disabled="isRefreshing">
        <span v-if="isRefreshing">🔄 Memuat...</span>
        <span v-else>🔄 Refresh Data</span>
      </button>

      <!-- Auto-refresh indicator -->
      <span v-if="status !== 5 && status !== 6" class="auto-refresh-indicator">
        Auto-refresh aktif (30 detik)
      </span>

      <!-- Print Button (hanya untuk status Selesai/Tutup) -->
      <button v-if="status === 5 || status === 6" @click="printPage" class="print-button">
        🖨️ Cetak
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div
        :class="['tab', activeTab === 'informasi' ? 'active-tab-info' : 'inactive-tab']"
        @click="handleTabChange('informasi')"
      >
        Informasi
      </div>
      <div
        :class="['tab', activeTab === 'tracking' ? 'active-tab-track' : 'inactive-tab']"
        @click="handleTabChange('tracking')"
      >
        Lacak
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <!-- Tab Content -->
      <div v-if="activeTab === 'informasi'" class="tab-content">
        <div class="layout-container">
          <!-- Informasi Card -->
          <div class="info-card">
            <h3>Informasi Umum</h3>
            <div class="info-row"><strong>Layanan:</strong> <span>{{ sub_jenis_pelayanan }}</span></div>
            <div class="info-row"><strong>Tipe Layanan:</strong> <span>{{ jenis_pelayanan }}</span></div>
            <div class="info-row"><strong>No. Tiket:</strong> <span>{{ pelayananId }}</span></div>
            <div class="info-row"><strong>Pelapor:</strong> <span>{{ nama_depanPengaju + ' ' + nama_belakangPengaju }}</span></div>
            <div class="info-row"><strong>No Telepon:</strong> <span>{{ no_telp }}</span></div>
            <div class="info-row"><strong>Organisasi:</strong> <span>{{ organisasi }}</span></div>
            <div class="info-row"><strong>Tanggal Laporan:</strong> <span>{{ new Date(tanggal).toLocaleDateString('id-ID') }}</span></div>
            <div class="info-row"><strong>Perihal:</strong> <span>{{ perihal }}</span></div>

            <div class="info-row textarea-row">
              <strong>Deskripsi</strong>
              <textarea class="input" :value="deskripsi" placeholder="Deskripsi Pelayanan" rows="5" readonly></textarea>

              <strong class="link-surat">Surat Dinas</strong>
              <div v-if="surat_dinas">
                <a :href="SuratDinas_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                  {{ namaFileSuratDinas }}
                </a>
              </div>

              <strong class="link-surat">Lampiran</strong>
              <div v-if="lampiran">
                <a :href="Lampiran_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                  {{ namaFileLampiran }}
                </a>
              </div>
            </div>

            <!-- Review Section (SEKARANG di dalam info-card) -->
            <div class="review-section">
              <div v-if="!reviewSubmitted && (status === 5 || status === 6)">
                <h4 class="review-title">Beri Ulasan</h4>
                <div class="star-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ 'filled': star <= (hoverRating || rating) }"
                    @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                    @click="setRating(star)"
                  >
                    ★
                  </span>
                </div>
                <textarea v-model="reviewText" class="review-textarea" placeholder="Bagikan pengalaman Anda..." rows="4"></textarea>
                <button class="send-btn-chat" @click="submitReview">Kirim Ulasan</button>
              </div>
              <div v-else-if="reviewSubmitted" class="thank-you-message">
                <p>Terima kasih! Ulasan Anda telah kami terima.</p>
                <div class="star-rating" style="margin-top: 0.5rem;">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ 'filled': star <= rating }"
                  >
                    ★
                  </span>
                </div>
                <div v-if="reviewText" style="margin-top: 0.5rem; color: #333;">{{ reviewText }}</div>
              </div>
            </div>
          </div> <!-- end info-card -->

          <!-- Right Column Container (Chat + Hasil Pemenuhan) -->
          <div class="right-column">
            <!-- Chat Card -->
            <div class="chat-card">
              <h3>Chat</h3>
              <div class="chat-content">
                <div v-if="messages.length === 0"
              class='message-bubble'>Belum ada pesan</div>
                <div
                  v-for="(message, index) in messages"
                  :key="index"
                  :class="['message-bubble', message.id_user == userId ? 'sent' : 'received']"
                >
                  <strong class="message-text">{{ message.sender }}</strong>
                  <div class="message-text">{{ message.text }}</div>
                  <div v-if="message.dokumen_path" class="message-doc">
                    <template v-if="isImage(message.dokumen_path)">
                      <img :src="'/files/' + message.dokumen_path" alt="dokumen" class="message-image" />
                    </template>
                    <template v-else>
                      <a :href="'/files/' + message.dokumen_path" target="_blank" class="message-link">📎 Lihat Dokumen</a>
                    </template>
                  </div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
              <div class="chat-input">
                <label for="file-upload" class="upload-btn">Tambah File</label>
                <input
                  type="file"
                  id="file-upload"
                  ref="fileInput"
                  @change="handleFileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none;"
                />
                <!-- Tampilkan nama file -->
              <span v-if="dokumen" class="file-info">
                File terpilih: {{ dokumen.name }}
              </span>
                <textarea
                  v-model="newMessage"
                  class="message"
                  placeholder="Pesan"
                  @keyup.enter="addMessage"
                ></textarea>
                <button class="send-btn-chat" @click="addMessage">Kirim</button>
              </div>
              <div class ="info-row-PelaksanaTeknis">
                  <strong>Nama Pelaksana Teknis:</strong>
                  <div>{{ nama_depanTeknis + ' ' + nama_belakangTeknis }}</div>
              </div>
            </div> <!-- end chat-card -->

            <!-- Hasil Pemenuhan - Tampilkan jika status selesai -->
            <div v-if="status === 5 || status === 6" class="hasil-pemenuhan-container">
              <h3 style="color: #2196f3; font-size: 1.2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #2196f3;">
                Hasil Pemenuhan
              </h3>
              <div class="info-row-docs">
                <h4 class="judul-input-tambahan">Hasil Pemenuhan</h4>
                <div v-if="HasilPemenuhan_Path">
                  <a :href="HasilPemenuhan_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline; display: block; padding: 0.75rem; background-color: #f5f5f5; border-radius: 8px; margin-bottom: 1rem;">
                    📄 {{ namaFileHasilPemenuhan }}
                  </a>
                </div>
                <div v-else style="color: #888; font-style: italic; font-size: 0.9rem; padding: 0.75rem; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 1rem;">
                  Belum diunggah oleh pelaksana teknis
                </div>

                <h4 class="judul-input-tambahan">Hasil BA</h4>
                <div v-if="HasilBA_Path">
                  <a :href="HasilBA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline; display: block; padding: 0.75rem; background-color: #f5f5f5; border-radius: 8px; margin-bottom: 1rem;">
                    📋 {{ namaFileHasilBA }}
                  </a>
                </div>
                <div v-else style="color: #888; font-style: italic; font-size: 0.9rem; padding: 0.75rem; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 1rem;">
                  Belum diunggah oleh pelaksana teknis
                </div>
              </div>
            </div> <!-- end hasil-pemenuhan-container -->
          </div> <!-- end right-column -->
        </div> <!-- end layout-container -->
      </div> <!-- end informasi tab -->

      <!-- Tracking Tab -->
      <div v-else-if="activeTab === 'tracking'" class="tab-content">
        <div>
          <h2 class="card-title">Detail Progress<br>{{ pelayananId }}</h2>
          <div class="step-wrapper">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="step-row"
            >
              <div
                class="circle"
                :class="getStepClass(index, status)"
              >
                {{ index + 1 }}
              </div>
              <div
                class="step-label"
                :class="[stepsStatus[index] === 1 ? 'label-blue' : '', status === 3 ? 'label-red' : '']"
              >
                {{ step }}
              </div>
            </div>
          </div>

          <!-- Status Message untuk Ditolak -->
          <div v-if="status === 3" class="status-message status-message-rejected">
            <div class="status-icon">❌</div>
            <div>
              <strong>Pelayanan Ditolak</strong>
              <p>Permintaan pelayanan ini telah ditolak oleh Pengelola.</p>
            </div>
          </div>
        </div>
      </div> <!-- end tracking tab -->
    </div> <!-- end card -->
  </div> <!-- end isDataLoaded -->

  <!-- Error State -->
  <div v-else class="error-container">
    <p>Gagal memuat data. Silakan coba lagi.</p>
  </div>
</div>
</template>

<style scoped>
.container {
  width: 100%;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  color: #ef4444;
}

/* Card */
.card {
  width: 100%;
  width: 1100px;
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  border-top-left-radius: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab-content {
  animation: fadeIn 0.1s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Layout Container */
.layout-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* Right Column Container (Chat + Hasil Pemenuhan) */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 50%;
}

/* Informasi */
.info-card {
  background-color: white;
  padding: 0rem 1.5rem 1.5rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.chat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

/* Style untuk Hasil Pemenuhan Container */
.hasil-pemenuhan-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.hasil-pemenuhan-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  padding: 0.8rem 0;
}

.info-row-docs {
  display: block;
}

.info-row strong {
  width: 12rem;
  flex-shrink: 0;
}

.info-row span {
  margin-left: 10px;
  flex-grow: 1;
}

.textarea-row {
  flex-direction: column;
  align-items: start;
}

.textarea-row textarea {
  width: 97%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: vertical;
  font-family: poppins, sans-serif;
  background-color: #e6e6e6;
}

.chat-content {
  background-color: #e6e6e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-bubble {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  max-width: 70%;
  font-size: 0.9rem;
}

.received {
  background-color: #fff;
  align-self: flex-start;
}

.sent {
  background-color: #2196f3;
  color: white;
  align-self: flex-end;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 5px;
  text-align: right;
  opacity: 0.7;
}

.note {
  color: #888;
  font-size: 0.8rem;
  margin-top: -0.3rem;
}

.input {
  background-color: white;
  color: black;
}

.review-section {
  border-top: 1px solid #eee;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0rem;
  margin-top: 0.2rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star {
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.star.filled {
  color: #ffc107;
}

.review-textarea {
  width: 95%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  resize: vertical;
  margin-bottom: 1rem;
  background-color: white;
  color: black;
  font-family: poppins, sans-serif;
}

.thank-you-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

/* Action Buttons Container */
.action-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Refresh Button */
.refresh-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-button:hover:not(:disabled) {
  background-color: #45a049;
}

.refresh-button:active:not(:disabled) {
  transform: scale(0.98);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Auto-refresh Indicator */
.auto-refresh-indicator {
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auto-refresh-indicator::before {
  content: '●';
  color: #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Print Button */
.print-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.print-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.print-button:hover {
  background-color: #1976d2;
}

.print-button:active {
  transform: scale(0.98);
}

/* Print Styles */
@media print {
  /* Sembunyikan elemen yang tidak perlu dicetak */
  .action-buttons-container,
  .refresh-button,
  .auto-refresh-indicator,
  .print-button,
  .tabs,
  .tab,
  .chat-input,
  .upload-btn,
  #file-upload,
  .file-info,
  .chat-content input,
  .chat-content textarea,
  button,
  .message-time {
    display: none !important;
  }

  /* Atur layout untuk print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .container {
    padding: 0 !important;
    min-height: auto !important;
    background: white !important;
  }

  .card {
    box-shadow: none !important;
    border: none !important;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Tampilkan tabs sebagai header */
  .tabs {
    display: block !important;
    border-bottom: 2px solid #2196f3 !important;
    margin-bottom: 20px !important;
  }

  .tab {
    display: inline-block !important;
    padding: 8px 16px !important;
    background: #2196f3 !important;
    color: white !important;
    font-weight: bold !important;
    margin-right: 8px !important;
    border-radius: 4px 4px 0 0 !important;
  }

  .layout-container {
    flex-direction: column !important;
    display: block !important;
  }

  .info-card,
  .chat-card,
  .right-column {
    width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    page-break-inside: avoid;
    padding: 0 !important;
    margin: 0 0 20px 0 !important;
  }

  /* Pastikan semua konten terlihat saat print */
  .info-card,
  .chat-card,
  .right-column,
  .review-section {
    display: block !important;
  }

  /* Styling informasi */
  .info-card h3,
  .chat-card h3,
  .right-column h3 {
    background: #2196f3 !important;
    color: white !important;
    padding: 10px 15px !important;
    margin: 20px 0 15px 0 !important;
    border-radius: 5px !important;
    font-size: 16pt !important;
  }

  .info-row {
    border-bottom: 1px solid #ddd !important;
    padding: 8px 0 !important;
    display: flex !important;
  }

  .info-row strong {
    font-weight: bold !important;
    min-width: 200px !important;
    color: #333 !important;
  }

  .info-row span,
  .info-row textarea {
    color: #000 !important;
    font-size: 11pt !important;
  }

  .info-row textarea {
    border: 1px solid #ddd !important;
    background: #f9f9f9 !important;
  }

  /* Styling chat */
  .chat-content {
    border: 1px solid #ddd !important;
    padding: 15px !important;
    min-height: 100px !important;
  }

  .message-bubble {
    margin-bottom: 12px !important;
    padding: 10px !important;
    background: #f9f9f9 !important;
    border-left: 3px solid #2196f3 !important;
    page-break-inside: avoid;
  }

  .message-bubble .message-text {
    color: #000 !important;
    font-size: 11pt !important;
  }

  .message-bubble .sender {
    color: #2196f3 !important;
    font-weight: bold !important;
    font-size: 10pt !important;
  }

  /* Styling ulasan */
  .review-section {
    border: 2px solid #4CAF50 !important;
    padding: 15px !important;
    margin: 20px 0 !important;
    background: #f1f8f4 !important;
    page-break-inside: avoid;
  }

  .review-title {
    color: #2e7d32 !important;
    font-size: 14pt !important;
    margin-bottom: 10px !important;
  }

  .star {
    font-size: 18pt !important;
  }

  .star.filled {
    color: #ffc107 !important;
  }

  .thank-you-message {
    background: #e8f5e9 !important;
    color: #2e7d32 !important;
    border: 1px solid #4CAF50 !important;
  }

  .review-textarea {
    border: 1px solid #ddd !important;
    background: #f9f9f9 !important;
    color: #000 !important;
  }

  /* Link styling */
  a {
    color: #2196f3 !important;
    text-decoration: underline !important;
  }

  /* Tambahkan header */
  .card::before {
    content: "BUKTI PELAYANAN SELESAI" !important;
    display: block !important;
    text-align: center !important;
    font-size: 18pt !important;
    font-weight: bold !important;
    margin-bottom: 20px !important;
    padding: 15px !important;
    background: #2196f3 !important;
    color: white !important;
  }

  /* Footer halaman */
  .card::after {
    content: "Dicetak pada: " attr(data-print-date) !important;
    display: block !important;
    text-align: center !important;
    font-size: 10pt !important;
    color: #666 !important;
    margin-top: 30px !important;
    padding-top: 15px !important;
    border-top: 1px solid #ddd !important;
  }

  /* Atur ukuran font untuk print */
  body {
    font-size: 11pt !important;
    line-height: 1.4 !important;
  }

  /* Page break */
  .card {
    page-break-inside: avoid;
  }

  /* Pastikan textarea ditampilkan dengan benar */
  textarea {
    white-space: pre-wrap !important;
    overflow: visible !important;
  }
}

/* Tabs Styling */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.active-tab-info {
  background-color: #2196f3;
  color: white;
}

.active-tab-track {
  background-color: #2196f3;
  color: white;
}

.inactive-tab {
  background-color: #f5f5f5;
  color: #666;
}

.inactive-tab:hover {
  background-color: #e0e0e0;
}

/* Card Title */
.card-title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

/* Progress/Step Tracking Styles */
.step-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.step-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.circle-blue {
  background-color: #2196f3;
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.circle-inactive {
  background-color: #e0e0e0;
  color: #999;
  border: 2px solid #ccc;
}

.step-label {
  font-size: 1rem;
  color: #666;
  flex-grow: 1;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.label-blue {
  color: #2196f3;
  font-weight: 600;
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.label-red {
  color: #d32f2f;
  font-weight: 600;
}

.circle-red {
  background-color: #F44336;
  color: white;
}

.status-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-message-rejected {
  background-color: #FFEBEE;
  border-left: 5px solid #F44336;
}

.status-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.status-message strong {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #C62828;
}

.status-message p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

/* Loading Spinner Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #0D47A1;
  border-top: 4px solid #64B5F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Additional Button Styles */
.upload-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-block;
  margin-right: 0.5rem;
}

.upload-btn:hover {
  background-color: #45a049;
}

.file-info {
  font-size: 0.85rem;
  color: #666;
  margin-right: 0.5rem;
  font-style: italic;
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.chat-input textarea {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.6rem;
  resize: vertical;
  font-family: poppins, sans-serif;
  background-color: white;
  color: black;
  min-height: 50px;
}

.chat-input button {
  white-space: nowrap;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.message-link {
  color: #2196f3;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.message-link:hover {
  text-decoration: underline;
}

.link-surat {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
}

.judul-input-tambahan {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}

/* Style untuk link download hasil pemenuhan */
.info-row-docs a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.info-row-docs a:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.alasan-tolak {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 4px;
}
</style>