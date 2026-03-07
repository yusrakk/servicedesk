<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()

const userId       = ref(localStorage.getItem('user_id'))
const pelayananId  = ref(route.query.layanan || '-')
const activeTab    = ref('informasi')
const isLoading    = ref(true)
const isDataLoaded = ref(false)
const dataCache    = ref(null)

// Data fields
const steps              = ref([])
const stepsStatus        = ref([])
const status             = ref(Number(''))
const perihal            = ref('')
const tanggal            = ref('')
const nama_pelapor       = ref('')
const no_telp            = ref('')
const nama_depanTeknis   = ref('')
const nama_belakangTeknis = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan    = ref('')
const deskripsi          = ref('')
const surat_dinas        = ref('')
const lampiran           = ref('')
const organisasi         = ref('')
const SuratDinas_Path    = ref(null)
const Lampiran_Path      = ref(null)
const HasilPemenuhan_Path = ref(null)
const BA_Path            = ref(null)
const messages           = ref([])

// Review
const rating         = ref(0)
const hoverRating    = ref(0)
const reviewText     = ref('')
const reviewSubmitted = ref(false)

// Chat
const dokumen    = ref(null)
const newMessage = ref('')
const fileInput  = ref(null)

const namaFileSuratDinas = computed(() => {
  if (!surat_dinas.value) return ''
  const p = surat_dinas.value.split('/').pop().split('_')
  return `${p[0]}_${p[1]}_Surat_Dinas.pdf`
})
const namaFileLampiran = computed(() => {
  if (!lampiran.value) return ''
  const p = lampiran.value.split('/').pop().split('_')
  return `${p[0]}_${p[1]}_Lampiran.pdf`
})
const namaFileHasilPemenuhan = computed(() => {
  if (!HasilPemenuhan_Path.value) return '-'
  const p = HasilPemenuhan_Path.value.split('/').pop().split('_')
  return `${p[0]}_${p[1]}_Hasil_Pemenuhan.pdf`
})
const namaFileBA = computed(() => {
  if (!BA_Path.value) return '-'
  const p = BA_Path.value.split('/').pop().split('_')
  return `${p[0]}_${p[1]}_Berita_Acara.pdf`
})

const isImage = (path) => /\.(jpg|jpeg|png)$/i.test(path)

const fetchPelayananData = async () => {
  if (dataCache.value?.id === pelayananId.value) {
    const c = dataCache.value
    deskripsi.value = c.deskripsi; organisasi.value = c.organisasi
    surat_dinas.value = c.surat_dinas; lampiran.value = c.lampiran
    sub_jenis_pelayanan.value = c.sub_jenis_pelayanan; jenis_pelayanan.value = c.jenis_pelayanan
    nama_pelapor.value = c.nama_pelapor; no_telp.value = c.no_telp
    nama_depanTeknis.value = c.nama_depanTeknis; nama_belakangTeknis.value = c.nama_belakangTeknis
    perihal.value = c.perihal; tanggal.value = c.tanggal; status.value = c.status
    rating.value = c.rating; reviewText.value = c.reviewText; reviewSubmitted.value = c.reviewSubmitted
    steps.value = c.steps; stepsStatus.value = c.stepsStatus
    HasilPemenuhan_Path.value = c.HasilPemenuhan_Path; BA_Path.value = c.BA_Path
    isDataLoaded.value = true; isLoading.value = false; return
  }
  try {
    isLoading.value = true
    const token = localStorage.getItem('Token')
    const [pelRes, progRes] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`,              { headers: { Authorization: 'Bearer ' + token } }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, { headers: { Authorization: 'Bearer ' + token } })
    ])
    const d = pelRes.data
    deskripsi.value          = d.Deskripsi
    organisasi.value         = d.user.user_organisasi.Nama_OPD
    surat_dinas.value        = d.Surat_Dinas_Path
    lampiran.value           = d.Lampiran_Path
    sub_jenis_pelayanan.value = d.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value    = d.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value       = [d.user.Nama_Depan, d.user.Nama_Belakang].filter(Boolean).join(' ')
    no_telp.value            = d.No_Telp || '-'
    nama_depanTeknis.value   = d.teknis_pelayanan?.Nama_Depan   || 'Belum'
    nama_belakangTeknis.value = d.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value            = d.Perihal
    tanggal.value            = d.created_at
    status.value             = d.ID_Status
    HasilPemenuhan_Path.value = d.Hasil_Pemenuhan_Path
    BA_Path.value            = d.BA_Path

    if (d.Rating) { rating.value = d.Rating; reviewText.value = d.Isi_Survey || ''; reviewSubmitted.value = true }
    else          { rating.value = 0; reviewText.value = ''; reviewSubmitted.value = false }

    messages.value = d.pelayanan_pesan.map(p => ({
      id_user:      p.ID_User,
      text:         p.Pesan,
      sender:       `${p.pesan_user.Nama_Depan} ${p.pesan_user.Nama_Belakang} - ${p.pesan_user.user_role.Nama_Role}`,
      time:         new Date(p.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dokumen_path: p.Dokumen_Path
    }))

    steps.value       = progRes.data.slice(0, 5).map(i => i.progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui')
    stepsStatus.value = progRes.data.slice(0, 5).map(i => i.Is_Done)

    dataCache.value = {
      id: pelayananId.value, deskripsi: deskripsi.value, organisasi: organisasi.value,
      surat_dinas: surat_dinas.value, lampiran: lampiran.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value, jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value, no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value, nama_belakangTeknis: nama_belakangTeknis.value,
      perihal: perihal.value, tanggal: tanggal.value, status: status.value,
      rating: rating.value, reviewText: reviewText.value, reviewSubmitted: reviewSubmitted.value,
      steps: steps.value, stepsStatus: stepsStatus.value,
      HasilPemenuhan_Path: HasilPemenuhan_Path.value, BA_Path: BA_Path.value
    }

    SuratDinas_Path.value    = '/files/' + surat_dinas.value
    Lampiran_Path.value      = '/files/' + lampiran.value
    if (HasilPemenuhan_Path.value) HasilPemenuhan_Path.value = '/files/' + HasilPemenuhan_Path.value
    if (BA_Path.value)            BA_Path.value             = '/files/' + BA_Path.value

    isDataLoaded.value = true
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const getStepClass = (index) => {
  if (status.value === 3) return 'step--rejected'
  if (!stepsStatus.value || !Array.isArray(stepsStatus.value)) return 'step--inactive'
  return stepsStatus.value[index] === 1 ? 'step--done' : 'step--inactive'
}
const getLabelClass = (index) => {
  if (status.value === 3) return 'label--rejected'
  return stepsStatus.value[index] === 1 ? 'label--done' : ''
}

const setRating = (r) => { rating.value = r }
const submitReview = async () => {
  if (rating.value === 0) { alert('Mohon berikan rating bintang terlebih dahulu.'); return }
  try {
    const token = localStorage.getItem('Token')
    await axios.put(`/api/pelayanan/survey/${pelayananId.value}`,
      { Rating: rating.value, Isi_Survey: reviewText.value, ID_Status: 6 },
      { headers: { Authorization: 'Bearer ' + token } }
    )
    reviewSubmitted.value = true; status.value = 6
  } catch (e) {
    console.error(e); alert('Gagal mengirim ulasan.')
  }
}

const handleFileUpload = (e) => { dokumen.value = e.target.files[0] }
const addMessage = async () => {
  if (!newMessage.value && !dokumen.value) return
  const formData = new FormData()
  formData.append('ID_User', userId.value)
  formData.append('Pesan', newMessage.value)
  if (dokumen.value) formData.append('Dokumen_Path', dokumen.value)
  try {
    const res = await axios.post(`/api/pesan/${pelayananId.value}`, formData, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('Token'), 'Content-Type': 'multipart/form-data' }
    })
    messages.value.push({
      id_user:      userId.value,
      text:         newMessage.value,
      dokumen_path: res.data.dokumen,
      sender:       `${localStorage.getItem('nama_depan')} ${localStorage.getItem('nama_belakang')} - ${localStorage.getItem('nama_role')}`,
      time:         new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    newMessage.value = ''; dokumen.value = null
  } catch (e) { console.error(e) }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

watch(() => pelayananId.value, (v) => { if (v && v !== '-') fetchPelayananData() })
onMounted(() => {
  if (pelayananId.value && pelayananId.value !== '-') fetchPelayananData()
  const handlePop = () => router.push({ name: 'PermintaanDiproses' })
  window.addEventListener('popstate', handlePop)
  return () => window.removeEventListener('popstate', handlePop)
})
</script>

<template>
  <div class="detail-permintaan">

    <!-- Loading -->
    <div v-if="isLoading" class="state-full">
      <div class="spinner"></div>
      <p>Memuat data permintaan...</p>
    </div>

    <!-- Error -->
    <div v-else-if="!isDataLoaded" class="state-full state-error">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M20 13v9M20 25v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>Gagal memuat data. Silakan coba lagi.</p>
      <button class="retry-btn" @click="fetchPelayananData">Coba Lagi</button>
    </div>

    <!-- Content -->
    <div v-else>

      <!-- Page Header -->
      <div class="page-header">
        <button class="back-btn" @click="router.push({ name: 'PermintaanDiproses' })">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Kembali
        </button>
        <div class="page-header__info">
          <span class="ticket-badge">#{{ pelayananId }}</span>
          <h1 class="page-header__title">{{ perihal }}</h1>
          <p class="page-header__sub">{{ sub_jenis_pelayanan }}</p>
        </div>
        <button v-if="status === 6" class="print-btn" @click="window.print()">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="5" width="11" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M4 5V3a1 1 0 011-1h5a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.3"/>
            <path d="M4 11v1a1 1 0 001 1h5a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.3"/>
            <circle cx="11" cy="8" r=".75" fill="currentColor"/>
          </svg>
          Cetak
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in [{ id: 'informasi', label: 'Informasi' }, { id: 'tracking', label: 'Lacak Progres' }]"
          :key="tab.id"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.id }"
          @click="handleTabChange(tab.id)"
        >
          <svg v-if="tab.id === 'informasi'" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/>
            <path d="M4 7h6M4 5h6M4 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M7 4v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ tab.label }}
        </button>
      </div>

      <!-- TAB: INFORMASI -->
      <div v-if="activeTab === 'informasi'" class="tab-content">
        <div class="info-grid">

          <!-- Kiri: Detail -->
          <div class="info-left">
            <div class="card">
              <div class="card__header">
                <h3 class="card__title">Informasi Umum</h3>
              </div>
              <div class="card__body">
                <div class="info-list">
                  <div class="info-item"><span class="info-item__key">No. Tiket</span><span class="info-item__val mono">#{{ pelayananId }}</span></div>
                  <div class="info-item"><span class="info-item__key">Pelapor</span><span class="info-item__val">{{ nama_pelapor }}</span></div>
                  <div class="info-item"><span class="info-item__key">No. Telepon</span><span class="info-item__val">{{ no_telp }}</span></div>
                  <div class="info-item"><span class="info-item__key">Layanan</span><span class="info-item__val">{{ sub_jenis_pelayanan }}</span></div>
                  <div class="info-item"><span class="info-item__key">Tipe</span><span class="info-item__val">{{ jenis_pelayanan }}</span></div>
                  <div class="info-item"><span class="info-item__key">Perangkat Daerah</span><span class="info-item__val">{{ organisasi }}</span></div>
                  <div class="info-item"><span class="info-item__key">Tanggal</span><span class="info-item__val">{{ new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }}</span></div>
                  <div class="info-item"><span class="info-item__key">Pelaksana Teknis</span><span class="info-item__val">{{ nama_depanTeknis }} {{ nama_belakangTeknis }}</span></div>
                </div>
                <!-- Deskripsi -->
                <div class="desc-block">
                  <p class="desc-label">Deskripsi</p>
                  <div class="desc-box">{{ deskripsi }}</div>
                </div>
                <!-- Dokumen -->
                <div class="doc-block">
                  <p class="desc-label">Dokumen</p>
                  <a v-if="surat_dinas" :href="SuratDinas_Path" target="_blank" class="doc-link">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    {{ namaFileSuratDinas }}
                  </a>
                  <a v-if="lampiran" :href="Lampiran_Path" target="_blank" class="doc-link">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5V4a4 4 0 018 0v5a2.5 2.5 0 01-5 0V4.5a1 1 0 012 0V8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    {{ namaFileLampiran }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Review (status 5/6) -->
            <div v-if="status === 5 || status === 6" class="card mt">
              <div class="card__header">
                <h3 class="card__title">{{ reviewSubmitted ? 'Ulasan Anda' : 'Beri Ulasan' }}</h3>
              </div>
              <div class="card__body">
                <div v-if="!reviewSubmitted">
                  <p class="desc-label mb">Rating</p>
                  <div class="stars">
                    <span
                      v-for="s in 5" :key="s"
                      class="star" :class="{ 'star--filled': s <= (hoverRating || rating) }"
                      @mouseover="hoverRating = s" @mouseleave="hoverRating = 0" @click="setRating(s)"
                    >★</span>
                  </div>
                  <textarea v-model="reviewText" class="review-textarea" rows="3" placeholder="Bagikan pengalaman Anda..."></textarea>
                  <button class="submit-review-btn" @click="submitReview">Kirim Ulasan</button>
                </div>
                <div v-else class="review-done">
                  <div class="stars">
                    <span v-for="s in 5" :key="s" class="star" :class="{ 'star--filled': s <= rating }">★</span>
                  </div>
                  <p v-if="reviewText" class="review-text">{{ reviewText }}</p>
                  <p class="review-thanks">Terima kasih atas ulasan Anda!</p>
                </div>
              </div>
            </div>

            <!-- Hasil Pemenuhan (status 5/6) -->
            <div v-if="status === 5 || status === 6" class="card mt">
              <div class="card__header">
                <h3 class="card__title">Hasil Pemenuhan</h3>
              </div>
              <div class="card__body">
                <div class="hasil-item">
                  <p class="desc-label">Hasil Pemenuhan</p>
                  <a v-if="HasilPemenuhan_Path && HasilPemenuhan_Path !== '-'" :href="HasilPemenuhan_Path" target="_blank" class="doc-link">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    {{ namaFileHasilPemenuhan }}
                  </a>
                  <p v-else class="not-uploaded">Belum diunggah oleh pelaksana teknis</p>
                </div>
                <div class="hasil-item">
                  <p class="desc-label">Berita Acara (BA)</p>
                  <a v-if="BA_Path && BA_Path !== '-'" :href="BA_Path" target="_blank" class="doc-link">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    {{ namaFileBA }}
                  </a>
                  <p v-else class="not-uploaded">Belum diunggah oleh pelaksana teknis</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Kanan: Chat -->
          <div class="info-right">
            <div class="card chat-card">
              <div class="card__header">
                <h3 class="card__title">Chat</h3>
                <span class="chat-badge">{{ messages.length }}</span>
              </div>
              <div class="chat-messages">
                <div v-if="messages.length === 0" class="chat-empty">Belum ada pesan</div>
                <div
                  v-for="(msg, i) in messages" :key="i"
                  class="msg" :class="msg.id_user == userId ? 'msg--sent' : 'msg--recv'"
                >
                  <div class="msg__bubble">
                    <p class="msg__sender">{{ msg.sender }}</p>
                    <p class="msg__text">{{ msg.text }}</p>
                    <template v-if="msg.dokumen_path">
                      <img v-if="isImage(msg.dokumen_path)" :src="'/files/' + msg.dokumen_path" class="msg__img"/>
                      <a v-else :href="'/files/' + msg.dokumen_path" target="_blank" class="msg__doc-link">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6.5V4a3 3 0 016 0v3.5a1.5 1.5 0 01-3 0V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                        Lihat Dokumen
                      </a>
                    </template>
                    <span class="msg__time">{{ msg.time }}</span>
                  </div>
                </div>
              </div>
              <div class="chat-input">
                <div v-if="dokumen" class="file-chip">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/></svg>
                  {{ dokumen.name }}
                  <span @click="dokumen = null" class="file-chip__remove">×</span>
                </div>
                <div class="chat-input__row">
                  <label for="file-upload" class="attach-btn" title="Lampirkan file">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M3 7.5V4a4 4 0 018 0v5a2.5 2.5 0 01-5 0V4.5a1 1 0 012 0V8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                  </label>
                  <input type="file" id="file-upload" ref="fileInput" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display:none"/>
                  <textarea v-model="newMessage" class="chat-textarea" placeholder="Tulis pesan..." rows="1"></textarea>
                  <button class="send-btn" @click="addMessage" :disabled="!newMessage && !dokumen">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 7.5h11M9 3.5l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: TRACKING -->
      <div v-else-if="activeTab === 'tracking'" class="tab-content">
        <div class="card tracking-card">
          <div class="card__header">
            <h3 class="card__title">Lacak Progres</h3>
            <span class="ticket-badge">#{{ pelayananId }}</span>
          </div>
          <div class="card__body">
            <div v-if="status === 3" class="rejected-banner">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <div>
                <strong>Permintaan Ditolak</strong>
                <p>Permintaan pelayanan ini telah ditolak oleh Pengelola.</p>
              </div>
            </div>
            <div class="steps">
              <div v-for="(step, i) in steps" :key="i" class="step-item">
                <div class="step-connector" v-if="i > 0" :class="stepsStatus[i-1] === 1 && status !== 3 ? 'step-connector--done' : ''"></div>
                <div class="step-circle" :class="getStepClass(i)">
                  <svg v-if="stepsStatus[i] === 1 && status !== 3" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else-if="status === 3" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 4l6 6M10 4l-6 6" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                  <span v-else class="step-num">{{ i + 1 }}</span>
                </div>
                <div class="step-label" :class="getLabelClass(i)">{{ step }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.detail-permintaan {
  --color-forest:  #1a3a2a; --color-emerald: #0f5c38; --color-mint: #2eb86a;
  --color-foam:    #e8f4ee; --color-ink:     #0d1a12; --color-stone: #5a7566;
  --color-silver:  #b8ccc2; --color-mist:    #f0f6f2; --color-white: #ffffff;
  --font:          'Plus Jakarta Sans', sans-serif;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-sm:     0 1px 3px rgba(13,26,18,.06);
  --shadow-md:     0 4px 16px rgba(13,26,18,.08);
  --shadow-green:  0 4px 16px rgba(46,184,106,.28);
  font-family: var(--font); min-height: 100vh; background: var(--color-mist);
}

/* STATES */
.state-full { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: .75rem; color: var(--color-silver); font-size: .875rem; }
.state-error { color: #ef4444; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-foam); border-top-color: var(--color-mint); border-radius: 50%; animation: spin .65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn { padding: .5rem 1.25rem; background: var(--color-foam); border: 1.5px solid rgba(46,184,106,.2); border-radius: 8px; font-family: var(--font); font-size: .8125rem; font-weight: 600; color: var(--color-emerald); cursor: pointer; }

/* PAGE HEADER */
.page-header {
  background: linear-gradient(135deg, var(--color-forest), var(--color-emerald));
  padding: 1.5rem 2rem 2rem; display: flex; align-items: flex-start; gap: 1rem;
  position: relative; overflow: hidden;
}
.page-header::after { content: ''; position: absolute; width: 250px; height: 250px; background: var(--color-mint); border-radius: 50%; filter: blur(80px); opacity: .1; top: -80px; right: -40px; pointer-events: none; }
.back-btn { display: flex; align-items: center; gap: .375rem; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: .4rem .75rem; color: rgba(255,255,255,.8); font-family: var(--font); font-size: .75rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s; flex-shrink: 0; }
.back-btn:hover { background: rgba(255,255,255,.18); color: white; }
.page-header__info { flex: 1; z-index: 1; }
.ticket-badge { display: inline-block; font-size: .7rem; font-weight: 700; color: var(--color-mint); background: rgba(46,184,106,.15); border: 1px solid rgba(46,184,106,.3); padding: .2rem .6rem; border-radius: 99px; letter-spacing: .04em; margin-bottom: .5rem; }
.page-header__title { font-size: clamp(1.125rem, 3vw, 1.625rem); font-weight: 800; color: white; letter-spacing: -.02em; margin-bottom: .25rem; }
.page-header__sub   { font-size: .8125rem; color: rgba(255,255,255,.6); }
.print-btn { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; padding: .5rem 1rem; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 8px; color: white; font-family: var(--font); font-size: .75rem; font-weight: 600; cursor: pointer; transition: background .15s; z-index: 1; }
.print-btn:hover { background: rgba(255,255,255,.2); }

/* TABS */
.tabs { display: flex; gap: 4px; padding: 1rem 2rem 0; background: linear-gradient(135deg, var(--color-forest), var(--color-emerald)); }
.tab-btn { display: flex; align-items: center; gap: .375rem; padding: .625rem 1.125rem; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1); border-bottom: none; border-radius: 10px 10px 0 0; font-family: var(--font); font-size: .8125rem; font-weight: 600; color: rgba(255,255,255,.6); cursor: pointer; transition: all .15s; }
.tab-btn:hover { background: rgba(255,255,255,.14); color: white; }
.tab-btn--active { background: var(--color-mist); color: var(--color-emerald); border-color: transparent; }

/* TAB CONTENT */
.tab-content { padding: 1.5rem; max-width: 1200px; margin: 0 auto; animation: fadeUp .25s var(--ease-out); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* INFO GRID */
.info-grid { display: grid; grid-template-columns: 1fr 400px; gap: 1.25rem; align-items: flex-start; }
.info-left  { display: flex; flex-direction: column; gap: 1.25rem; }
.info-right { position: sticky; top: 1rem; }
.mt { margin-top: 0; }

/* CARD */
.card { background: var(--color-white); border-radius: 16px; border: 1px solid rgba(168,200,180,.2); box-shadow: var(--shadow-sm); overflow: hidden; }
.card__header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-foam); }
.card__title  { font-size: .9375rem; font-weight: 800; color: var(--color-ink); letter-spacing: -.01em; }
.card__body   { padding: 1.25rem; }

/* INFO LIST */
.info-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 1rem; }
.info-item { display: flex; align-items: baseline; gap: .75rem; padding: .625rem 0; border-bottom: 1px solid rgba(168,200,180,.12); }
.info-item:last-child { border-bottom: none; }
.info-item__key { font-size: .75rem; font-weight: 700; color: var(--color-stone); min-width: 140px; flex-shrink: 0; text-transform: uppercase; letter-spacing: .04em; }
.info-item__val { font-size: .875rem; color: var(--color-ink); font-weight: 500; }
.mono { font-family: monospace; color: var(--color-emerald); font-weight: 700; }

/* DESKRIPSI & DOKUMEN */
.desc-block, .doc-block { margin-top: 1rem; }
.desc-label { font-size: .7rem; font-weight: 700; color: var(--color-stone); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .5rem; }
.desc-label.mb { margin-bottom: .5rem; }
.desc-box { background: var(--color-mist); border-radius: 10px; padding: .875rem; font-size: .875rem; color: var(--color-ink); line-height: 1.6; white-space: pre-wrap; }
.doc-link { display: inline-flex; align-items: center; gap: .5rem; padding: .5rem .875rem; background: var(--color-foam); border: 1px solid rgba(46,184,106,.2); border-radius: 8px; font-size: .8rem; font-weight: 600; color: var(--color-emerald); text-decoration: none; margin-bottom: .5rem; transition: all .15s; }
.doc-link:hover { background: var(--color-mint); color: white; border-color: var(--color-mint); }

/* REVIEW */
.stars { display: flex; gap: .25rem; margin-bottom: .875rem; }
.star { font-size: 1.75rem; color: var(--color-silver); cursor: pointer; transition: color .1s, transform .1s; }
.star--filled { color: #f59e0b; }
.star:hover { transform: scale(1.1); }
.review-textarea { width: 100%; font-family: var(--font); font-size: .875rem; color: var(--color-ink); background: var(--color-mist); border: 1.5px solid transparent; border-radius: 10px; padding: .625rem .875rem; resize: vertical; outline: none; transition: border-color .15s; box-sizing: border-box; }
.review-textarea:focus { border-color: var(--color-mint); background: white; }
.submit-review-btn { margin-top: .875rem; padding: .55rem 1.25rem; background: linear-gradient(135deg, var(--color-mint), var(--color-emerald)); border: none; border-radius: 9px; font-family: var(--font); font-size: .8125rem; font-weight: 700; color: white; cursor: pointer; box-shadow: var(--shadow-green); transition: opacity .15s; }
.submit-review-btn:hover { opacity: .9; }
.review-done { text-align: center; }
.review-text   { font-size: .875rem; color: var(--color-ink); margin-top: .5rem; }
.review-thanks { font-size: .8rem; color: var(--color-stone); margin-top: .5rem; }

/* HASIL */
.hasil-item { margin-bottom: 1rem; }
.not-uploaded { font-size: .8rem; color: var(--color-silver); font-style: italic; }

/* CHAT */
.chat-card { display: flex; flex-direction: column; height: 520px; }
.chat-card .card__body { display: none; }
.chat-badge { background: var(--color-foam); color: var(--color-emerald); font-size: .7rem; font-weight: 700; padding: .15rem .5rem; border-radius: 99px; }
.chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: .625rem; background: var(--color-mist); }
.chat-empty { text-align: center; font-size: .8125rem; color: var(--color-silver); padding: 2rem; }
.msg { display: flex; }
.msg--sent { justify-content: flex-end; }
.msg--recv { justify-content: flex-start; }
.msg__bubble { max-width: 78%; padding: .625rem .875rem; border-radius: 12px; font-size: .8125rem; }
.msg--recv .msg__bubble { background: var(--color-white); border: 1px solid rgba(168,200,180,.2); color: var(--color-ink); }
.msg--sent .msg__bubble { background: linear-gradient(135deg, var(--color-mint), var(--color-emerald)); color: white; }
.msg__sender { font-size: .7rem; font-weight: 700; opacity: .7; margin-bottom: .2rem; }
.msg__text   { margin: 0; line-height: 1.5; word-break: break-word; }
.msg__time   { font-size: .65rem; opacity: .6; margin-top: .3rem; text-align: right; }
.msg__img    { max-width: 160px; border-radius: 8px; margin-top: .4rem; }
.msg__doc-link { display: inline-flex; align-items: center; gap: .3rem; font-size: .75rem; opacity: .85; text-decoration: underline; color: inherit; margin-top: .3rem; }

.chat-input { padding: .875rem; border-top: 1px solid var(--color-foam); background: var(--color-white); }
.file-chip { display: inline-flex; align-items: center; gap: .375rem; background: var(--color-foam); border-radius: 99px; padding: .2rem .625rem; font-size: .7rem; color: var(--color-emerald); margin-bottom: .5rem; }
.file-chip__remove { cursor: pointer; font-size: 1rem; line-height: 1; opacity: .7; }
.chat-input__row { display: flex; gap: .5rem; align-items: flex-end; }
.attach-btn { width: 36px; height: 36px; background: var(--color-mist); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-stone); flex-shrink: 0; transition: background .15s, color .15s; }
.attach-btn:hover { background: var(--color-foam); color: var(--color-emerald); }
.chat-textarea { flex: 1; font-family: var(--font); font-size: .8125rem; color: var(--color-ink); background: var(--color-mist); border: 1.5px solid transparent; border-radius: 10px; padding: .5rem .75rem; resize: none; outline: none; min-height: 36px; max-height: 100px; transition: border-color .15s; }
.chat-textarea:focus { border-color: var(--color-mint); background: white; }
.send-btn { width: 36px; height: 36px; background: var(--color-mint); border: none; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; flex-shrink: 0; transition: background .15s; }
.send-btn:hover:not(:disabled) { background: var(--color-emerald); }
.send-btn:disabled { opacity: .4; cursor: not-allowed; }

/* TRACKING */
.tracking-card { max-width: 640px; margin: 0 auto; }
.rejected-banner { display: flex; align-items: flex-start; gap: .875rem; background: #fef2f2; border: 1px solid rgba(220,38,38,.2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; color: #dc2626; }
.rejected-banner strong { display: block; font-size: .9375rem; margin-bottom: .25rem; }
.rejected-banner p { font-size: .8125rem; color: #ef4444; margin: 0; }
.steps { display: flex; flex-direction: column; }
.step-item { display: flex; align-items: flex-start; gap: 1rem; position: relative; }
.step-connector { position: absolute; left: 17px; top: -24px; width: 2px; height: 24px; background: rgba(168,200,180,.3); }
.step-connector--done { background: var(--color-mint); }
.step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: .875rem; font-weight: 700; }
.step--done     { background: linear-gradient(135deg, var(--color-mint), var(--color-emerald)); box-shadow: 0 0 0 4px rgba(46,184,106,.15); }
.step--inactive { background: var(--color-mist); border: 2px solid rgba(168,200,180,.4); color: var(--color-silver); }
.step--rejected { background: #ef4444; }
.step-num { font-size: .8rem; font-weight: 700; color: var(--color-silver); }
.step-label { flex: 1; padding: .625rem .875rem; border-radius: 10px; font-size: .875rem; color: var(--color-stone); background: var(--color-mist); margin-bottom: .625rem; border: 1px solid transparent; }
.label--done     { color: var(--color-emerald); font-weight: 700; background: var(--color-foam); border-color: rgba(46,184,106,.2); }
.label--rejected { color: #dc2626; background: #fef2f2; border-color: rgba(220,38,38,.2); }

/* RESPONSIVE */
@media (max-width: 1024px) { .info-grid { grid-template-columns: 1fr; } .info-right { position: static; } .chat-card { height: 420px; } }
@media (max-width: 640px) {
  .page-header { flex-direction: column; gap: .875rem; padding: 1.25rem 1.25rem 1.75rem; }
  .tabs { padding: .75rem 1.25rem 0; }
  .tab-content { padding: 1rem; }
}
</style>