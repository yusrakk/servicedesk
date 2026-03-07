<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()

const pelayananId = ref(route.query.layanan || '-')
const activeTab   = ref('informasi')

const perihal          = ref('')
const tanggal          = ref('')
const nama_pelapor     = ref('')
const no_telp          = ref('')
const nama_depanTeknis = ref('')
const nama_belakangTeknis = ref('')
const nama_depanUnit   = ref('')
const nama_belakangUnit = ref('')
const sub_jenis_pelayanan = ref('')
const jenis_pelayanan  = ref('')
const deskripsi        = ref('')
const pesanPengelola   = ref('')
const pesanUnit        = ref('')
const organisasi       = ref('')
const status           = ref(0)

const surat_dinas      = ref('')
const lampiran         = ref('')
const SuratDinas_Path  = ref(null)
const Lampiran_Path    = ref(null)
const src_HasilPemenuhan = ref('')
const src_HasilBA      = ref('')
const src_HasilSLA     = ref('')

const steps       = ref([])
const stepsStatus = ref([])
const rating      = ref(null)
const reviewText  = ref('')

const isLoading    = ref(true)
const isDataLoaded = ref(false)
const dataCache    = ref(null)

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })
}

function namaFile(path, label) {
  if (!path || path === '-') return label
  try {
    const parts = path.split('/').pop().split('_')
    return `${parts[0]}_${parts[1]}_${label}.pdf`
  } catch { return `${label}.pdf` }
}

const namaFileSuratDinas     = computed(() => namaFile(surat_dinas.value, 'Surat_Dinas'))
const namaFileLampiran       = computed(() => namaFile(lampiran.value, 'Lampiran'))
const namaFileHasilPemenuhan = computed(() => namaFile(src_HasilPemenuhan.value, 'HasilPemenuhan'))
const namaFileHasilBA        = computed(() => namaFile(src_HasilBA.value, 'HasilBA'))
const namaFileHasilSLA       = computed(() => namaFile(src_HasilSLA.value, 'HasilSLA'))

const statusNama = computed(() => {
  const map = { 1:'Baru', 2:'Sedang Diproses', 3:'Ditolak', 4:'Revisi', 5:'Selesai', 6:'Tutup' }
  return map[status.value] || '-'
})
const statusConfig = {
  'Baru':{ color:'#2563eb', bg:'#dbeafe' },
  'Sedang Diproses':{ color:'#d97706', bg:'#fef3c7' },
  'Ditolak':{ color:'#dc2626', bg:'#fef2f2' },
  'Revisi':{ color:'#ea580c', bg:'#fff7ed' },
  'Selesai':{ color:'#059669', bg:'#ecfdf5' },
  'Tutup':{ color:'#6b7280', bg:'#f3f4f6' },
}

const fetchData = async () => {
  if (dataCache.value?.id === pelayananId.value) {
    const c = dataCache.value
    Object.assign({ deskripsi, pesanPengelola, pesanUnit, organisasi, surat_dinas, lampiran,
      src_HasilPemenuhan, src_HasilBA, src_HasilSLA, sub_jenis_pelayanan, jenis_pelayanan,
      nama_pelapor, no_telp, nama_depanTeknis, nama_belakangTeknis, nama_depanUnit,
      nama_belakangUnit, perihal, tanggal, rating, reviewText, steps, stepsStatus, status },
      Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'id').map(([k,v]) => [k, { value: v }]))
    )
    // simple assign
    deskripsi.value = c.deskripsi; pesanPengelola.value = c.pesanPengelola; pesanUnit.value = c.pesanUnit
    organisasi.value = c.organisasi; surat_dinas.value = c.surat_dinas; lampiran.value = c.lampiran
    src_HasilPemenuhan.value = c.src_HasilPemenuhan; src_HasilBA.value = c.src_HasilBA; src_HasilSLA.value = c.src_HasilSLA
    sub_jenis_pelayanan.value = c.sub_jenis_pelayanan; jenis_pelayanan.value = c.jenis_pelayanan
    nama_pelapor.value = c.nama_pelapor; no_telp.value = c.no_telp
    nama_depanTeknis.value = c.nama_depanTeknis; nama_belakangTeknis.value = c.nama_belakangTeknis
    nama_depanUnit.value = c.nama_depanUnit; nama_belakangUnit.value = c.nama_belakangUnit
    perihal.value = c.perihal; tanggal.value = c.tanggal
    rating.value = c.rating; reviewText.value = c.reviewText
    steps.value = c.steps; stepsStatus.value = c.stepsStatus; status.value = c.status
    SuratDinas_Path.value = c.surat_dinas ? '/files' + c.surat_dinas : null
    Lampiran_Path.value   = c.lampiran ? '/files' + c.lampiran : null
    isDataLoaded.value = true; isLoading.value = false; return
  }
  try {
    isLoading.value = true
    const token = localStorage.getItem('Token')
    const [pRes, prRes] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`, { headers: { Authorization: 'Bearer ' + token } }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, { headers: { Authorization: 'Bearer ' + token } })
    ])
    const d = pRes.data
    deskripsi.value     = d.Deskripsi || ''
    pesanPengelola.value = d.Pesan_Pengelola || ''
    pesanUnit.value     = d.Pesan_Unit || ''
    organisasi.value    = d.user?.user_organisasi?.Nama_OPD || ''
    surat_dinas.value   = d.Surat_Dinas_Path || ''
    lampiran.value      = d.Lampiran_Path || ''
    src_HasilPemenuhan.value = d.Hasil_Pemenuhan_Path || ''
    src_HasilBA.value   = d.BA_Path || ''
    src_HasilSLA.value  = d.SLA_Path || ''
    sub_jenis_pelayanan.value = d.sub__jenis__pelayanan?.Nama_Sub_Jenis_Pelayanan || ''
    jenis_pelayanan.value = d.jenis__pelayanan?.Nama_Jenis_Pelayanan || ''
    nama_pelapor.value  = [d.user?.Nama_Depan, d.user?.Nama_Belakang].filter(Boolean).join(' ')
    no_telp.value       = d.No_Telp || '-'
    nama_depanUnit.value = d.unit_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangUnit.value = d.unit_pelayanan?.Nama_Belakang || 'Tersedia'
    nama_depanTeknis.value = d.teknis_pelayanan?.Nama_Depan || 'Belum'
    nama_belakangTeknis.value = d.teknis_pelayanan?.Nama_Belakang || 'Tersedia'
    perihal.value       = d.Perihal || ''
    tanggal.value       = d.created_at || ''
    rating.value        = d.Rating || null
    reviewText.value    = d.Isi_Survey || ''
    status.value        = d.ID_Status || 0
    SuratDinas_Path.value = surat_dinas.value ? '/files' + surat_dinas.value : null
    Lampiran_Path.value   = lampiran.value ? '/files' + lampiran.value : null
    steps.value       = prRes.data.slice(0,5).map(i => i.progress_to_alur?.isi_alur?.Nama_Alur || '-')
    stepsStatus.value = prRes.data.slice(0,5).map(i => i.Is_Done)
    dataCache.value = {
      id: pelayananId.value, deskripsi: deskripsi.value, pesanPengelola: pesanPengelola.value,
      pesanUnit: pesanUnit.value, organisasi: organisasi.value, surat_dinas: surat_dinas.value,
      lampiran: lampiran.value, src_HasilPemenuhan: src_HasilPemenuhan.value,
      src_HasilBA: src_HasilBA.value, src_HasilSLA: src_HasilSLA.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value, jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value, no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value, nama_belakangTeknis: nama_belakangTeknis.value,
      nama_depanUnit: nama_depanUnit.value, nama_belakangUnit: nama_belakangUnit.value,
      perihal: perihal.value, tanggal: tanggal.value, rating: rating.value,
      reviewText: reviewText.value, steps: steps.value, stepsStatus: stepsStatus.value, status: status.value
    }
    isDataLoaded.value = true
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

function handleTabChange(tab) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

watch(() => pelayananId.value, v => { if (v && v !== '-') fetchData() })
onMounted(() => { if (pelayananId.value && pelayananId.value !== '-') fetchData() })
</script>

<template>
  <div class="page">
    <div v-if="isLoading" class="loading-full">
      <div class="spinner"></div><p>Memuat data...</p>
    </div>

    <template v-else-if="isDataLoaded">
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" @click="router.push({name:'KepuasanUserKeseluruhan'})">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Kembali
        </button>
        <div style="flex:1">
          <span class="page-header__label">Kepuasan User · Keseluruhan</span>
          <h1 class="page-header__title">{{ perihal || 'Detail Kepuasan' }}</h1>
          <div class="page-header__meta">
            <span class="ticket-id">#{{ pelayananId }}</span>
            <span class="status-badge"
              :style="{ color: statusConfig[statusNama]?.color||'#374151', background: statusConfig[statusNama]?.bg||'#f3f4f6' }">
              <span class="sdot" :style="{ background: statusConfig[statusNama]?.color||'#374151' }"></span>
              {{ statusNama }}
            </span>
          </div>
        </div>
        <div class="orb"></div>
      </div>

      <!-- Tabs -->
      <div class="tabs-bar">
        <button :class="['tab-btn', activeTab==='informasi'?'tab-btn--active':'']" @click="handleTabChange('informasi')">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 5v4M6.5 4h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          Informasi
        </button>
        <button :class="['tab-btn', activeTab==='tracking'?'tab-btn--active':'']" @click="handleTabChange('tracking')">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="2.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
          Lacak Progres
        </button>
      </div>

      <div class="body">
        <!-- TAB INFORMASI -->
        <div v-if="activeTab==='informasi'" class="two-col">

          <!-- Kiri: Info Umum + Dokumen -->
          <div class="info-col">
            <div class="section-card">
              <div class="section-card__header">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 5v4M6.5 4h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                Informasi Umum
              </div>
              <div class="section-card__body">
                <div class="info-grid">
                  <div class="ig-item"><span class="ig-label">No. Tiket</span><span class="ig-value mono">#{{ pelayananId }}</span></div>
                  <div class="ig-item"><span class="ig-label">Tanggal</span><span class="ig-value">{{ formatDate(tanggal) }}</span></div>
                  <div class="ig-item"><span class="ig-label">Pelapor</span><span class="ig-value">{{ nama_pelapor }}</span></div>
                  <div class="ig-item"><span class="ig-label">No. Telepon</span><span class="ig-value">{{ no_telp }}</span></div>
                  <div class="ig-item ig-item--full"><span class="ig-label">Layanan</span><span class="ig-value">{{ sub_jenis_pelayanan }}</span></div>
                  <div class="ig-item"><span class="ig-label">Tipe</span><span class="ig-value">{{ jenis_pelayanan }}</span></div>
                  <div class="ig-item"><span class="ig-label">Perangkat Daerah</span><span class="ig-value">{{ organisasi }}</span></div>
                </div>
                <div class="ig-full-field">
                  <span class="ig-label">Deskripsi</span>
                  <textarea class="ftextarea" :value="deskripsi" readonly rows="4"></textarea>
                </div>
                <!-- Pesan pengelola (jika bukan ditolak) -->
                <div v-if="status !== 3" class="ig-full-field" style="margin-top:.75rem">
                  <span class="ig-label">Pesan dari Pengelola</span>
                  <textarea class="ftextarea" :value="pesanPengelola" readonly rows="3" placeholder="Tidak ada pesan"></textarea>
                </div>
              </div>
            </div>

            <!-- Dokumen Permintaan -->
            <div class="section-card">
              <div class="section-card__header">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 1.5H4a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4.5L8 1.5z" stroke="currentColor" stroke-width="1.2"/><path d="M8 1.5V4.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                Dokumen Permintaan
              </div>
              <div class="section-card__body">
                <div class="doc-item">
                  <div class="doc-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 1.5H4a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4.5L8 1.5z" stroke="currentColor" stroke-width="1.1"/></svg></div>
                  <div class="doc-info">
                    <span class="doc-label">Surat Dinas</span>
                    <a v-if="SuratDinas_Path" :href="SuratDinas_Path" target="_blank" class="doc-link">{{ namaFileSuratDinas }}</a>
                    <span v-else class="doc-empty">Tidak ada file</span>
                  </div>
                </div>
                <div class="doc-item">
                  <div class="doc-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 1.5H4a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4.5L8 1.5z" stroke="currentColor" stroke-width="1.1"/></svg></div>
                  <div class="doc-info">
                    <span class="doc-label">Lampiran</span>
                    <a v-if="Lampiran_Path" :href="Lampiran_Path" target="_blank" class="doc-link">{{ namaFileLampiran }}</a>
                    <span v-else class="doc-empty">Tidak ada file</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kanan: Info Pelaksana + Hasil + Ulasan -->
          <div class="info-col">
            <!-- Alasan tolak (jika ditolak) -->
            <div v-if="status === 3" class="section-card">
              <div class="section-card__header" style="color:#dc2626">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                Alasan Penolakan
              </div>
              <div class="section-card__body">
                <textarea class="ftextarea" :value="pesanPengelola" readonly rows="4" placeholder="Tidak ada alasan"></textarea>
              </div>
            </div>

            <!-- Info pelaksana (jika bukan ditolak) -->
            <div v-if="status !== 3" class="section-card">
              <div class="section-card__header">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 11c0-2.5 2-4 4.5-4S11 8.5 11 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                Pelaksana
              </div>
              <div class="section-card__body">
                <div class="info-grid">
                  <div class="ig-item"><span class="ig-label">Unit Pelaksana</span><span class="ig-value">{{ nama_depanUnit }} {{ nama_belakangUnit }}</span></div>
                  <div class="ig-item"><span class="ig-label">Pelaksana Teknis</span><span class="ig-value">{{ nama_depanTeknis }} {{ nama_belakangTeknis }}</span></div>
                </div>
                <div class="ig-full-field" style="margin-top:.5rem">
                  <span class="ig-label">Pesan dari Unit</span>
                  <textarea class="ftextarea" :value="pesanUnit" readonly rows="3" placeholder="Tidak ada pesan"></textarea>
                </div>
              </div>
            </div>

            <!-- Hasil Pemenuhan (jika bukan ditolak) -->
            <div v-if="status !== 3" class="section-card">
              <div class="section-card__header">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Hasil Pemenuhan
              </div>
              <div class="section-card__body">
                <div v-for="(doc, i) in [
                  { label:'Hasil Pemenuhan', path:src_HasilPemenuhan, nama:namaFileHasilPemenuhan },
                  { label:'Berita Acara (BA)', path:src_HasilBA, nama:namaFileHasilBA },
                  { label:'SLA', path:src_HasilSLA, nama:namaFileHasilSLA },
                ]" :key="i" class="doc-item">
                  <div :class="['doc-icon', doc.path&&doc.path!=='-'?'doc-icon--green':'']">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 1.5H4a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4.5L8 1.5z" stroke="currentColor" stroke-width="1.1"/></svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-label">{{ doc.label }}</span>
                    <a v-if="doc.path&&doc.path!=='-'" :href="'/files'+doc.path" target="_blank" class="doc-link">{{ doc.nama }}</a>
                    <span v-else class="doc-empty">Belum diunggah</span>
                  </div>
                  <span :class="['doc-dot', doc.path&&doc.path!=='-'?'doc-dot--ada':'doc-dot--kosong']"></span>
                </div>
              </div>
            </div>

            <!-- Ulasan Pengguna -->
            <div class="section-card">
              <div class="section-card__header">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l1.4 2.8 3.1.45-2.25 2.2.53 3.1L6.5 8.5l-2.78 1.55.53-3.1L2 4.75l3.1-.45z" stroke="currentColor" stroke-width="1.1"/></svg>
                Ulasan Pengguna
              </div>
              <div class="section-card__body">
                <!-- Belum ada ulasan (status 5 tanpa rating) -->
                <div v-if="status === 5 && !rating" class="review-empty">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3l2.8 5.6 6.2.9-4.5 4.4 1.06 6.2L14 17 8.44 20.1l1.06-6.2L5 9.5l6.2-.9z" stroke="currentColor" stroke-width="1.3"/></svg>
                  <p>Belum ada ulasan dari pengguna</p>
                </div>
                <!-- Ada ulasan -->
                <div v-else-if="rating">
                  <div class="star-row">
                    <span v-for="s in 5" :key="s" class="star" :class="{ 'star--filled': s <= rating }">★</span>
                    <span class="rating-num">{{ rating }}/5</span>
                  </div>
                  <textarea class="ftextarea" :value="reviewText" readonly rows="4" placeholder="Belum ada ulasan" style="margin-top:.75rem"></textarea>
                </div>
                <!-- Status lain tanpa ulasan -->
                <div v-else class="review-empty">
                  <p>Ulasan tersedia setelah pelayanan selesai</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB TRACKING -->
        <div v-else-if="activeTab==='tracking'" class="tracking-wrap">
          <div class="section-card" style="max-width:560px">
            <div class="section-card__header">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="2.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
              Progress Alur — #{{ pelayananId }}
            </div>
            <div class="section-card__body">
              <div class="steps">
                <div v-for="(step, i) in steps" :key="i" class="step-row">
                  <div class="step-left">
                    <div :class="['step-circle', stepsStatus[i]===1?'step-circle--done':'step-circle--todo']">
                      <svg v-if="stepsStatus[i]===1" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      <span v-else>{{ i+1 }}</span>
                    </div>
                    <div v-if="i < steps.length-1" :class="['step-line', stepsStatus[i]===1?'step-line--done':'']"></div>
                  </div>
                  <span :class="['step-label', stepsStatus[i]===1?'step-label--done':'']">{{ step }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <p>Gagal memuat data.</p>
      <button class="fbtn fbtn--primary" @click="fetchData">Coba Lagi</button>
    </div>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.loading-full{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:.75rem;color:var(--csv);}
.error-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1rem;color:var(--csv);}
.spinner{width:28px;height:28px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.page-header{background:linear-gradient(135deg,var(--cf),var(--ce));padding:1.5rem 2rem 1.75rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;}
.orb{position:absolute;width:240px;height:240px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.3rem;}
.page-header__title{font-size:clamp(1.125rem,2.5vw,1.5rem);font-weight:800;color:white;letter-spacing:-.02em;margin-bottom:.5rem;}
.page-header__meta{display:flex;align-items:center;gap:.625rem;flex-wrap:wrap;}
.ticket-id{font-size:.75rem;font-weight:700;color:rgba(255,255,255,.7);font-family:monospace;}
.status-badge{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .625rem;border-radius:99px;font-size:.72rem;font-weight:700;}
.sdot{width:5px;height:5px;border-radius:50%;}
.tabs-bar{display:flex;background:white;border-bottom:1px solid rgba(168,200,180,.2);padding:0 1.5rem;}
.tab-btn{display:flex;align-items:center;gap:.4rem;padding:.75rem 1rem;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--csv);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;}
.tab-btn:hover{color:var(--cs);}
.tab-btn--active{color:var(--cm);border-bottom-color:var(--cm);}
.body{padding:1.5rem;max-width:1100px;margin:0 auto;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start;}
.info-col{display:flex;flex-direction:column;gap:1.25rem;}
.tracking-wrap{display:flex;justify-content:center;}
.section-card{background:var(--cw);border-radius:14px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.section-card__header{display:flex;align-items:center;gap:.5rem;padding:.875rem 1.25rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.15);font-size:.8125rem;font-weight:700;color:var(--ci);}
.section-card__header svg{color:var(--cm);}
.section-card__body{padding:1.125rem;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.625rem;margin-bottom:.5rem;}
.ig-item{display:flex;flex-direction:column;gap:.2rem;padding:.625rem .75rem;background:var(--cmi);border-radius:9px;}
.ig-item--full{grid-column:1/-1;}
.ig-label{font-size:.68rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.05em;}
.ig-value{font-size:.8125rem;font-weight:600;color:var(--ci);}
.ig-value.mono{font-family:monospace;}
.ig-full-field{margin-top:.5rem;}
.ig-full-field .ig-label{display:block;margin-bottom:.3rem;}
.ftextarea{width:100%;padding:.575rem .875rem;border:1.5px solid rgba(168,200,180,.3);border-radius:9px;font-family:var(--fn);font-size:.8125rem;color:var(--ci);background:var(--cmi);resize:vertical;outline:none;box-sizing:border-box;}
.doc-item{display:flex;align-items:center;gap:.75rem;padding:.625rem 0;border-bottom:1px solid rgba(168,200,180,.1);}
.doc-item:last-child{border-bottom:none;}
.doc-icon{width:30px;height:30px;border-radius:8px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.doc-icon--green{background:#dcfce7;color:#16a34a;}
.doc-info{flex:1;display:flex;flex-direction:column;gap:.15rem;}
.doc-label{font-size:.72rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.04em;}
.doc-link{font-size:.8125rem;font-weight:600;color:var(--cm);text-decoration:none;}
.doc-link:hover{text-decoration:underline;}
.doc-empty{font-size:.8125rem;color:var(--csv);font-style:italic;}
.doc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.doc-dot--ada{background:#16a34a;}
.doc-dot--kosong{background:#d1d5db;}
.review-empty{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:1.5rem 0;color:var(--csv);font-size:.8125rem;text-align:center;}
.review-empty svg{color:var(--csv);}
.star-row{display:flex;align-items:center;gap:.25rem;}
.star{font-size:1.5rem;color:#d1d5db;line-height:1;}
.star--filled{color:#f59e0b;}
.rating-num{font-size:.8rem;font-weight:700;color:var(--cs);margin-left:.5rem;}
.steps{display:flex;flex-direction:column;}
.step-row{display:flex;gap:.875rem;align-items:flex-start;}
.step-left{display:flex;flex-direction:column;align-items:center;flex-shrink:0;}
.step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;}
.step-circle--done{background:var(--cm);color:white;}
.step-circle--todo{background:var(--cmi);color:var(--csv);border:2px solid rgba(168,200,180,.4);}
.step-line{width:2px;height:24px;margin-top:2px;}
.step-line--done{background:var(--cm);}
.step-line:not(.step-line--done){background:rgba(168,200,180,.3);}
.step-label{font-size:.875rem;font-weight:600;color:var(--cs);padding:.375rem 0 1.25rem;}
.step-label--done{color:var(--ci);}
.fbtn{display:inline-flex;align-items:center;padding:.5rem 1.125rem;border-radius:9px;font-family:var(--fn);font-size:.8rem;font-weight:700;cursor:pointer;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;}
@media(max-width:860px){.two-col{grid-template-columns:1fr;}.body{padding:1rem;}.page-header{flex-direction:column;padding:1.25rem;}}
</style>