<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// State management
const userId = ref(localStorage.getItem('user_id'));
const pelayananId = ref(route.query.layanan || '-')
const steps = ref([])
const stepsStatus = ref([])
const stepsID = ref([]) 
const status = ref('')
const perihal = ref('')
const tanggal = ref('')
const nama_pelapor = ref('')
const no_telp = ref('')
const nama_depanTeknis = ref('') 
const nama_belakangTeknis = ref('')
const nama_depanUnit = ref('') 
const nama_belakangUnit = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan = ref('')
const deskripsi = ref('')
const pesanPengelola = ref('')
const organisasi = ref('')
const surat_dinas = ref('')
const lampiran = ref('')
const pesanUnit = ref('')
const pesanRevisi = ref('')
const pesanTeknis = ref('') // Pesan dari unit ke teknis
const isDone = ref(false)
const src_HasilPemenuhan = ref('-')
const src_HasilBA = ref('-')
const src_HasilSLA = ref('-')
const activeTab = ref('informasi')

// Data untuk disposisi ke teknis
const daftarTeknis = ref([])
const idTeknisTerpilih = ref('')

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
  pesanRevisi: pesanRevisi.value,
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
  isDone: isDone.value,
  tanggal: tanggal.value,
  steps: steps.value,
  stepsStatus: stepsStatus.value
}))

// Fungsi untuk fetch data dengan caching
const fetchPelayananData = async () => {
  if (dataCache.value && dataCache.value.id === pelayananId.value) {
    // Gunakan data dari cache
    const cached = dataCache.value
    deskripsi.value = cached.deskripsi
    pesanPengelola.value = cached.pesanPengelola
    pesanUnit.value = cached.pesanUnit
    pesanRevisi.value = cached.pesanRevisi
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
    isDone.value = cached.isDone
    perihal.value = cached.perihal
    tanggal.value = cached.tanggal
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
    pesanRevisi.value = pelayananData.Pesan_Revisi
    status.value = pelayananData.ID_Status
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
    nama_depanTeknis.value = pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangTeknis.value = pelayananData.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    nama_depanUnit.value = pelayananData.unit_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangUnit.value = pelayananData.unit_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value = pelayananData.Perihal
    isDone.value = Boolean(pelayananData.Is_Done)
    tanggal.value = pelayananData.created_at
    messages.value = pelayananData.pelayanan_pesan.map(pesan => ({
      id_user: pesan.ID_User,
      text: pesan.Pesan,
      sender: `${pesan.pesan_user.Nama_Depan} ${pesan.pesan_user.Nama_Belakang} - ${pesan.pesan_user.user_role.Nama_Role}`,
      time: new Date(pesan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dokumen_path: pesan.Dokumen_Path
    }))

    // Set progress data
    const progressData = progressResponse.data

    // Hapus duplikat steps berdasarkan Nama_Alur
    const uniqueSteps = []
    const uniqueStatus = []
    const uniqueIDs = []
    const seenSteps = new Set()

    for (let i = 0; i < progressData.length; i++) {
      const stepName = progressData[i].progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui'
      if (!seenSteps.has(stepName)) {
        seenSteps.add(stepName)
        uniqueSteps.push(stepName)
        uniqueStatus.push(progressData[i].Is_Done)
        uniqueIDs.push(progressData[i].ID_Progress_Alur)
      }
    }

    steps.value = uniqueSteps
    stepsStatus.value = uniqueStatus
    stepsID.value = uniqueIDs

    // Cache data
    dataCache.value = {
      id: pelayananId.value,
      deskripsi: deskripsi.value,
      pesanPengelola: pesanPengelola.value,
      pesanUnit: pesanUnit.value,
      pesanRevisi: pesanRevisi.value,
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
      isDone: isDone.value,
      steps: steps.value,
      stepsStatus: stepsStatus.value
    }

    isDataLoaded.value = true
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const SuratDinas_Path = computed(() => '/files/' + surat_dinas.value)
const namaFileSuratDinas = computed(() => {
  const fileName = surat_dinas.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_Surat_Dinas.pdf`
})

const Lampiran_Path = computed(() => '/files/' + lampiran.value)
const namaFileLampiran = computed(() => {
  const fileName = lampiran.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_Lampiran.pdf`
})

const HasilPemenuhan_Path = computed(() => '/files/' + src_HasilPemenuhan.value)
const namaFileHasilPemenuhan = computed(() => {
  const fileName = src_HasilPemenuhan.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilPemenuhan.pdf`
})

const HasilBA_Path = computed(() => '/files/' + src_HasilBA.value)
const namaFileHasilBA = computed(() => {
  const fileName = src_HasilBA.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilBA.pdf`
})

const HasilSLA_Path = computed(() => '/files/' + src_HasilSLA.value)
const namaFileHasilSLA = computed(() => {
  const fileName = src_HasilSLA.value.split('/').pop() 
  const parts = fileName.split('_')
  const tanggal = parts[0]
  const waktu = parts[1]
  return `${tanggal}_${waktu}_HasilSLA.pdf`
})

const messages = ref([
{
    text: "Halo, bagaimana saya bisa membantu?",
    sender: "Admin",
    role: "Admin",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
])

const dokumen = ref(null)
const newMessage = ref('')
const fileInput = ref(null);

const isImage = (path) => {
  return /\.(jpg|jpeg|png)$/i.test(path);
};

// Fungsi untuk mendapatkan teks status
const getStatusText = (statusId) => {
  const statusMap = {
    1: 'Baru',
    2: 'Sedang Diproses',
    3: 'Ditolak',
    4: 'Revisi',
    5: 'Selesai',
    6: 'Selesai (Sudah Survey)'
  }
  return statusMap[statusId] || 'Status Tidak Diketahui'
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

const pilihan = ref('')
function handlePilihan(klik) {
  pilihan.value = klik
}

async function handleSelesai() {
  const token = localStorage.getItem('Token');
  if (pilihan.value === 'Selesai') {
    axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
    {
      ID_Status: 5,
      Pesan_Unit: pesanUnit.value,
      Is_Done: true
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })
    const lastIndex = stepsID.value.length - 1
    const lastStepId = stepsID.value[lastIndex]
    if (lastStepId) {
      await axios.put(`/api/progress-alur/update-status/${lastStepId}`,
      {
        Is_Done: 1
      },
      {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } else {
      console.warn('ID langkah terakhir tidak ditemukan di stepsID')
    }
    router.push('/Disposisi')
  } else if (pilihan.value === 'Disposisi Teknis') {
    // Validasi
    if (!idTeknisTerpilih.value) {
      alert('Harap pilih Pelaksana Teknis terlebih dahulu')
      return
    }

    axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
    {
      ID_Status: 4, // Diproses
      ID_Teknis: idTeknisTerpilih.value,
      Pesan_Unit: pesanTeknis.value,
      Is_Done: false
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })
    .then(() => {
      alert('Tiket berhasil didistribusikan ke Pelaksana Teknis')
      router.push('/Disposisi')
    })
    .catch(error => {
      console.error('Error mendistribusikan ke teknis:', error)
      alert('Gagal mendistribusikan tiket. Silakan coba lagi.')
    })
  } else if (pilihan.value === 'Revisi') {
    axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
    {
      ID_Status: 4,
      Pesan_Revisi: pesanRevisi.value,
      Is_Done: false,
      Hasil_Pemenuhan_Path: null,
      BA_Path: null,
      SLA_Path: null,
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      }
    })
    .then(() => router.push('/Disposisi'))
    .catch(error => console.error('Error updating status to Revisi:', error));
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
    fetchDaftarTeknis()
  }
})

onMounted(() => {
  if (pelayananId.value && pelayananId.value !== '-') {
    fetchPelayananData()
    fetchDaftarTeknis()
  }
})

// Fungsi untuk mengambil daftar pelaksana teknis
const fetchDaftarTeknis = async () => {
  try {
    const token = localStorage.getItem('Token')
    const response = await axios.get('/api/pelayanan/allTeknis', {
      headers: { Authorization: 'Bearer ' + token }
    })
    daftarTeknis.value = response.data.map(item => ({
      id_user: item.ID_User,
      nama_depan: item.Nama_Depan,
      nama_belakang: item.Nama_Belakang
    }))
  } catch (error) {
    console.error('Gagal mengambil daftar teknis:', error)
  }
}
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
              <strong class="link-surat">Pesan dari Pengelola</strong>
              <textarea class="input" :value="pesanPengelola" placeholder="Deskripsi Pelayanan" rows="5" readonly></textarea>
            </div>
            </div>

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

            <div v-if="status !== 6">
              <div class="chat-input">
              <label for="file-upload" class="upload-btn">Kirim File</label>
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

            <div class ="info-row-PelaksanaTeknis">
              <strong>Nama Pelaksana Teknis</strong>
              <div>{{ nama_depanTeknis + ' ' + nama_belakangTeknis }}</div>
            </div>
              <strong>Pesan dari {{ nama_depanUnit + ' ' + nama_belakangUnit }}</strong>
              <div class="textarea-row">
              <textarea class="input" :value="pesanUnit" placeholder="Deskripsi Pelayanan" rows="5" readonly></textarea>
            </div>

            <div v-if="isDone" class="document-links" >
              <div class="info-row-docs">
                <h4 class="link-hasil">Hasil Pemenuhan</h4>
                <div v-if="HasilPemenuhan_Path">
                  <a :href="HasilPemenuhan_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                    {{ namaFileHasilPemenuhan }}
                  </a>
                </div>
                <h4 class="link-hasil">Hasil BA</h4>
                <div v-if="HasilBA_Path">
                  <a :href="HasilBA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                    {{ namaFileHasilBA }}
                  </a>
                </div>
                  <h4 class="link-hasil">Hasil SLA</h4>
                  <div v-if="HasilSLA_Path">
                    <a :href="HasilSLA_Path" target="_blank" rel="noopener" style="color: #2196f3; text-decoration: underline;">
                      {{ namaFileHasilSLA }}
                    </a>
                  </div>
              </div>

              <div class="tinjau-card" v-if="isDone && status !== 5 && status !== 6">
                <h3>Tinjau Pelayanan</h3>
                <div class="wrapper-btn">
                  <button class="btn-disposisi" @click="handlePilihan('Disposisi Teknis')">Disposisi ke Teknis</button>
                  <button class="btn-selesai" @click="handlePilihan('Selesai')">Selesai</button>
                  <button class="btn-revisi" @click="handlePilihan('Revisi')">Revisi</button>
                </div>

                <!-- Disposisi ke Teknis -->
                <div class="wrapper-disposisi" v-if="pilihan == 'Disposisi Teknis'">
                  <h5 class="note">Distribusikan ke Pelaksana Teknis</h5>

                  <strong class="link-surat">Pilih Pelaksana Teknis<span class="red">*</span></strong>
                  <select v-model="idTeknisTerpilih" class="select-teknis">
                    <option disabled value="">Pilih Pelaksana Teknis</option>
                    <option
                      v-for="item in daftarTeknis"
                      :key="item.id_user"
                      :value="item.id_user"
                    >
                      {{ item.nama_depan }} {{ item.nama_belakang }}
                    </option>
                  </select>

                  <strong class="link-surat">Pesan untuk Pelaksana Teknis</strong>
                  <textarea class="textarea-row-tambahan" v-model="pesanTeknis" placeholder="Tulis pesan atau instruksi untuk pelaksana teknis..."></textarea>

                  <div class="info-note">
                    <small>⚠️ Tiket akan didistribusikan ke Pelaksana Teknis untuk diproses lebih lanjut</small>
                  </div>

                  <button class="btn-selesai-detail" @click="handleSelesai">Kirim ke Teknis</button>
                </div>

                <!-- Selesai Langsung -->
                <div class="wrapper-selesai" v-if="pilihan == 'Selesai'">
                  <h5 class="note">Apakah anda yakin untuk menyelesaikan pelayanan ini?</h5>
                  <div class="info-note" style="margin-bottom: 1rem;">
                    <small>ℹ️ Pelayanan akan langsung ditandai selesai tanpa melalui teknis</small>
                  </div>
                  <button class="btn-selesai-detail" @click="handleSelesai">Konfirmasi</button>
                </div>

                <!-- Revisi -->
                <div class="wrapper-revisi" v-if="pilihan == 'Revisi'">
                  <strong class="link-surat">Pesan untuk revisi</strong>
                  <textarea class="textarea-row-tambahan" v-model="pesanRevisi" placeholder="Tulis pesan revisi"></textarea>
                  <div class="info-note">
                    <small>⚠️ Tiket akan dikembalikan ke Pelaksana Teknis untuk revisi</small>
                  </div>
                  <button class="btn-selesai-detail" @click="handleSelesai">Kirim Revisi</button>
                </div>
              </div>
            </div>
            <div v-else class="revisi-row">
              <strong>Revisi</strong>
              <div class="textarea-row">
              <textarea class="input" :value="pesanRevisi" placeholder="Tidak ada revisi" rows="5" readonly></textarea>
              </div>
            </div>
          </div> <!-- end chat-card -->
        </div> <!-- end layout-container -->
      </div> <!-- end informasi tab -->

      <!-- Tracking Tab -->
      <div v-else-if="activeTab === 'tracking'" class="tab-content">
        <div>
          <h2 class="card-title">Detail Progress<br>{{ pelayananId }}</h2>

          <!-- Status Badge -->
          <div class="status-badge-container">
            <div
              class="status-badge"
              :class="{
                'status-baru': status === 1,
                'status-diproses': status === 2,
                'status-ditolak': status === 3,
                'status-revisi': status === 4,
                'status-selesai': status === 5,
                'status-survey': status === 6
              }"
            >
              {{ getStatusText(status) }}
            </div>
          </div>

          <!-- Special Message for Rejected/Revision -->
          <div v-if="status === 3" class="status-message status-message-rejected">
            <div class="status-icon">❌</div>
            <div>
              <strong>Permintaan Ditolak</strong>
              <p v-if="pesanPengelola">{{ pesanPengelola }}</p>
            </div>
          </div>

          <div v-else-if="status === 4" class="status-message status-message-revision">
            <div class="status-icon">🔄</div>
            <div>
              <strong>Perlu Revisi</strong>
              <p v-if="pesanRevisi">{{ pesanRevisi }}</p>
            </div>
          </div>

          <!-- Progress Steps (hanya tampilkan jika tidak ditolak) -->
          <div v-if="status !== 3 && steps && steps.length > 0" class="step-wrapper">
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
                :class="stepsStatus && stepsStatus[index] === 1 ? 'label-blue' : ''"
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

.info-row-PelaksanaTeknis {
  margin-bottom: 0.5rem;
  padding: 0.8rem 0;
}

.revisi-row {
  margin-top: 1rem;
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

.tinjau-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.wrapper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-disposisi {
  color: white;
  background-color: #2196f3;
  border-radius: 15px;
  padding: 0.5rem 2rem;
  font-family: 'Poppins';
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s;
}
.btn-disposisi:hover {
  background-color: #1976d2;
  transform: translateY(-2px);
}

.btn-selesai {
  color: white;
  background-color: #00982e;
  border-radius: 15px;
  padding: 0.5rem 2rem;
  font-family: 'Poppins';
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.btn-selesai:hover {
  background-color: #00c13a;
}

.btn-revisi {
  color: white;
  background-color: #FF9800;
  border-radius: 15px;
  padding: 0.5rem 2rem;
  font-family: 'Poppins';
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.btn-revisi:hover {
  background-color: #ffa41b;
}

.wrapper-disposisi,
.wrapper-selesai,
.wrapper-revisi {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  color: black;
  background-color: white;
}

.btn-confirm {
  color: white;
  background-color: #2BA9E4;
  border-radius: 12px;
  padding: 0.5rem 2rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  width: fit-content;
  align-self: center;
}
.btn-confirm:hover {
  transform: scale(1.02);
  background-color: #48B7ED;
}

.note {
  color: #000000;
  font-size: 0.9rem;
  font-weight: 400;
  text-align: center;
}

.input {
  background-color: white;
  color: black;
  font-family: poppins, sans-serif;
}

.review-section {
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

/* Status Badge Styles */
.status-badge-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.status-badge {
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-badge.status-baru {
  background-color: #E3F2FD;
  color: #1976D2;
  border: 2px solid #2196F3;
}

.status-badge.status-diproses {
  background-color: #FFF3E0;
  color: #F57C00;
  border: 2px solid #FF9800;
}

.status-badge.status-ditolak {
  background-color: #FFEBEE;
  color: #C62828;
  border: 2px solid #F44336;
}

.status-badge.status-revisi {
  background-color: #FFF9C4;
  color: #F57F17;
  border: 2px solid #FFC107;
}

.status-badge.status-selesai {
  background-color: #E8F5E9;
  color: #388E3C;
  border: 2px solid #4CAF50;
}

.status-badge.status-survey {
  background-color: #E1F5FE;
  color: #0277BD;
  border: 2px solid #03A9F4;
}

/* Status Message Styles */
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

.status-message-revision {
  background-color: #FFF9C4;
  border-left: 5px solid #FFC107;
}

.status-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.status-message strong {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.status-message p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

/* Step Wrapper Styles */
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
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.circle-blue {
  background-color: #2196F3;
  color: white;
}

.circle-inactive {
  background-color: #E0E0E0;
  color: #9E9E9E;
}

.circle-red {
  background-color: #F44336;
  color: white;
}

.step-label {
  font-size: 1rem;
  color: #333;
  flex-grow: 1;
}

.label-blue {
  font-weight: 600;
  color: #1976D2;
}

/* Style untuk dropdown teknis */
.select-teknis {
  width: 95%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 2px solid #2196f3;
  background-color: white;
  color: black;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
}

.select-teknis:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

/* Info note untuk tips/warning */
.info-note {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.info-note small {
  color: #1976d2;
  font-size: 0.85rem;
}
</style>