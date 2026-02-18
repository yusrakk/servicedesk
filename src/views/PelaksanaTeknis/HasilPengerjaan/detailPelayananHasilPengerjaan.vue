<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// State management
const userId = ref(localStorage.getItem('user_id'));
const pelayananId = ref(route.query.layanan || '-')
const steps = ref([])
const stepsStatus = ref([])
const perihal = ref('') 
const tanggal = ref('')
const nama_pelapor = ref('')
const no_telp = ref('')
const nama_depanUnit = ref('') 
const nama_belakangUnit = ref('')
const nama_depanTeknis = ref('') 
const nama_belakangTeknis = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan = ref('')
const deskripsi = ref('')
const organisasi = ref('')
const SuratDinas_Path = ref(null)
const Lampiran_Path = ref(null)
const activeTab = ref('informasi')
const pelaksana = ref([])
const teknis = ref([])
const idTeknisTerpilih = ref('')
const pesanUnit = ref('')
const pesanRevisi = ref('')
const status = ref(Number(''))

const messages = ref([])

const surat_dinas = ref('')
const lampiran = ref('')

const src_HasilPemenuhan = ref(null)
const src_HasilBA = ref(null)
const src_HasilSLA = ref(null)

// Loading states
const isLoading = ref(true)
const isDataLoaded = ref(false)

// Cache untuk mencegah API calls berulang
const dataCache = ref(null)

const pilihan = ref('')
function handlePilihan(klik){
  pilihan.value = klik
}

// Computed properties untuk optimasi
const pelayananData = computed(() => ({
  deskripsi: deskripsi.value,
  organisasi: organisasi.value,
  surat_dinas: surat_dinas.value,
  lampiran: lampiran.value,
  src_HasilPemenuhan: src_HasilPemenuhan.value,
  src_HasilBA: src_HasilBA.value,
  src_HasilSLA: src_HasilSLA.value,
  pesanRevisi: pesanRevisi.value,
  pesanUnit: pesanUnit.value,
  sub_jenis_pelayanan: sub_jenis_pelayanan.value,
  jenis_pelayanan: jenis_pelayanan.value,
  nama_pelapor: nama_pelapor.value,
  no_telp: no_telp.value,
  nama_depanUnit: nama_depanUnit.value,
  nama_belakangUnit: nama_belakangUnit.value,
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
    pesanRevisi.value = cached.pesanRevisi
    pesanUnit.value = cached.pesanUnit
    surat_dinas.value = cached.surat_dinas
    lampiran.value = cached.lampiran
    src_HasilPemenuhan.value = cached.src_HasilPemenuhan
    src_HasilBA.value = cached.src_HasilBA
    src_HasilSLA.value = cached.src_HasilSLA
    sub_jenis_pelayanan.value = cached.sub_jenis_pelayanan
    jenis_pelayanan.value = cached.jenis_pelayanan
    nama_pelapor.value = cached.nama_pelapor
    no_telp.value = cached.no_telp
    nama_depanUnit.value = cached.nama_depanUnit
    nama_belakangUnit.value = cached.nama_belakangUnit
    perihal.value = cached.perihal
    tanggal.value = cached.tanggal
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
    pesanRevisi.value = pelayananData.Pesan_Revisi
    pesanUnit.value = pelayananData.Pesan_Unit
    surat_dinas.value = pelayananData.Surat_Dinas_Path
    lampiran.value = pelayananData.Lampiran_Path
    src_HasilPemenuhan.value = pelayananData.Hasil_Pemenuhan_Path
    src_HasilBA.value = pelayananData.BA_Path
    src_HasilSLA.value = pelayananData.SLA_Path
    sub_jenis_pelayanan.value = pelayananData.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = pelayananData.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value = [pelayananData.user.Nama_Depan, pelayananData.user.Nama_Belakang].filter(Boolean).join(' ');
    no_telp.value = pelayananData.No_Telp || '-'
    nama_depanTeknis.value = pelayananData.teknis_pelayanan?.Nama_Depan
    nama_belakangTeknis.value = pelayananData.teknis_pelayanan?.Nama_Belakang
    nama_depanUnit.value = pelayananData.unit_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangUnit.value = pelayananData.unit_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value = pelayananData.Perihal
    tanggal.value = pelayananData.created_at
    status.value = pelayananData.ID_Status
    messages.value = pelayananData.pelayanan_pesan.map(pesan => ({
      id_user: pesan.ID_User,
      text: pesan.Pesan,
      sender: `${pesan.pesan_user.Nama_Depan} ${pesan.pesan_user.Nama_Belakang} - ${pesan.pesan_user.user_role.Nama_Role}`,
      time: new Date(pesan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dokumen_path: pesan.Dokumen_Path
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
      pesanRevisi: pesanRevisi.value,
      pesanUnit: pesanUnit.value,
      surat_dinas: surat_dinas.value,
      lampiran: lampiran.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value,
      jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value,
      no_telp: no_telp.value,
      nama_depanUnit: nama_depanUnit.value,
      nama_belakangUnit: nama_belakangUnit.value,
      perihal: perihal.value,
      tanggal: tanggal.value,
      steps: steps.value,
      stepsStatus: stepsStatus.value,
      status: status.value
    }

    SuratDinas_Path.value = '/files' + surat_dinas.value
    Lampiran_Path.value = '/files' + lampiran.value

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
  return `${parts[0]}_${parts[1]}_HasilPemenuhan.pdf`
})

const namaFileHasilBA = computed(() => {
  if (!src_HasilBA.value) return 'Tidak ada file'
  const fileName = src_HasilBA.value.split('/').pop()
  const parts = fileName.split('_')
  return `${parts[0]}_${parts[1]}_HasilBA.pdf`
})

const namaFileHasilSLA = computed(() => {
  if (!src_HasilSLA.value) return 'Tidak ada file'
  const fileName = src_HasilSLA.value.split('/').pop()
  const parts = fileName.split('_')
  return `${parts[0]}_${parts[1]}_HasilSLA.pdf`
})


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

  const handlePopState = () => {
    router.push('/pelayanan')
  }

  window.addEventListener('popstate', handlePopState)

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState)
  })
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
              <strong>Pesan dari {{ nama_depanUnit + ' ' + nama_belakangUnit }}</strong>
              <div class="textarea-row">
                <textarea class="input" :value="pesanUnit" placeholder="Pesan dari unit" rows="5" readonly></textarea>
              </div>
            </div>

            <!-- Hasil Pemenuhan - Tampilkan jika status selesai -->
            <div v-if="status === 5 || status === 6" class="info-card hasil-pemenuhan-card">
              <h3>Hasil Pemenuhan</h3>
              <div class="info-row-docs">
                <div v-if="HasilPemenuhan_Path">
                  <h4 class="judul-input-tambahan">Hasil Pemenuhan</h4>
                  <a :href="HasilPemenuhan_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline; display: block; margin-bottom: 0.5rem;">
                    📄 {{ namaFileHasilPemenuhan }}
                  </a>
                </div>
                <div v-else style="color: #888; font-style: italic; font-size: 0.9rem; margin-bottom: 0.5rem;">
                  Belum diunggah
                </div>

                <div v-if="HasilBA_Path">
                  <h4 class="judul-input-tambahan">Berita Acara (BA)</h4>
                  <a :href="HasilBA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline; display: block; margin-bottom: 0.5rem;">
                    📋 {{ namaFileHasilBA }}
                  </a>
                </div>
                <div v-else style="color: #888; font-style: italic; font-size: 0.9rem; margin-bottom: 0.5rem;">
                  Belum diunggah
                </div>
              </div>
            </div>

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
              <label for="file-upload" class="upload-btn">Kirim</label>
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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>

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

.info-row-hasil {
  display: block;
  padding: 0.8rem 0;
}

.jarak-hasil {
  margin-top: 0.5rem;
}

.upload-hasil {
  margin-bottom: 0.7rem;
}

/* Style untuk Hasil Pemenuhan Card */
.hasil-pemenuhan-card {
  width: 100%;
  margin-top: 2rem;
}

.hasil-pemenuhan-card h3 {
  color: #2196f3;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #2196f3;
}

.info-row-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row-docs h4 {
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.info-row-docs a {
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.info-row-docs a:hover {
  background-color: #e3f2fd;
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
  width: 100%;
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

.input {
  background-color: white;
  color: black;
}
</style>