<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()

const userId      = ref(localStorage.getItem('user_id'))
const pelayananId = ref(route.query.layanan || '-')
const activeTab   = ref('informasi')
const isLoading   = ref(true)
const isDataLoaded = ref(false)
const dataCache   = ref(null)

const status               = ref(null)
const perihal              = ref('')
const tanggal              = ref('')
const nama_pelapor         = ref('')
const no_telp              = ref('')
const nama_depanTeknis     = ref('')
const nama_belakangTeknis  = ref('')
const nama_depanUnit       = ref('')
const nama_belakangUnit    = ref('')
const sub_jenis_pelayanan  = ref('')
const jenis_pelayanan      = ref('')
const deskripsi            = ref('')
const pesanPengelola       = ref('')
const organisasi           = ref('')
const surat_dinas          = ref('')
const lampiran             = ref('')
const pesanUnit            = ref('')
const pesanRevisi          = ref('')
const pesanTeknis          = ref('')
const isDone               = ref(false)
const src_HasilPemenuhan   = ref('-')
const src_HasilBA          = ref('-')
const src_HasilSLA         = ref('-')
const steps                = ref([])
const stepsStatus          = ref([])
const stepsID              = ref([])
const messages             = ref([])
const daftarTeknis         = ref([])
const idTeknisTerpilih     = ref('')
const pilihan              = ref('')
const newMessage           = ref('')
const dokumen              = ref(null)
const chatBottom           = ref(null)

const namaFile = (path, suffix) => {
  if (!path || path === '-') return null
  try { const p = path.split('/').pop().split('_'); return `${p[0]}_${p[1]}_${suffix}.pdf` }
  catch { return `${suffix}.pdf` }
}
const SuratDinas_Path    = computed(() => surat_dinas.value ? '/files/' + surat_dinas.value : null)
const Lampiran_Path      = computed(() => lampiran.value ? '/files/' + lampiran.value : null)
const namaFileSuratDinas = computed(() => namaFile(surat_dinas.value, 'Surat_Dinas'))
const namaFileLampiran   = computed(() => namaFile(lampiran.value, 'Lampiran'))

const hasilDocs = computed(() => [
  { label: 'Hasil Pemenuhan', path: src_HasilPemenuhan.value !== '-' ? '/files/' + src_HasilPemenuhan.value : null, name: namaFile(src_HasilPemenuhan.value, 'HasilPemenuhan') },
  { label: 'Berita Acara (BA)', path: src_HasilBA.value !== '-' ? '/files/' + src_HasilBA.value : null, name: namaFile(src_HasilBA.value, 'HasilBA') },
  { label: 'SLA', path: src_HasilSLA.value !== '-' ? '/files/' + src_HasilSLA.value : null, name: namaFile(src_HasilSLA.value, 'HasilSLA') },
])

const statusText = computed(() => {
  const m = { 1:'Baru', 2:'Sedang Diproses', 3:'Ditolak', 4:'Revisi', 5:'Selesai', 6:'Selesai (Sudah Survey)' }
  return m[status.value] || 'Status Tidak Diketahui'
})
const statusStyle = computed(() => {
  const m = {
    1: { color:'#1d4ed8', bg:'#dbeafe', border:'#93c5fd' },
    2: { color:'#d97706', bg:'#fef3c7', border:'#fcd34d' },
    3: { color:'#dc2626', bg:'#fef2f2', border:'#fca5a5' },
    4: { color:'#d97706', bg:'#fff7ed', border:'#fdba74' },
    5: { color:'#059669', bg:'#ecfdf5', border:'#6ee7b7' },
    6: { color:'#0284c7', bg:'#e0f2fe', border:'#7dd3fc' },
  }
  return m[status.value] || { color:'#374151', bg:'#f3f4f6', border:'#d1d5db' }
})

const isImage = (path) => /\.(jpg|jpeg|png)$/i.test(path)
const scrollToBottom = () => nextTick(() => { if (chatBottom.value) chatBottom.value.scrollTop = chatBottom.value.scrollHeight })

const fetchPelayananData = async () => {
  if (dataCache.value?.id === pelayananId.value) {
    const c = dataCache.value
    Object.keys(c).forEach(k => {
      const refs = { deskripsi, pesanPengelola, pesanUnit, pesanRevisi, organisasi, surat_dinas, lampiran,
        src_HasilPemenuhan, src_HasilBA, src_HasilSLA, sub_jenis_pelayanan, jenis_pelayanan,
        nama_pelapor, no_telp, nama_depanTeknis, nama_belakangTeknis, nama_depanUnit, nama_belakangUnit,
        perihal, tanggal, isDone, status, steps, stepsStatus }
      if (refs[k]) refs[k].value = c[k]
    })
    isDataLoaded.value = true; isLoading.value = false; return
  }
  try {
    isLoading.value = true
    const token = localStorage.getItem('Token')
    const [pelRes, progRes] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`,               { headers: { Authorization: 'Bearer ' + token } }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, { headers: { Authorization: 'Bearer ' + token } }),
    ])
    const d = pelRes.data
    deskripsi.value = d.Deskripsi; pesanPengelola.value = d.Pesan_Pengelola
    pesanUnit.value = d.Pesan_Unit; pesanRevisi.value = d.Pesan_Revisi
    status.value = d.ID_Status; organisasi.value = d.user.user_organisasi.Nama_OPD
    surat_dinas.value = d.Surat_Dinas_Path; lampiran.value = d.Lampiran_Path
    src_HasilPemenuhan.value = d.Hasil_Pemenuhan_Path || '-'
    src_HasilBA.value = d.BA_Path || '-'; src_HasilSLA.value = d.SLA_Path || '-'
    sub_jenis_pelayanan.value = d.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = d.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value = [d.user.Nama_Depan, d.user.Nama_Belakang].filter(Boolean).join(' ')
    no_telp.value = d.No_Telp || '-'
    nama_depanTeknis.value  = d.teknis_pelayanan?.Nama_Depan  || 'Belum'
    nama_belakangTeknis.value = d.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    nama_depanUnit.value    = d.unit_pelayanan?.Nama_Depan    || 'Belum'
    nama_belakangUnit.value = d.unit_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value = d.Perihal; isDone.value = Boolean(d.Is_Done); tanggal.value = d.created_at
    messages.value = d.pelayanan_pesan.map(p => ({
      id_user: p.ID_User, text: p.Pesan,
      sender: `${p.pesan_user.Nama_Depan} ${p.pesan_user.Nama_Belakang} - ${p.pesan_user.user_role.Nama_Role}`,
      time: new Date(p.created_at || Date.now()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      dokumen_path: p.Dokumen_Path
    }))
    // Deduplicate steps
    const seen = new Set(), us = [], ust = [], usid = []
    for (const item of progRes.data) {
      const n = item.progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui'
      if (!seen.has(n)) { seen.add(n); us.push(n); ust.push(item.Is_Done); usid.push(item.ID_Progress_Alur) }
    }
    steps.value = us; stepsStatus.value = ust; stepsID.value = usid
    dataCache.value = {
      id: pelayananId.value, deskripsi: deskripsi.value, pesanPengelola: pesanPengelola.value,
      pesanUnit: pesanUnit.value, pesanRevisi: pesanRevisi.value, organisasi: organisasi.value,
      surat_dinas: surat_dinas.value, lampiran: lampiran.value,
      src_HasilPemenuhan: src_HasilPemenuhan.value, src_HasilBA: src_HasilBA.value, src_HasilSLA: src_HasilSLA.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value, jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value, no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value, nama_belakangTeknis: nama_belakangTeknis.value,
      nama_depanUnit: nama_depanUnit.value, nama_belakangUnit: nama_belakangUnit.value,
      perihal: perihal.value, tanggal: tanggal.value, isDone: isDone.value,
      status: status.value, steps: steps.value, stepsStatus: stepsStatus.value
    }
    isDataLoaded.value = true; scrollToBottom()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const fetchDaftarTeknis = async () => {
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/pelayanan/allTeknis', { headers: { Authorization: 'Bearer ' + token } })
    daftarTeknis.value = res.data.map(i => ({ id_user: i.ID_User, nama_depan: i.Nama_Depan, nama_belakang: i.Nama_Belakang }))
  } catch (e) { console.error(e) }
}

const handlePilihan = (p) => { pilihan.value = pilihan.value === p ? '' : p }

const handleSelesai = async () => {
  const token = localStorage.getItem('Token')
  try {
    if (pilihan.value === 'Selesai') {
      await axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
        { ID_Status: 5, Pesan_Unit: pesanUnit.value, Is_Done: true },
        { headers: { Authorization: 'Bearer ' + token } })
      const lastId = stepsID.value[stepsID.value.length - 1]
      if (lastId) await axios.put(`/api/progress-alur/update-status/${lastId}`, { Is_Done: 1 }, { headers: { Authorization: 'Bearer ' + token } })
      router.push('/Disposisi')
    } else if (pilihan.value === 'Disposisi Teknis') {
      if (!idTeknisTerpilih.value) { alert('Harap pilih Pelaksana Teknis'); return }
      await axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
        { ID_Status: 4, ID_Teknis: idTeknisTerpilih.value, Pesan_Unit: pesanTeknis.value, Is_Done: false },
        { headers: { Authorization: 'Bearer ' + token } })
      router.push('/Disposisi')
    } else if (pilihan.value === 'Revisi') {
      await axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
        { ID_Status: 4, Pesan_Revisi: pesanRevisi.value, Is_Done: false, Hasil_Pemenuhan_Path: null, BA_Path: null, SLA_Path: null },
        { headers: { Authorization: 'Bearer ' + token } })
      router.push('/Disposisi')
    }
  } catch (e) { console.error(e) }
}

const handleFileUpload = (e) => { dokumen.value = e.target.files[0] }
const clearFile = () => { dokumen.value = null; const el = document.getElementById('chat-file-d'); if (el) el.value = '' }

const addMessage = async () => {
  if (!newMessage.value.trim() && !dokumen.value) return
  const fd = new FormData()
  fd.append('ID_User', userId.value); fd.append('Pesan', newMessage.value)
  if (dokumen.value) fd.append('Dokumen_Path', dokumen.value)
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.post(`/api/pesan/${pelayananId.value}`, fd, {
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }
    })
    messages.value.push({
      id_user: userId.value, text: newMessage.value, dokumen_path: res.data.dokumen,
      sender: `${localStorage.getItem('nama_depan')} ${localStorage.getItem('nama_belakang')} - ${localStorage.getItem('nama_role')}`,
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
    })
    newMessage.value = ''; dokumen.value = null; scrollToBottom()
  } catch (e) { console.error(e) }
}

const handleTabChange = (tab) => { activeTab.value = tab; router.replace({ query: { ...route.query, tab } }) }
const getStepClass  = (i) => status.value === 3 ? 'step--rejected' : (stepsStatus.value[i] === 1 ? 'step--done' : 'step--inactive')
const getLabelClass = (i) => status.value === 3 ? 'label--rejected' : (stepsStatus.value[i] === 1 ? 'label--done' : '')

watch(() => pelayananId.value, (v) => { if (v && v !== '-') { fetchPelayananData(); fetchDaftarTeknis() } })
onMounted(() => { if (pelayananId.value !== '-') { fetchPelayananData(); fetchDaftarTeknis() } })
</script>

<template>
  <div class="detail-page">
    <div v-if="isLoading" class="state-full"><div class="spinner"></div><p>Memuat data...</p></div>
    <div v-else-if="!isDataLoaded" class="state-full state-error">
      <p>Gagal memuat data.</p>
      <button class="retry-btn" @click="fetchPelayananData">Coba Lagi</button>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/Disposisi')">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Kembali
        </button>
        <div class="page-header__info">
          <span class="ticket-badge">#{{ pelayananId }}</span>
          <h1 class="page-header__title">{{ perihal }}</h1>
          <p class="page-header__sub">{{ sub_jenis_pelayanan }}</p>
        </div>
        <div class="page-header__meta">
          <span class="status-pill"
            :style="{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }">
            {{ statusText }}
          </span>
          <span v-if="isDone" class="done-pill">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l2.5 2.5L9 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Dokumen Tersedia
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in [{ id:'informasi', label:'Informasi' }, { id:'tracking', label:'Lacak Progres' }]"
          :key="tab.id" class="tab-btn" :class="{ 'tab-btn--active': activeTab === tab.id }"
          @click="handleTabChange(tab.id)">{{ tab.label }}</button>
      </div>

      <!-- TAB INFORMASI -->
      <div v-if="activeTab === 'informasi'" class="tab-content">
        <div class="info-grid">

          <!-- Kiri -->
          <div class="info-left">
            <div class="card">
              <div class="card__header"><h3 class="card__title">Informasi Umum</h3></div>
              <div class="card__body">
                <div class="info-list">
                  <div class="info-item"><span class="k">No. Tiket</span><span class="v mono">#{{ pelayananId }}</span></div>
                  <div class="info-item"><span class="k">Pelapor</span><span class="v">{{ nama_pelapor }}</span></div>
                  <div class="info-item"><span class="k">No. Telepon</span><span class="v">{{ no_telp }}</span></div>
                  <div class="info-item"><span class="k">Layanan</span><span class="v">{{ sub_jenis_pelayanan }}</span></div>
                  <div class="info-item"><span class="k">Tipe</span><span class="v">{{ jenis_pelayanan }}</span></div>
                  <div class="info-item"><span class="k">Perangkat Daerah</span><span class="v">{{ organisasi }}</span></div>
                  <div class="info-item"><span class="k">Tanggal</span><span class="v">{{ new Date(tanggal).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }) }}</span></div>
                  <div class="info-item"><span class="k">Pelaksana Teknis</span><span class="v">{{ nama_depanTeknis }} {{ nama_belakangTeknis }}</span></div>
                  <div class="info-item"><span class="k">Penanggung Unit</span><span class="v">{{ nama_depanUnit }} {{ nama_belakangUnit }}</span></div>
                </div>
                <div class="blk">
                  <p class="blk__label">Deskripsi</p>
                  <div class="desc-box">{{ deskripsi }}</div>
                </div>
                <div class="blk">
                  <p class="blk__label">Dokumen Pengajuan</p>
                  <a v-if="surat_dinas" :href="SuratDinas_Path" target="_blank" class="doc-link">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y=".5" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 4.5h6M3.5 6.5h6M3.5 8.5h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                    {{ namaFileSuratDinas }}
                  </a>
                  <a v-if="lampiran" :href="Lampiran_Path" target="_blank" class="doc-link">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 7V4a3.5 3.5 0 017 0v4.5a2 2 0 01-4 0V4.5a.5.5 0 011 0V8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                    {{ namaFileLampiran }}
                  </a>
                </div>
                <div v-if="pesanPengelola" class="blk">
                  <p class="blk__label">Pesan dari Pengelola</p>
                  <div class="desc-box desc-box--info">{{ pesanPengelola }}</div>
                </div>
                <div v-if="pesanUnit" class="blk">
                  <p class="blk__label">Pesan dari Unit ({{ nama_depanUnit }} {{ nama_belakangUnit }})</p>
                  <div class="desc-box desc-box--unit">{{ pesanUnit }}</div>
                </div>
                <div v-if="!isDone && pesanRevisi" class="blk">
                  <p class="blk__label">Catatan Revisi</p>
                  <div class="desc-box desc-box--warn">{{ pesanRevisi }}</div>
                </div>
              </div>
            </div>

            <!-- Hasil Pemenuhan (jika isDone) -->
            <div v-if="isDone" class="card">
              <div class="card__header">
                <h3 class="card__title">Hasil Pemenuhan &amp; Dokumen</h3>
                <span class="count-badge">{{ hasilDocs.filter(d=>d.path).length }}/3 tersedia</span>
              </div>
              <div class="card__body">
                <div class="hasil-list">
                  <div v-for="(item, i) in hasilDocs" :key="i"
                    class="hasil-item" :class="item.path ? 'hasil-item--on' : 'hasil-item--off'">
                    <span class="hdot" :class="item.path ? 'hdot--on' : 'hdot--off'"></span>
                    <div class="hasil-body">
                      <p class="hasil-label">{{ item.label }}</p>
                      <a v-if="item.path" :href="item.path" target="_blank" class="hasil-link">{{ item.name }}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8l6-6M8 8V2H2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </a>
                      <p v-else class="hasil-empty">Belum diunggah</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tinjau Pelayanan (isDone && status belum selesai) -->
            <div v-if="isDone && status !== 5 && status !== 6" class="card">
              <div class="card__header"><h3 class="card__title">Tinjau Pelayanan</h3></div>
              <div class="card__body">
                <div class="action-pills">
                  <button class="pill pill--blue"   :class="{ 'pill--active': pilihan==='Disposisi Teknis' }" @click="handlePilihan('Disposisi Teknis')">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M8 3l3 3.5L8 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Disposisi ke Teknis
                  </button>
                  <button class="pill pill--green"  :class="{ 'pill--active': pilihan==='Selesai' }"          @click="handlePilihan('Selesai')">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Selesai
                  </button>
                  <button class="pill pill--orange" :class="{ 'pill--active': pilihan==='Revisi' }"           @click="handlePilihan('Revisi')">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6A5 5 0 112 6M2 3v3h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Revisi
                  </button>
                </div>

                <!-- Panel Disposisi ke Teknis -->
                <div v-if="pilihan === 'Disposisi Teknis'" class="action-panel action-panel--blue">
                  <p class="panel-note">Distribusikan tiket ke Pelaksana Teknis untuk diproses lebih lanjut.</p>
                  <div class="field">
                    <label class="field__label">Pelaksana Teknis <span class="req">*</span></label>
                    <select v-model="idTeknisTerpilih" class="field__select">
                      <option value="" disabled>Pilih pelaksana teknis...</option>
                      <option v-for="t in daftarTeknis" :key="t.id_user" :value="t.id_user">
                        {{ t.nama_depan }} {{ t.nama_belakang }}
                      </option>
                    </select>
                  </div>
                  <div class="field">
                    <label class="field__label">Pesan untuk Pelaksana Teknis</label>
                    <textarea v-model="pesanTeknis" class="field__textarea" rows="3" placeholder="Instruksi atau catatan..."></textarea>
                  </div>
                  <button class="submit-btn submit-btn--blue" @click="handleSelesai" :disabled="!idTeknisTerpilih">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 7L2 1.5l2.5 5.5L2 12.5 13 7z" stroke="white" stroke-width="1.4" stroke-linejoin="round"/></svg>
                    Kirim ke Teknis
                  </button>
                </div>

                <!-- Panel Selesai -->
                <div v-if="pilihan === 'Selesai'" class="action-panel action-panel--green">
                  <p class="panel-note">Konfirmasi untuk menyelesaikan pelayanan ini secara langsung.</p>
                  <div class="info-note info-note--green">Pelayanan akan ditandai selesai tanpa melalui proses teknis lebih lanjut.</div>
                  <button class="submit-btn submit-btn--green" @click="handleSelesai">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Konfirmasi Selesai
                  </button>
                </div>

                <!-- Panel Revisi -->
                <div v-if="pilihan === 'Revisi'" class="action-panel action-panel--orange">
                  <p class="panel-note">Kembalikan tiket ke Pelaksana Teknis untuk perbaikan.</p>
                  <div class="field">
                    <label class="field__label">Pesan Revisi</label>
                    <textarea v-model="pesanRevisi" class="field__textarea" rows="3" placeholder="Tuliskan catatan revisi..."></textarea>
                  </div>
                  <div class="info-note info-note--orange">Dokumen HP, BA, dan SLA akan direset.</div>
                  <button class="submit-btn submit-btn--orange" @click="handleSelesai">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 6A6 6 0 112 6M2 3v3h3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Kirim Revisi
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Kanan: Chat -->
          <div class="info-right">
            <div class="card chat-card">
              <div class="card__header">
                <h3 class="card__title">Chat</h3>
                <span class="count-badge">{{ messages.length }}</span>
              </div>
              <div class="chat-messages" ref="chatBottom">
                <div v-if="messages.length === 0" class="chat-empty">Belum ada pesan</div>
                <div v-for="(msg, i) in messages" :key="i" class="msg"
                  :class="msg.id_user == userId ? 'msg--sent' : 'msg--recv'">
                  <div class="msg__bubble">
                    <p class="msg__sender">{{ msg.sender }}</p>
                    <p class="msg__text">{{ msg.text }}</p>
                    <template v-if="msg.dokumen_path">
                      <img v-if="isImage(msg.dokumen_path)" :src="'/files/' + msg.dokumen_path" class="msg__img"/>
                      <a v-else :href="'/files/' + msg.dokumen_path" target="_blank" class="msg__doc-link">Lihat Dokumen</a>
                    </template>
                    <span class="msg__time">{{ msg.time }}</span>
                  </div>
                </div>
              </div>
              <div v-if="status !== 6" class="chat-input-area">
                <div v-if="dokumen" class="file-chip">
                  {{ dokumen.name }}
                  <button class="chip-remove" @click="clearFile"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
                </div>
                <div class="chat-row">
                  <label class="attach-btn" for="chat-file-d"><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M4 8V5a3.5 3.5 0 017 0v5a2 2 0 01-4 0V5.5a.5.5 0 011 0V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></label>
                  <input type="file" id="chat-file-d" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display:none"/>
                  <textarea v-model="newMessage" class="chat-ta" placeholder="Tulis pesan..." rows="1" @keydown.enter.exact.prevent="addMessage"></textarea>
                  <button class="send-btn" @click="addMessage" :disabled="!newMessage.trim() && !dokumen">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </div>
              <div v-else class="chat-closed">Sesi chat telah ditutup (pelayanan selesai).</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB TRACKING -->
      <div v-else-if="activeTab === 'tracking'" class="tab-content">
        <div class="card tracking-card">
          <div class="card__header">
            <h3 class="card__title">Lacak Progres</h3>
            <span class="status-pill"
              :style="{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }">
              {{ statusText }}
            </span>
          </div>
          <div class="card__body">
            <div v-if="status === 3" class="banner banner--red">
              <strong>Permintaan Ditolak</strong>
              <p v-if="pesanPengelola">{{ pesanPengelola }}</p>
            </div>
            <div v-else-if="status === 4" class="banner banner--yellow">
              <strong>Perlu Revisi</strong>
              <p v-if="pesanRevisi">{{ pesanRevisi }}</p>
            </div>
            <div v-if="status !== 3" class="steps">
              <div v-for="(step, i) in steps" :key="i" class="step-item">
                <div class="step-conn" v-if="i > 0" :class="stepsStatus[i-1] === 1 ? 'sc--done' : ''"></div>
                <div class="step-circle" :class="getStepClass(i)">
                  <svg v-if="stepsStatus[i] === 1 && status !== 3" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <svg v-else-if="status === 3" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke="white" stroke-width="1.6" stroke-linecap="round"/></svg>
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
.detail-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--ease:cubic-bezier(0.16,1,0.3,1);--sh:0 1px 3px rgba(13,26,18,.06);--shg:0 4px 16px rgba(46,184,106,.28);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.state-full{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:.75rem;color:var(--csv);font-size:.875rem;}
.state-error{color:#ef4444;}
.spinner{width:32px;height:32px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.retry-btn{padding:.5rem 1.25rem;background:var(--cfo);border:1.5px solid rgba(46,184,106,.2);border-radius:8px;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--ce);cursor:pointer;}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;display:flex;align-items:flex-start;gap:1rem;position:relative;overflow:hidden;flex-wrap:wrap;border-radius:20px;}
.page-header::after{content:'';position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__info{flex:1;z-index:1;min-width:200px;}
.ticket-badge{display:inline-block;font-size:.7rem;font-weight:700;color:var(--cm);background:rgba(46,184,106,.15);border:1px solid rgba(46,184,106,.3);padding:.2rem .6rem;border-radius:99px;letter-spacing:.04em;margin-bottom:.5rem;}
.page-header__title{font-size:clamp(1.125rem,3vw,1.625rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.page-header__meta{display:flex;align-items:center;gap:.5rem;z-index:1;flex-wrap:wrap;}
.status-pill{display:inline-flex;align-items:center;padding:.3rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;border:1.5px solid;white-space:nowrap;}
.done-pill{display:inline-flex;align-items:center;gap:.3rem;padding:.3rem .75rem;background:rgba(46,184,106,.15);border:1px solid rgba(46,184,106,.3);border-radius:99px;font-size:.72rem;font-weight:700;color:#a7f3d0;}
.tabs{display:flex;gap:4px;padding:1rem 2rem 0;background:var(--cf);}
.tab-btn{padding:.625rem 1.125rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-bottom:none;border-radius:10px 10px 0 0;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:rgba(255,255,255,.6);cursor:pointer;transition:all .15s;}
.tab-btn:hover{background:rgba(255,255,255,.14);color:white;}
.tab-btn--active{background:var(--cmi);color:var(--ce);border-color:transparent;}
.tab-content{padding:1.5rem;max-width:1200px;margin:0 auto;animation:fadeUp .25s var(--ease);}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.info-grid{display:grid;grid-template-columns:1fr 380px;gap:1.25rem;align-items:flex-start;}
.info-left{display:flex;flex-direction:column;gap:1.25rem;}
.info-right{position:sticky;top:1rem;}
.card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.card__header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--cfo);}
.card__title{font-size:.9375rem;font-weight:800;color:var(--ci);letter-spacing:-.01em;}
.card__body{padding:1.25rem;}
.count-badge{font-size:.7rem;font-weight:700;padding:.2rem .625rem;background:var(--cfo);color:var(--ce);border-radius:99px;}
.info-list{display:flex;flex-direction:column;margin-bottom:1rem;}
.info-item{display:flex;align-items:baseline;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(168,200,180,.12);}
.info-item:last-child{border-bottom:none;}
.k{font-size:.75rem;font-weight:700;color:var(--cs);min-width:140px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em;}
.v{font-size:.875rem;color:var(--ci);font-weight:500;}
.mono{font-family:monospace;color:var(--ce);font-weight:700;}
.blk{margin-top:1rem;}
.blk__label{font-size:.7rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;}
.desc-box{background:var(--cmi);border-radius:10px;padding:.875rem;font-size:.875rem;color:var(--ci);line-height:1.6;white-space:pre-wrap;}
.desc-box--info{background:#eff6ff;color:#1e40af;border:1px solid rgba(59,130,246,.2);}
.desc-box--unit{background:#f0fdf4;color:#065f46;border:1px solid rgba(46,184,106,.2);}
.desc-box--warn{background:#fff7ed;color:#92400e;border:1px solid rgba(251,191,36,.3);}
.doc-link{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem .875rem;background:var(--cfo);border:1px solid rgba(46,184,106,.2);border-radius:8px;font-size:.8rem;font-weight:600;color:var(--ce);text-decoration:none;margin-bottom:.5rem;transition:all .15s;}
.doc-link:hover{background:var(--cm);color:white;}
.hasil-list{display:flex;flex-direction:column;gap:.625rem;}
.hasil-item{display:flex;align-items:flex-start;gap:.875rem;padding:.875rem 1rem;border-radius:12px;border:1.5px solid transparent;}
.hasil-item--on{background:var(--cfo);border-color:rgba(46,184,106,.2);}
.hasil-item--off{background:var(--cmi);border-color:rgba(168,200,180,.2);}
.hdot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.hdot--on{background:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.2);}
.hdot--off{background:#d1d5db;}
.hasil-body{flex:1;}
.hasil-label{font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.25rem;}
.hasil-link{display:inline-flex;align-items:center;gap:.375rem;font-size:.8125rem;font-weight:600;color:var(--ce);text-decoration:none;}
.hasil-link:hover{text-decoration:underline;}
.hasil-empty{font-size:.8125rem;color:var(--csv);font-style:italic;}
.action-pills{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;}
.pill{display:inline-flex;align-items:center;gap:.375rem;padding:.4rem .875rem;border-radius:99px;border:1.5px solid;font-family:var(--fn);font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;}
.pill--blue{color:#1d4ed8;background:#dbeafe;border-color:#93c5fd;}
.pill--blue.pill--active,.pill--blue:hover{background:#1d4ed8;color:white;border-color:#1d4ed8;}
.pill--green{color:#065f46;background:var(--cfo);border-color:rgba(46,184,106,.3);}
.pill--green.pill--active,.pill--green:hover{background:var(--cm);color:white;border-color:var(--cm);}
.pill--orange{color:#92400e;background:#fff7ed;border-color:#fdba74;}
.pill--orange.pill--active,.pill--orange:hover{background:#f97316;color:white;border-color:#f97316;}
.action-panel{border-radius:12px;padding:1rem;margin-top:.75rem;border:1.5px solid;}
.action-panel--blue{background:#eff6ff;border-color:#bfdbfe;}
.action-panel--green{background:#f0fdf4;border-color:rgba(46,184,106,.25);}
.action-panel--orange{background:#fff7ed;border-color:#fed7aa;}
.panel-note{font-size:.8125rem;color:var(--cs);margin-bottom:.875rem;}
.field{margin-bottom:.875rem;}
.field__label{display:block;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.req{color:#ef4444;margin-left:.2rem;}
.field__select{width:100%;padding:.5rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;cursor:pointer;transition:border-color .15s;}
.field__select:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.field__textarea{width:100%;padding:.625rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;resize:vertical;outline:none;transition:border-color .15s;box-sizing:border-box;}
.field__textarea:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.info-note{font-size:.75rem;padding:.5rem .75rem;border-radius:8px;margin-bottom:.875rem;border-left:3px solid;}
.info-note--green{background:#dcfce7;border-color:var(--cm);color:#065f46;}
.info-note--orange{background:#ffedd5;border-color:#f97316;color:#92400e;}
.submit-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1.25rem;border:none;border-radius:9px;font-family:var(--fn);font-size:.8125rem;font-weight:700;color:white;cursor:pointer;transition:opacity .15s;}
.submit-btn:hover:not(:disabled){opacity:.88;}
.submit-btn:disabled{opacity:.4;cursor:not-allowed;}
.submit-btn--blue{background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
.submit-btn--green{background:linear-gradient(135deg,var(--cm),var(--ce));box-shadow:var(--shg);}
.submit-btn--orange{background:linear-gradient(135deg,#f97316,#ea580c);}
.chat-card{display:flex;flex-direction:column;height:600px;}
.chat-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.625rem;background:var(--cmi);}
.chat-empty{text-align:center;font-size:.8125rem;color:var(--csv);padding:2rem;}
.msg{display:flex;}
.msg--sent{justify-content:flex-end;}
.msg--recv{justify-content:flex-start;}
.msg__bubble{max-width:80%;padding:.625rem .875rem;border-radius:12px;font-size:.8125rem;}
.msg--recv .msg__bubble{background:var(--cw);border:1px solid rgba(168,200,180,.2);color:var(--ci);}
.msg--sent .msg__bubble{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;}
.msg__sender{font-size:.7rem;font-weight:700;opacity:.7;margin-bottom:.2rem;}
.msg__text{margin:0;line-height:1.5;word-break:break-word;}
.msg__time{font-size:.65rem;opacity:.6;margin-top:.3rem;text-align:right;}
.msg__img{max-width:150px;border-radius:8px;margin-top:.4rem;}
.msg__doc-link{display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;opacity:.85;text-decoration:underline;color:inherit;margin-top:.3rem;}
.chat-input-area{border-top:1px solid rgba(168,200,180,.15);padding:.75rem;}
.chat-closed{padding:.875rem 1rem;font-size:.8125rem;color:var(--csv);text-align:center;font-style:italic;border-top:1px solid rgba(168,200,180,.15);}
.file-chip{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .625rem;background:var(--cfo);border:1px solid rgba(46,184,106,.2);border-radius:99px;font-size:.72rem;font-weight:600;color:var(--ce);margin-bottom:.5rem;}
.chip-remove{background:none;border:none;cursor:pointer;display:flex;color:var(--cs);padding:0;}
.chat-row{display:flex;align-items:flex-end;gap:.5rem;}
.attach-btn{width:34px;height:34px;border-radius:9px;background:var(--cfo);border:1px solid rgba(46,184,106,.2);display:flex;align-items:center;justify-content:center;color:var(--ce);cursor:pointer;flex-shrink:0;transition:background .15s;}
.attach-btn:hover{background:var(--cm);color:white;}
.chat-ta{flex:1;font-family:var(--fn);font-size:.8125rem;color:var(--ci);background:var(--cmi);border:1.5px solid transparent;border-radius:10px;padding:.5rem .75rem;resize:none;outline:none;transition:border-color .15s;}
.chat-ta:focus{border-color:var(--cm);background:white;}
.send-btn{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--cm),var(--ce));border:none;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;flex-shrink:0;transition:opacity .15s;box-shadow:var(--shg);}
.send-btn:hover:not(:disabled){opacity:.88;}
.send-btn:disabled{opacity:.4;cursor:not-allowed;}
.tracking-card{max-width:640px;margin:0 auto;}
.banner{display:flex;flex-direction:column;gap:.375rem;padding:1rem;border-radius:12px;margin-bottom:1.5rem;border-left:4px solid;}
.banner--red{background:#fef2f2;border-color:#ef4444;color:#dc2626;}
.banner--yellow{background:#fefce8;border-color:#eab308;color:#854d0e;}
.banner strong{font-size:.9375rem;}
.banner p{font-size:.8125rem;margin:0;opacity:.8;}
.steps{display:flex;flex-direction:column;}
.step-item{display:flex;align-items:flex-start;gap:1rem;position:relative;}
.step-conn{position:absolute;left:17px;top:-24px;width:2px;height:24px;background:rgba(168,200,180,.3);}
.sc--done{background:var(--cm);}
.step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.step--done{background:linear-gradient(135deg,var(--cm),var(--ce));box-shadow:0 0 0 4px rgba(46,184,106,.15);}
.step--inactive{background:var(--cmi);border:2px solid rgba(168,200,180,.4);}
.step--rejected{background:#ef4444;}
.step-num{font-size:.8rem;font-weight:700;color:var(--csv);}
.step-label{flex:1;padding:.625rem .875rem;border-radius:10px;font-size:.875rem;color:var(--cs);background:var(--cmi);margin-bottom:.625rem;border:1px solid transparent;}
.label--done{color:var(--ce);font-weight:700;background:var(--cfo);border-color:rgba(46,184,106,.2);}
.label--rejected{color:#dc2626;background:#fef2f2;border-color:rgba(239,68,68,.2);}
@media(max-width:1024px){.info-grid{grid-template-columns:1fr;}.info-right{position:static;}.chat-card{height:400px;}}
@media(max-width:640px){.page-header{flex-direction:column;gap:.875rem;padding:1.25rem 1.25rem 1.75rem;margin:0 0 1.5rem;border-radius:20px;}.tabs{padding:.75rem 1.25rem 0;}.tab-content{padding:1rem;}.page-header__meta{width:100%;}}
</style>