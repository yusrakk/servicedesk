<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// State management
const pelayananId = ref(route.query.layanan || '-')
const steps = ref([])
const stepsStatus = ref([])
const perihal = ref('')
const tanggal = ref('')
const nama_pelapor= ref('')
const no_telp = ref('')
const nama_depanTeknis = ref('') 
const nama_belakangTeknis = ref('')
const nama_depanUnit = ref('') 
const nama_belakangUnit = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan = ref('')
const deskripsi = ref('')
const pesanPengelola = ref('')
const pesanUnit = ref('')
const organisasi = ref('')
const status = ref('')

const surat_dinas = ref('')
const lampiran = ref('')
const SuratDinas_Path = ref(null)
const Lampiran_Path = ref(null)
const HasilBA_Path = ref(null)
const HasilSLA_Path = ref(null)
const HasilPemenuhan_Path = ref(null)
const src_HasilPemenuhan = ref('-')
const src_HasilBA = ref('-')
const src_HasilSLA = ref('-')

const activeTab = ref('informasi')


// Loading states
const isLoading = ref(true)
const isDataLoaded = ref(false)

// Cache untuk mencegah API calls berulang
const dataCache = ref(null)

// Computed properties untuk optimasi
const pelayananData = computed(() => ({
  deskripsi: deskripsi.value,
  pesanPengelola: pesanPengelola.value,
  pesanUnit: pesanUnit.value,
  organisasi: organisasi.value,
  surat_dinas: surat_dinas.value,
  lampiran: lampiran.value,
  src_HasilPemenuhan: src_HasilPemenuhan.value,
  src_HasilBA: src_HasilBA.value,
  src_HasilSLA: src_HasilSLA.value,
  sub_jenis_pelayanan: sub_jenis_pelayanan.value,
  jenis_pelayanan: jenis_pelayanan.value,
  nama_pelapor: nama_pelapor.value,
  no_telp: no_telp.value,
  nama_depanTeknis: nama_depanTeknis.value,
  nama_belakangTeknis: nama_belakangTeknis.value,
  nama_depanUnit: nama_depanUnit.value,
  nama_belakangUnit: nama_belakangUnit.value,
  perihal: perihal.value,
  tanggal: tanggal.value,
  steps: steps.value,
  stepsStatus: stepsStatus.value,
  rating: rating.value,
  reviewText: reviewText.value
}))

// Fungsi untuk fetch data dengan caching
const fetchPelayananData = async () => {
  if (dataCache.value && dataCache.value.id === pelayananId.value) {
    // Gunakan data dari cache
    const cached = dataCache.value
    deskripsi.value = cached.deskripsi
    pesanPengelola.value = cached.pesanPengelola
    pesanUnit.value = cached.pesanUnit
    organisasi.value = cached.organisasi
    surat_dinas.value = cached.surat_dinas
    lampiran.value = cached.lampiran
    src_HasilPemenuhan.value = cached.src_HasilPemenuhan
    src_HasilBA.value = cached.src_HasilBA
    src_HasilSLA.value = cached.src_HasilSLA
    sub_jenis_pelayanan.value = cached.sub_jenis_pelayanan
    jenis_pelayanan.value = cached.jenis_pelayanan
    nama_pelapor.value = cached.nama_pelapor
    no_telp.value = cached.no_telp
    nama_depanTeknis.value = cached.nama_depanTeknis
    nama_belakangTeknis.value = cached.nama_belakangTeknis
    nama_depanUnit.value = cached.nama_depanUnit
    nama_belakangUnit.value = cached.nama_belakangUnit
    perihal.value = cached.perihal
    tanggal.value = cached.tanggal
    rating.value = cached.rating,
    reviewText.value = cached.reviewText
    steps.value = cached.steps
    stepsStatus.value = cached.stepsStatus
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
    pesanPengelola.value = pelayananData.Pesan_Pengelola
    pesanUnit.value = pelayananData.Pesan_Unit
    organisasi.value = pelayananData.user.user_organisasi.Nama_OPD
    surat_dinas.value = pelayananData.Surat_Dinas_Path
    lampiran.value = pelayananData.Lampiran_Path
    src_HasilPemenuhan.value = pelayananData.Hasil_Pemenuhan_Path || '-'
    src_HasilBA.value = pelayananData.BA_Path || '-'
    src_HasilSLA.value = pelayananData.SLA_Path || '-'
    sub_jenis_pelayanan.value = pelayananData.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = pelayananData.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value = [pelayananData.user.Nama_Depan, pelayananData.user.Nama_Belakang].filter(Boolean).join(' ');
    no_telp.value = pelayananData.No_Telp || '-'
    nama_depanUnit.value = pelayananData.unit_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangUnit.value = pelayananData.unit_pelayanan?.Nama_Belakang || 'Tersedia'
    nama_depanTeknis.value = pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangTeknis.value = pelayananData.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value = pelayananData.Perihal
    tanggal.value = pelayananData.created_at
    rating.value = pelayananData.Rating,
    reviewText.value = pelayananData.Isi_Survey
    status.value = pelayananData.ID_Status


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
      pesanPengelola: pesanPengelola.value,
      pesanUnit: pesanUnit.value,
      organisasi: organisasi.value,
      surat_dinas: surat_dinas.value,
      lampiran: lampiran.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value,
      jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value,
      no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value,
      nama_belakangTeknis: nama_belakangTeknis.value,
      nama_depanUnit: nama_depanUnit.value,
      nama_belakangUnit: nama_belakangUnit.value,
      perihal: perihal.value,
      tanggal: tanggal.value,
      rating: rating.value,
      reviewText: reviewText.value,
      steps: steps.value,
      stepsStatus: stepsStatus.value,
      status: status.value
    }

    SuratDinas_Path.value = '/files' + surat_dinas.value
    Lampiran_Path.value = '/files' + lampiran.value
    HasilPemenuhan_Path.value = '/files' + src_HasilPemenuhan.value
    HasilBA_Path.value = '/files' + src_HasilBA.value
    HasilSLA_Path.value = '/files' + src_HasilSLA.value

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
  if (!src_HasilPemenuhan.value) return 'Tidak ada file'
  const fileName = src_HasilPemenuhan.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilPemenuhan.pdf`
})

const namaFileHasilBA = computed(() => {
  if (!src_HasilBA.value) return 'Tidak ada file'
  const fileName = src_HasilBA.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilBA.pdf`
})

const namaFileHasilSLA = computed(() => {
  if (!src_HasilSLA.value) return 'Tidak ada file'
  const fileName = src_HasilSLA.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilSLA.pdf`
})

const rating = ref(null)
const reviewText = ref('')

// Fungsi untuk menangani perubahan tab (tanpa router navigation)
const handleTabChange = (tab) => {
  activeTab.value = tab
  // Update URL tanpa navigation
  const newQuery = { ...route.query, tab }
  router.replace({ query: newQuery })
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
              <div class="info-row"><strong>Pelapor:</strong> <span>{{ nama_pelapor }}</span></div>
              <div class="info-row"><strong>No Telepon:</strong> <span>{{ no_telp }}</span></div>
              <div class="info-row"><strong>Organisasi:</strong> <span>{{ organisasi }}</span></div>
              <div class="info-row"><strong>Tanggal Laporan:</strong> <span>{{ new Date(tanggal).toLocaleDateString('id-ID') }}</span></div>
              <div class="info-row"><strong>Perihal:</strong> <span>{{ perihal }}</span></div>

              <div class="info-row textarea-row">
                <strong>Deskripsi User</strong>
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
              <div v-if="status !==3" class="info-row textarea-row">
                <strong>Pesan dari Pengelola</strong>
                <textarea class="input" :value="pesanPengelola" placeholder="Tidak Ada Pesan" rows="5" readonly></textarea>
              </div>
            </div> <!-- end info-card -->

            <!-- Chat Card -->
            <div class="chat-card">
              <div class="alasan-tolak" v-if="status === 3">
                <strong>Alasan Penolakan</strong>
                <div class="textarea-row">
                  <textarea class="input" :value="pelayananData.pesanPengelola" placeholder="Alasan Penolakan" rows="5" readonly></textarea>
                </div>
              </div>
              <div v-if="status !== 3">
                <strong>Nama Unit Pelaksana</strong>
              <div class="jarak-bawah">{{ nama_depanUnit + ' ' + nama_belakangUnit }}</div>
            </div>
            <div v-if="status !==3">
              <strong>Pesan dari Unit Pelaksana</strong>
              <div class="textarea-row jarak-bawah">
                <textarea class="input" :value="pesanUnit" placeholder="Tidak Ada Pesan" rows="5" readonly></textarea>
              </div>
            </div>
            <div v-if="status !== 3">
                <strong>Nama Pelaksana Teknis</strong>
              <div>{{ nama_depanTeknis + ' ' + nama_belakangTeknis }}</div>
            </div>
              <div v-if="status !== 3" class="document-links">
                <div>
                  <h4 class="judul-input-tambahan" style="margin-top: 1.2rem;">Hasil Pemenuhan</h4>
                  <div v-if="HasilPemenuhan_Path">
                    <a :href="HasilPemenuhan_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                      {{ namaFileHasilPemenuhan }}
                    </a>
                  </div>
                  <h4 class="judul-input-tambahan" style="margin-top: 1.2rem;">Hasil BA</h4>
                  <div v-if="HasilBA_Path">
                    <a :href="HasilBA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                      {{ namaFileHasilBA }}
                    </a>
                  </div>
                  <h4 class="judul-input-tambahan" style="margin-top: 1.2rem;">Hasil SLA</h4>
                  <div v-if="HasilSLA_Path">
                    <a :href="HasilSLA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                      {{ namaFileHasilSLA }}
                    </a>
                  </div>
                </div>
              </div>
              <!-- Review Section -->
              <div v-if="status === 5">
                <div>
                  <h4 class="review-title">Ulasan Pengguna</h4>
                  <div class="star-rating">
                    <strong>Belum Ada Ulasan dari Pengguna</strong>
                  </div>
                  <textarea v-model="reviewText" class="review-textarea" placeholder="Belum Ada Ulasan" rows="4" readonly></textarea>
                </div>
              </div>
              <div v-if="status !== 3 && status !== 5" class="review-section">
                <div>
                  <h4 class="review-title">Ulasan Pengguna</h4>
                  <div class="star-rating">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ 'filled': star <= (rating) }"
                    >
                      ★
                    </span>
                  </div>
                  <textarea v-model="reviewText" class="review-textarea" placeholder="Belum Ada Ulasan" rows="4" readonly></textarea>
                </div>
              </div>
            </div> <!-- end chat-card -->
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

/* Informasi */
.info-card,
.chat-card {
  background-color: white;
  padding: 0rem 1.5rem 1.5rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 50%;
}

.info-row {
  display: flex;
  padding: 0.8rem 0;
}

.document-links {
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

.jarak-bawah {
  margin-bottom: 1.2rem;
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
  padding-top: 0.5rem;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0rem;
  margin-top: 1rem;
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
  background-color: #e6e6e6;
  color: black;
  font-family: poppins, sans-serif;
}
</style>