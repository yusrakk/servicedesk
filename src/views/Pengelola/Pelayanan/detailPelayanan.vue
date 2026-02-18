<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// dummy for insiden
const urgensi = ref([])
const idUrgensiTerpilih = ref('')

// State management
const userId = ref(localStorage.getItem('user_id'));
const userRole = ref(parseInt(localStorage.getItem('id_role')));
const pelayananId = ref(route.query.layanan || '-')
const steps = ref([])
const stepsStatus = ref([])
const perihal = ref('') 
const id_user = ref('') 
const tanggal = ref('')
const no_telp = ref('')
const nama_pelapor = ref('')
const nama_urgensi = ref('')
const nama_depanTeknis = ref('') 
const nama_belakangTeknis = ref('')
const nama_depanUnit = ref('') 
const nama_belakangUnit = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan = ref('')
const deskripsi = ref('')
const surat_dinas = ref('')
const lampiran = ref('')
const organisasi = ref('')
const SuratDinas_Path = ref(null)
const Lampiran_Path = ref(null)
const activeTab = ref('informasi')
const unit = ref([])
const idUnitTerpilih = ref('')
const idUnitSaatIni = ref('') // Simpan ID Unit saat ini untuk redisposisi
const idUrgensiSaatIni = ref('') // Simpan ID Urgensi saat ini untuk redisposisi
const pesan = ref('')
const status = ref(Number(''))
const progress = ref(null)
const stepsID = ref([]) 

const messages = ref([])

const HasilBA_Path = ref(null)
const HasilSLA_Path = ref(null)
const HasilPemenuhan_Path = ref(null)
const src_HasilPemenuhan = ref('-')
const src_HasilBA = ref('-')
const src_HasilSLA = ref('-')

// Loading states
const isLoading = ref(true)
const isDataLoaded = ref(false)

// Cache untuk mencegah API calls berulang
const dataCache = ref(null)

const pilihan = ref('')
function handlePilihan(klik){
  pilihan.value = klik
  // Set nilai default untuk redisposisi
  if (klik === 'Redisposisi') {
    idUrgensiTerpilih.value = idUrgensiSaatIni.value
    idUnitTerpilih.value = idUnitSaatIni.value
  }
  if (klik === 'TolakDiproses') {
    // Reset form untuk penolakan
    pesan.value = ''
  }
  if (klik === 'TolakBaru') {
    // Reset form untuk penolakan saat baru
    pesan.value = ''
  }
}

// Computed properties untuk optimasi
const pelayananData = computed(() => ({
  deskripsi: deskripsi.value,
  organisasi: organisasi.value,
  surat_dinas: surat_dinas.value,
  lampiran: lampiran.value,
  sub_jenis_pelayanan: sub_jenis_pelayanan.value,
  jenis_pelayanan: jenis_pelayanan.value,
  nama_urgensi: nama_urgensi.value,
  nama_pelapor: nama_pelapor.value,
  pesan: pesan.value,
  nama_depanTeknis: nama_depanTeknis.value,
  nama_belakangTeknis: nama_belakangTeknis.value,
  perihal: perihal.value,
  tanggal: tanggal.value,
  steps: steps.value,
  stepsStatus: stepsStatus.value,
  status: status.value,
  src_HasilPemenuhan: src_HasilPemenuhan.value,
  src_HasilBA: src_HasilBA.value,
  src_HasilSLA: src_HasilSLA.value,
}))

// Fungsi untuk fetch data dengan caching
const fetchPelayananData = async () => {
  if (dataCache.value && dataCache.value.id === pelayananId.value) {
    // Gunakan data dari cache
    const cached = dataCache.value
    deskripsi.value = cached.deskripsi
    organisasi.value = cached.organisasi
    surat_dinas.value = cached.surat_dinas
    src_HasilPemenuhan.value = cached.src_HasilPemenuhan
    src_HasilBA.value = cached.src_HasilBA
    src_HasilSLA.value = cached.src_HasilSLA
    lampiran.value = cached.lampiran
    sub_jenis_pelayanan.value = cached.sub_jenis_pelayanan
    jenis_pelayanan.value = cached.jenis_pelayanan
    nama_urgensi.value = cached.nama_urgensi
    pesan.value = cached.pesan
    nama_pelapor.value = cached.nama_pelapor
    no_telp.value = cached.no_telp
    nama_depanTeknis.value = cached.nama_depanTeknis
    nama_belakangTeknis.value = cached.nama_belakangTeknis
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

    const [pelayananResponse, progressResponse, unitResponse, urgensiResponse] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`, {
        headers: { Authorization: 'Bearer ' + token }
      }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, {
        headers: { Authorization: 'Bearer ' + token }
      }),
      axios.get('/api/pelayanan/unit', {
        headers: { Authorization: 'Bearer ' + token }
      }),
      axios.get('/api/urgensi', {
        headers: { Authorization: 'Bearer ' + token }
      })
    ])

    // Set data
    const pelayananData = pelayananResponse.data
    id_user.value = pelayananData.ID_User
    deskripsi.value = pelayananData.Deskripsi
    organisasi.value = pelayananData.user.user_organisasi?.Nama_OPD || '-'
    surat_dinas.value = pelayananData.Surat_Dinas_Path
    lampiran.value = pelayananData.Lampiran_Path
    sub_jenis_pelayanan.value = pelayananData.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = pelayananData.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value = pelayananData.Nama_Pelapor
    no_telp.value = pelayananData.No_Telp || '-';
    nama_urgensi.value = pelayananData.urgensi_pelayanan?.Nama_Urgensi || 'Belum Ditetapkan'
    idUrgensiSaatIni.value = pelayananData.ID_Urgensi || '' // Simpan ID Urgensi saat ini
    nama_depanUnit.value = pelayananData.unit_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangUnit.value = pelayananData.unit_pelayanan?.Nama_Belakang || 'Ditetapkan'
    idUnitSaatIni.value = pelayananData.ID_Unit || '' // Simpan ID Unit saat ini
    nama_depanTeknis.value = pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangTeknis.value = pelayananData.teknis_pelayanan?.Nama_Belakang || 'Ditetapkan'
    perihal.value = pelayananData.Perihal
    src_HasilPemenuhan.value = pelayananData.Hasil_Pemenuhan_Path || '-'
    src_HasilBA.value = pelayananData.BA_Path || '-'
    src_HasilSLA.value = pelayananData.SLA_Path || '-'
    tanggal.value = pelayananData.created_at
    status.value = pelayananData.ID_Status
    rating.value = pelayananData.Rating
    pesan.value = pelayananData.Pesan_Pengelola
    reviewText.value = pelayananData.Isi_Survey
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
    stepsID.value = progressData.slice(0, 5).map(item => item.ID_Progress_Alur)

    // Set unit data
    unit.value = unitResponse.data.map(item => ({
      id_unit: item.ID_User,
      nama_depan: item.Nama_Depan,
      nama_belakang: item.Nama_Belakang
    }))
    idUnitTerpilih.value = ''

    // Set urgensi data
    urgensi.value = urgensiResponse.data.map(item => ({
      id_urgensi: item.ID_Urgensi,
      nama_urgensi: item.Nama_Urgensi,
    }))
    idUrgensiTerpilih.value = ''

    // Cache data
    dataCache.value = {
      id: pelayananId.value,
      deskripsi: deskripsi.value,
      organisasi: organisasi.value,
      surat_dinas: surat_dinas.value,
      lampiran: lampiran.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value,
      jenis_pelayanan: jenis_pelayanan.value,
      nama_urgensi: nama_urgensi.value,
      nama_pelapor: nama_pelapor.value,
      no_telp: no_telp.value,
      pesan: pesan.value,
      nama_depanTeknis: nama_depanTeknis.value,
      nama_belakangTeknis: nama_belakangTeknis.value,
      perihal: perihal.value,
      tanggal: tanggal.value,
      steps: steps.value,
      stepsStatus: stepsStatus.value,
      status: status.value
    }

    SuratDinas_Path.value = '/files' + surat_dinas.value
    Lampiran_Path.value = '/files' + lampiran.value
    HasilPemenuhan_Path.value = '/files' + src_HasilPemenuhan.value
    HasilBA_Path.value = '/files' + src_HasilBA.value
    HasilSLA_Path.value = '/files' + src_HasilSLA.value

    if (status.value === 2 || status.value === 3 || status.value === 4 || status.value === 5 || status.value === 6 ) {
      progress.value = true
    }

    isDataLoaded.value = true
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleKirimKeUnit = async () => {
  // Debug: log values
  console.log('idUnitTerpilih:', idUnitTerpilih.value, 'Type:', typeof idUnitTerpilih.value)
  console.log('idUrgensiTerpilih:', idUrgensiTerpilih.value, 'Type:', typeof idUrgensiTerpilih.value)

  if (!idUnitTerpilih.value || !idUrgensiTerpilih.value || idUnitTerpilih.value === '' || idUrgensiTerpilih.value === '') {
    alert('Mohon pilih unit pelaksana dan urgensi terlebih dahulu.')
    return
  }

  // Cari nama unit yang dipilih
  const unitDipilih = unit.value.find(u => u.id_unit == idUnitTerpilih.value) // Use == for loose comparison
  const namaUnit = unitDipilih ? `${unitDipilih.nama_depan} ${unitDipilih.nama_belakang}` : 'Unit Pelaksana'

  // Konfirmasi sebelum mengirim
  const confirmed = confirm(`Apakah Anda yakin ingin mengirim tiket ini ke:\n\n${namaUnit}\n\nDengan urgensi yang dipilih?`)
  if (!confirmed) return

  pilihan.value = 'KirimUnit'
  await handleSelesai()
}

// Computed property untuk tombol disabled
const isFormValid = computed(() => {
  const hasUnit = idUnitTerpilih.value && idUnitTerpilih.value !== '' && idUnitTerpilih.value !== null
  const hasUrgensi = idUrgensiTerpilih.value && idUrgensiTerpilih.value !== '' && idUrgensiTerpilih.value !== null
  console.log('isFormValid:', hasUnit, hasUrgensi)
  return hasUnit && hasUrgensi
})

const handleSelesai = async () => {
  try {
    const token = localStorage.getItem('Token')
    const url = `/api/pelayanan/disposisi/${pelayananId.value}`

    if (pilihan.value === 'KirimUnit') {
      await axios.put(url, {
        ID_Unit: idUnitTerpilih.value,
        ID_Status: 2, // Status menjadi "Sedang Diproses"
        Pesan_Pengelola: pesan.value,
        ID_Urgensi: idUrgensiTerpilih.value
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })
    } else if (pilihan.value === 'TolakDiproses') {
      await axios.put(url, {
        ID_Status: 3,
        Pesan_Pengelola: pesan.value,
        ID_Unit: null
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })
    } else if (pilihan.value === 'TolakBaru') {
      await axios.put(url, {
        ID_Status: 3,
        Pesan_Pengelola: pesan.value
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })
    } else if (pilihan.value === 'Redisposisi') {
      await axios.put(url, {
        ID_Unit: idUnitTerpilih.value,
        ID_Status: status.value, // Keep current status
        Pesan_Pengelola: pesan.value,
        ID_Urgensi: idUrgensiTerpilih.value
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })
    }
    // ✅ Update langkah ke-3 menjadi selesai (Is_Done = 1)
    const idProgressLangkah3 = stepsID.value[2] // pastikan ini terisi
    if (idProgressLangkah3) {
      const progressUrl = `/api/progress-alur/update-status/${idProgressLangkah3}`

      await axios.put(progressUrl, {
        Is_Done: 1
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })

    } else {
      console.warn('ID Progress langkah ke-3 tidak tersedia.')
    }

    router.push('/pelayanan')
  } catch (err) {
    console.error('Gagal menyelesaikan proses:', err)
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


const rating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const reviewSubmitted = ref(false)

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
    router.push('/pelayanan')
  } catch (error) {
    console.error('Gagal mengirim ulasan:', error)
    alert('Gagal mengirim ulasan. Silakan coba lagi.')
  }
}

const isImage = (path) => {
  return /\.(jpg|jpeg|png)$/i.test(path);
};

// Computed untuk mengecek apakah user adalah superadmin
const isSuperAdmin = computed(() => {
  return userRole.value === 1 || userRole.value === 2; // 1 = Superadmin, 2 = Admin/Pengelola
})

// Computed untuk mengecek apakah bisa melakukan redisposisi
const canRedisposisi = computed(() => {
  return isSuperAdmin.value && (status.value === 2 || status.value === 4); // Bisa redisposisi jika status Diproses atau Revisi
})

// Computed untuk mengecek apakah bisa melakukan tolak saat diproses
const canTolakDiproses = computed(() => {
  return isSuperAdmin.value && status.value === 2; // Bisa menolak jika status Diproses
})

// Computed untuk mengecek apakah bisa menolak saat status Baru
const canTolakBaru = computed(() => {
  const result = isSuperAdmin.value && status.value === 1; // Bisa menolak jika status Baru
  console.log('canTolakBaru:', result, 'isSuperAdmin:', isSuperAdmin.value, 'userRole:', userRole.value, 'status:', status.value)
  return result
})

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
              <div class="info-row"><strong>No. Tiket:</strong> <span>{{ pelayananId }}</span></div>
              <div class="info-row"><strong>Pelapor:</strong> <span>{{ nama_pelapor }}</span></div>
              <div class="info-row"><strong>No Telepon:</strong> <span>{{ no_telp }}</span></div>
              <div class="info-row"><strong>Layanan:</strong> <span>{{ sub_jenis_pelayanan }}</span></div>
              <div class="info-row"><strong>Tipe Layanan:</strong> <span>{{ jenis_pelayanan }}</span></div>
              <div class="info-row"><strong>Perangkat Daerah:</strong> <span>{{ organisasi }}</span></div>
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
              <!-- Review Section -->
              <div v-if="status === 6" class="review-section">
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
                
              <div v-else-if="status === 5 && userId != id_user" class="review-section">
                <div>
                  <h4 class="review-title">Ulasan Pengguna</h4>
                  <div class="star-rating">
                    <strong style="font-weight: 500;">Belum Ada Ulasan dari Pengguna</strong>
                  </div>
                  <textarea v-model="reviewText" class="review-textarea" placeholder="Belum Ada Ulasan" rows="4" readonly></textarea>
                </div>
              </div>
              <div v-if="status === 5 && userId == id_user" class="review-section">
                <h4 class="review-title">Ulasan Pengguna</h4>
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
            </div>

            <div class="chat-card">
              <h3>Chat</h3>
              <div class="chat-content view-only-chat">
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
              <div class="alasan-tolak" v-if="status === 3">
                <strong>Alasan Penolakan</strong>
                <div class="textarea-row">
                  <textarea class="input" :value="pesan" placeholder="Alasan Penolakan" rows="5" readonly></textarea>
                </div>
              </div>
              <div v-if="progress" class="teks-tambahan">
                <h4 class="judul-input-tambahan">Urgensi</h4>
                <div>{{ nama_urgensi }}</div>
                <h4 class="judul-input-tambahan">Nama Unit Pelaksana</h4>
                <div>{{ nama_depanUnit + ' ' + nama_belakangUnit }}</div>
                <h4 class="judul-input-tambahan">Nama Pelaksana Teknis</h4>
                <div>{{ nama_depanTeknis + ' ' + nama_belakangTeknis }}</div>
              </div>
              <div class="tinjau-card" v-if="status === 1">
                <h3>Pilih Unit Pelaksana</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">Pilih unit pelaksana untuk menangani permintaan ini</p>

                <div class="wrapper-setuju">
                  <h4 class="judul-input-tambahan">Urgensi</h4>
                  <select id="urgensi" v-model="idUrgensiTerpilih">
                    <option value="" disabled>Pilih Urgensi</option>
                    <option
                      v-for="option in urgensi"
                      :key="option.id_urgensi"
                      :value="option.id_urgensi"
                    >
                      {{ option.nama_urgensi }}
                    </option>
                  </select>

                  <h4 class="judul-input-tambahan">Unit Pelaksana</h4>
                  <select id="unit" v-model="idUnitTerpilih">
                    <option value="" disabled>Pilih Unit Pelaksana</option>
                    <option
                      v-for="option in unit"
                      :key="option.id_unit"
                      :value="option.id_unit"
                    >
                      {{ option.nama_depan }} {{ option.nama_belakang }}
                    </option>
                  </select>

                  <h4 class="judul-input-tambahan">Pesan untuk Unit Pelaksana</h4>
                  <textarea class="textarea-row-tambahan" v-model="pesan" placeholder="Masukkan pesan atau instruksi"></textarea>

                  <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn-selesai-detail" @click="handleKirimKeUnit" :disabled="!isFormValid" style="flex: 1;">
                      {{ isFormValid ? 'Kirim ke Unit Pelaksana' : 'Pilih Unit dan Urgensi Terlebih Dahulu' }}
                    </button>
                    <button v-if="canTolakBaru" class="btn-tolak-baru" @click="handlePilihan('TolakBaru')" style="flex: 1;">
                      Tolak Permintaan
                    </button>
                    <!-- Debug: Tampilkan info jika tombol tidak muncul -->
                    <small v-if="!canTolakBaru" style="color: #999; font-size: 0.75rem;">
                      (Role: {{ userRole }}, Status: {{ status }}, SuperAdmin: {{ isSuperAdmin }})
                    </small>
                  </div>

                  <!-- Form Tolak saat Baru -->
                  <div class="wrapper-tolak" v-if='pilihan == "TolakBaru"'>
                    <h4 class="judul-input-tambahan">Alasan Ditolak</h4>
                    <textarea class="textarea-row-tambahan" v-model="pesan" placeholder="Masukkan alasan penolakan"></textarea>
                    <p style="color: #d32f2f; font-size: 0.85rem; margin-top: 0.5rem;">
                      ⚠️ Tiket akan ditolak dan status akan berubah menjadi "Ditolak"
                    </p>
                    <button class="btn-selesai-detail" @click="handleSelesai">Konfirmasi Penolakan</button>
                  </div>

                  <!-- Debug info (bisa dihapus setelah fix) -->
                </div>
                
              </div>
              <div class="tinjau-card" v-if="canRedisposisi || canTolakDiproses">
                <h3>Kelola Pelayanan</h3>
                <div style="background-color: #fff3cd; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #ffc107;">
                  <p style="color: #856404; font-size: 0.85rem; margin: 0;">
                    <strong>Unit Saat Ini:</strong> {{ nama_depanUnit }} {{ nama_belakangUnit }}<br>
                    <strong>Urgensi Saat Ini:</strong> {{ nama_urgensi }}
                  </p>
                </div>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">Ubah Unit Pelaksana dan/atau Urgensi, atau Tolak permintaan</p>
                <div class="wrapper-btn">
                  <button v-if="canRedisposisi" class="btn-redisposisi" @click="handlePilihan('Redisposisi')">Redisposisi</button>
                  <button v-if="canTolakDiproses" class="btn-tolak" @click="handlePilihan('TolakDiproses')">Tolak</button>
                </div>
                <!-- Form Redisposisi -->
                <div class='wrapper-setuju' v-if='pilihan == "Redisposisi"'>
                  <h4 class="judul-input-tambahan">Urgensi</h4>
                  <select id="urgensi" v-model="idUrgensiTerpilih">
                    <option value="" disabled>Pilih Urgensi</option>
                    <option
                      v-for="option in urgensi"
                      :key="option.id_urgensi"
                      :value="option.id_urgensi"
                    >
                      {{ option.nama_urgensi }}
                    </option>
                  </select>
                  <h4 class="judul-input-tambahan">Unit Pelaksana</h4>
                  <select id="status" v-model="idUnitTerpilih">
                    <option value="" disabled>Pilih Unit Pelaksana Baru</option>
                    <option v-for="option in unit" :key="option.id_user" :value="option.id_user">
                      {{ option.nama_depan }} {{ option.nama_belakang }}
                    </option>
                  </select>
                  <h4 class="judul-input-tambahan">Pesan untuk Unit Pelaksana Baru</h4>
                  <textarea class="textarea-row-tambahan" v-model="pesan" placeholder="Masukkan pesan"></textarea>
                  <button class="btn-selesai-detail" @click="handleSelesai">Konfirmasi Redisposisi</button>
                </div>
                <!-- Form Tolak saat Diproses -->
                <div class="wrapper-tolak" v-if='pilihan == "TolakDiproses"'>
                  <h4 class="judul-input-tambahan">Alasan Ditolak</h4>
                  <textarea class="textarea-row-tambahan" v-model="pesan" placeholder="Masukkan alasan penolakan"></textarea>
                  <p style="color: #d32f2f; font-size: 0.85rem; margin-top: 0.5rem;">
                    ⚠️ Tiket akan ditolak dan status akan berubah menjadi "Ditolak"
                  </p>
                  <button class="btn-selesai-detail" @click="handleSelesai">Konfirmasi Penolakan</button>
                </div>
              </div>

              
                
              </div>
              


              <!-- Redisposisi untuk Superadmin -->
  
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
      </div> 
      </div>
    </div>
  </div>

       

    <!-- Error State -->
    <!-- <div v-else class="error-container">
  <p>Gagal memuat data. Silakan coba lagi.</p>
</div> -->
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

.view-only-chat {
  min-height: 300px;
  max-height: 400px;
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

.message {
  width: 100%;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 0.5rem;
  resize: vertical;
  margin-bottom: 1rem;
  background-color: white;
  color: black;
}

.send-btn {
  background: #006920;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 1rem;
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

.tinjau-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.wrapper-btn{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  color: black;
  background-color: white;
}

.btn-tolak{
  color: white;
  background-color: #D51518;
  border-radius: 15px;
  padding: 0.5rem 2.5rem;
  border: none;
  cursor: pointer;
}

.btn-tolak-baru {
  color: white;
  background-color: #D51518;
  border-radius: 15px;
  padding: 0.5rem 2.5rem;
  border: none;
  font-family: 'Poppins';
  font-weight: 500;
  cursor: pointer;
}

.btn-tolak-baru:hover {
  background-color: #b01215;
}
.btn-tolak:hover{
  background-color: #E53935;
}

.btn-redisposisi{
  color: white;
  background-color: #FF9800;
  border-radius: 15px;
  padding: 0.5rem 2.5rem;
  border: none;
  font-family: 'Poppins';
  font-weight: 500;
  cursor: pointer;
}
.btn-redisposisi:hover{
  background-color: #FFB74D;
}

.wrapper-setuju{
  display: flex;
  flex-direction: column;
}

.wrapper-tolak{
  display: flex;
  flex-direction: column;
}

.textarea-row-tambahan {
  width: 97%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: vertical;
  font-family: poppins, sans-serif;
  background-color: #e6e6e6;
}

.btn-selesai-detail {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.btn-selesai-detail:hover:not(:disabled) {
  background-color: #1976d2;
}

.btn-selesai-detail:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.judul-input-tambahan {
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.review-section {
  border-top: 1px solid #eee;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 0.2rem;
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
  background-color: #e6e6e6;
  color: black;
  font-family: poppins, sans-serif;
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

.label-red {
  font-weight: 600;
  color: #D32F2F;
}
</style>