<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import PopupModel from './PopupModel.vue'

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
const sub_jenis_pelayanan  = ref('')
const jenis_pelayanan      = ref('')
const deskripsi            = ref('')
const organisasi           = ref('')
const surat_dinas          = ref('')
const lampiran             = ref('')
const pesanPengelola       = ref('')
const SuratDinas_Path      = ref(null)
const Lampiran_Path        = ref(null)
const steps                = ref([])
const stepsStatus          = ref([])
const stepsID              = ref([])
const messages             = ref([])
const pelaksana            = ref([])
const idTeknisTerpilih     = ref('')
const pesanUnit            = ref('')

const showReposisi  = ref(false)
const showDisposisi = ref(false)
const showTolak     = ref(false)

const newMessage  = ref('')
const dokumen     = ref(null)
const chatBottom  = ref(null)

const namaFile = (path, suffix) => {
  if (!path) return null
  try { const p = path.split('/').pop().split('_'); return `${p[0]}_${p[1]}_${suffix}.pdf` }
  catch { return `${suffix}.pdf` }
}
const namaFileSuratDinas = computed(() => namaFile(surat_dinas.value, 'Surat_Dinas'))
const namaFileLampiran   = computed(() => namaFile(lampiran.value, 'Lampiran'))

const isImage = (path) => /\.(jpg|jpeg|png)$/i.test(path)
const scrollToBottom = () => nextTick(() => { if (chatBottom.value) chatBottom.value.scrollTop = chatBottom.value.scrollHeight })

const fetchPelayananData = async () => {
  if (dataCache.value?.id === pelayananId.value) {
    const c = dataCache.value
    deskripsi.value = c.deskripsi; pesanPengelola.value = c.pesanPengelola
    organisasi.value = c.organisasi; surat_dinas.value = c.surat_dinas; lampiran.value = c.lampiran
    sub_jenis_pelayanan.value = c.sub_jenis_pelayanan; jenis_pelayanan.value = c.jenis_pelayanan
    nama_pelapor.value = c.nama_pelapor; no_telp.value = c.no_telp
    nama_depanTeknis.value = c.nama_depanTeknis; nama_belakangTeknis.value = c.nama_belakangTeknis
    perihal.value = c.perihal; tanggal.value = c.tanggal; status.value = c.status
    steps.value = c.steps; stepsStatus.value = c.stepsStatus
    isDataLoaded.value = true; isLoading.value = false; return
  }
  try {
    isLoading.value = true
    const token = localStorage.getItem('Token')
    const [pelRes, progRes, unitRes] = await Promise.all([
      axios.get(`/api/pelayanan/${pelayananId.value}`,               { headers: { Authorization: 'Bearer ' + token } }),
      axios.get(`/api/pelayanan/alur/progress/${pelayananId.value}`, { headers: { Authorization: 'Bearer ' + token } }),
      axios.get('/api/pelayanan/allTeknis',                          { headers: { Authorization: 'Bearer ' + token } }),
    ])
    const d = pelRes.data
    pesanPengelola.value = d.Pesan_Pengelola; deskripsi.value = d.Deskripsi
    organisasi.value = d.user.user_organisasi.Nama_OPD
    surat_dinas.value = d.Surat_Dinas_Path; lampiran.value = d.Lampiran_Path
    sub_jenis_pelayanan.value = d.sub__jenis__pelayanan.Nama_Sub_Jenis_Pelayanan
    jenis_pelayanan.value = d.jenis__pelayanan.Nama_Jenis_Pelayanan
    nama_pelapor.value = [d.user.Nama_Depan, d.user.Nama_Belakang].filter(Boolean).join(' ')
    no_telp.value = d.No_Telp || '-'
    nama_depanTeknis.value  = d.teknis_pelayanan?.Nama_Depan  || ''
    nama_belakangTeknis.value = d.teknis_pelayanan?.Nama_Belakang || ''
    perihal.value = d.Perihal; tanggal.value = d.created_at; status.value = d.ID_Status
    messages.value = d.pelayanan_pesan.map(p => ({
      id_user: p.ID_User, text: p.Pesan,
      sender: `${p.pesan_user.Nama_Depan} ${p.pesan_user.Nama_Belakang} - ${p.pesan_user.user_role.Nama_Role}`,
      time: new Date(p.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dokumen_path: p.Dokumen_Path
    }))
    steps.value       = progRes.data.slice(0, 5).map(i => i.progress_to_alur?.isi_alur?.Nama_Alur || 'Tidak Diketahui')
    stepsStatus.value = progRes.data.slice(0, 5).map(i => i.Is_Done)
    stepsID.value     = progRes.data.slice(0, 5).map(i => i.ID_Progress_Alur)
    pelaksana.value   = unitRes.data.map(i => ({ id_user: i.ID_User, nama_depan: i.Nama_Depan, nama_belakang: i.Nama_Belakang }))
    idTeknisTerpilih.value = ''
    SuratDinas_Path.value = '/files/' + surat_dinas.value
    Lampiran_Path.value   = '/files/' + lampiran.value
    dataCache.value = {
      id: pelayananId.value, deskripsi: deskripsi.value, pesanPengelola: pesanPengelola.value,
      organisasi: organisasi.value, surat_dinas: surat_dinas.value, lampiran: lampiran.value,
      sub_jenis_pelayanan: sub_jenis_pelayanan.value, jenis_pelayanan: jenis_pelayanan.value,
      nama_pelapor: nama_pelapor.value, no_telp: no_telp.value,
      nama_depanTeknis: nama_depanTeknis.value, nama_belakangTeknis: nama_belakangTeknis.value,
      perihal: perihal.value, tanggal: tanggal.value, status: status.value,
      steps: steps.value, stepsStatus: stepsStatus.value
    }
    isDataLoaded.value = true; scrollToBottom()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleSelesai = async () => {
  try {
    const token = localStorage.getItem('Token')
    await axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`,
      { ID_Teknis: idTeknisTerpilih.value, Pesan_Unit: pesanUnit.value, ID_Status: 4 },
      { headers: { Authorization: 'Bearer ' + token } })
    const id3 = stepsID.value[3]
    if (id3) await axios.put(`/api/progress-alur/update-status/${id3}`, { Is_Done: 1 }, { headers: { Authorization: 'Bearer ' + token } })
    router.push('/Approval')
  } catch (e) { console.error(e) }
}

const handleReposisi  = async (val) => { console.log('reposisi', val);  closePopups() }
const handleDisposisi = async (val) => { console.log('disposisi', val); closePopups() }
const handleTolak     = async (val) => {
  try {
    const token = localStorage.getItem('Token')
    await axios.put(`/api/pelayanan/disposisi/${pelayananId.value}`, { Pesan_Unit: val, ID_Status: 3 }, { headers: { Authorization: 'Bearer ' + token } })
    router.push('/Approval')
  } catch (e) { console.error(e) }
  closePopups()
}
const closePopups = () => { showReposisi.value = false; showDisposisi.value = false; showTolak.value = false }

const handleFileUpload = (e) => { dokumen.value = e.target.files[0] }
const clearFile = () => { dokumen.value = null; const el = document.getElementById('chat-file'); if (el) el.value = '' }

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    newMessage.value = ''; dokumen.value = null; scrollToBottom()
  } catch (e) { console.error(e) }
}

const handleTabChange = (tab) => { activeTab.value = tab; router.replace({ query: { ...route.query, tab } }) }

watch(() => pelayananId.value, (v) => { if (v && v !== '-') fetchPelayananData() })
onMounted(() => {
  if (pelayananId.value !== '-') fetchPelayananData()
  const onPop = () => router.push('/Approval')
  window.addEventListener('popstate', onPop)
  onUnmounted(() => window.removeEventListener('popstate', onPop))
})
</script>

<template>
  <div class="detail-page">

    <div v-if="isLoading" class="state-full">
      <div class="spinner"></div><p>Memuat data...</p>
    </div>

    <div v-else-if="!isDataLoaded" class="state-full state-error">
      <p>Gagal memuat data.</p>
      <button class="retry-btn" @click="fetchPelayananData">Coba Lagi</button>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/Approval')">
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
        <div class="page-header__actions">
          <button class="action-btn action-btn--reposisi"  @click="showReposisi = true">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M8 3l3 3.5L8 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Reposisi
          </button>
          <button class="action-btn action-btn--disposisi" @click="showDisposisi = true">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M3 5.5l3.5-3.5L10 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Disposisi
          </button>
          <button class="action-btn action-btn--tolak"     @click="showTolak = true">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 3l7 7M10 3l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Tolak
          </button>
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
                  <p class="blk__label">Pesan dari SuperAdmin</p>
                  <div class="desc-box desc-box--info">{{ pesanPengelola }}</div>
                </div>
              </div>
            </div>

            <!-- Tinjau Pelayanan -->
            <div class="card">
              <div class="card__header">
                <h3 class="card__title">Tinjau &amp; Teruskan Pelayanan</h3>
              </div>
              <div class="card__body">
                <div class="field">
                  <label class="field__label">Pilih Pelaksana Teknis</label>
                  <select v-model="idTeknisTerpilih" class="field__select">
                    <option value="" disabled>Pilih pelaksana teknis...</option>
                    <option v-for="opt in pelaksana" :key="opt.id_user" :value="opt.id_user">
                      {{ opt.nama_depan }} {{ opt.nama_belakang }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label">Pesan untuk Pelaksana Teknis</label>
                  <textarea v-model="pesanUnit" class="field__textarea" rows="3" placeholder="Tuliskan instruksi atau catatan..."></textarea>
                </div>
                <button class="selesai-btn" @click="handleSelesai" :disabled="!idTeknisTerpilih">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Selesai &amp; Teruskan
                </button>
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
              <div class="chat-input-area">
                <div v-if="dokumen" class="file-chip">
                  {{ dokumen.name }}
                  <button class="chip-remove" @click="clearFile">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  </button>
                </div>
                <div class="chat-row">
                  <label class="attach-btn" for="chat-file">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M4 8V5a3.5 3.5 0 017 0v5a2 2 0 01-4 0V5.5a.5.5 0 011 0V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  </label>
                  <input type="file" id="chat-file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display:none"/>
                  <textarea v-model="newMessage" class="chat-ta" placeholder="Tulis pesan..." rows="1" @keydown.enter.exact.prevent="addMessage"></textarea>
                  <button class="send-btn" @click="addMessage" :disabled="!newMessage.trim() && !dokumen">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- TAB TRACKING -->
      <div v-else-if="activeTab === 'tracking'" class="tab-content">
        <div class="card tracking-card">
          <div class="card__header">
            <h3 class="card__title">Lacak Progres</h3>
            <span class="ticket-badge">#{{ pelayananId }}</span>
          </div>
          <div class="card__body">
            <div class="steps">
              <div v-for="(step, i) in steps" :key="i" class="step-item">
                <div class="step-conn" v-if="i > 0" :class="stepsStatus[i-1] === 1 ? 'sc--done' : ''"></div>
                <div class="step-circle" :class="stepsStatus[i] === 1 ? 'step--done' : 'step--inactive'">
                  <svg v-if="stepsStatus[i] === 1" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-else class="step-num">{{ i + 1 }}</span>
                </div>
                <div class="step-label" :class="stepsStatus[i] === 1 ? 'label--done' : ''">{{ step }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popups -->
    <PopupModel v-if="showReposisi"  type="reposisi"  title="Reposisi Pelayanan"  description="Pilih layanan tujuan reposisi:"       confirmText="Kirim"  @close="closePopups" @submit="handleReposisi"/>
    <PopupModel v-if="showDisposisi" type="disposisi" title="Disposisi Pelayanan" description="Pilih tim dan prioritas disposisi:"    confirmText="Kirim"  @close="closePopups" @submit="handleDisposisi"/>
    <PopupModel v-if="showTolak"     type="tolak"     title="Tolak Pelayanan"     description="Berikan alasan penolakan:"            confirmText="Tolak"  @close="closePopups" @submit="handleTolak"/>
  </div>
</template>

<style scoped>
.detail-page{--color-forest:#1a3a2a;--color-emerald:#0f5c38;--color-mint:#2eb86a;--color-foam:#e8f4ee;--color-ink:#0d1a12;--color-stone:#5a7566;--color-silver:#b8ccc2;--color-mist:#f0f6f2;--color-white:#ffffff;--font:'Plus Jakarta Sans',sans-serif;--ease-out:cubic-bezier(0.16,1,0.3,1);--shadow-sm:0 1px 3px rgba(13,26,18,.06);--shadow-green:0 4px 16px rgba(46,184,106,.28);font-family:var(--font);min-height:100vh;background:var(--color-mist);}
.state-full{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:.75rem;color:var(--color-silver);font-size:.875rem;}
.state-error{color:#ef4444;}
.spinner{width:32px;height:32px;border:3px solid var(--color-foam);border-top-color:var(--color-mint);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.retry-btn{padding:.5rem 1.25rem;background:var(--color-foam);border:1.5px solid rgba(46,184,106,.2);border-radius:8px;font-family:var(--font);font-size:.8125rem;font-weight:600;color:var(--color-emerald);cursor:pointer;}
.page-header{background:var(--color-forest);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;display:flex;align-items:flex-start;gap:1rem;position:relative;overflow:hidden;flex-wrap:wrap;border-radius:20px;}
.page-header::after{content:'';position:absolute;width:250px;height:250px;background:var(--color-mint);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--font);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__info{flex:1;z-index:1;min-width:200px;}
.ticket-badge{display:inline-block;font-size:.7rem;font-weight:700;color:var(--color-mint);background:rgba(46,184,106,.15);border:1px solid rgba(46,184,106,.3);padding:.2rem .6rem;border-radius:99px;letter-spacing:.04em;margin-bottom:.5rem;}
.page-header__title{font-size:clamp(1.125rem,3vw,1.625rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.page-header__actions{display:flex;align-items:center;gap:.5rem;z-index:1;flex-wrap:wrap;}
.action-btn{display:flex;align-items:center;gap:.375rem;padding:.4rem .875rem;border:1px solid transparent;border-radius:8px;font-family:var(--font);font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap;}
.action-btn--reposisi{background:rgba(46,184,106,.15);border-color:rgba(46,184,106,.3);color:#a7f3d0;}
.action-btn--reposisi:hover{background:rgba(46,184,106,.25);}
.action-btn--disposisi{background:rgba(59,130,246,.15);border-color:rgba(59,130,246,.3);color:#bfdbfe;}
.action-btn--disposisi:hover{background:rgba(59,130,246,.25);}
.action-btn--tolak{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#fecaca;}
.action-btn--tolak:hover{background:rgba(239,68,68,.25);}
.tabs{display:flex;gap:4px;padding:1rem 2rem 0;background:linear-gradient(135deg,var(--color-forest),var(--color-emerald));}
.tab-btn{padding:.625rem 1.125rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-bottom:none;border-radius:10px 10px 0 0;font-family:var(--font);font-size:.8125rem;font-weight:600;color:rgba(255,255,255,.6);cursor:pointer;transition:all .15s;}
.tab-btn:hover{background:rgba(255,255,255,.14);color:white;}
.tab-btn--active{background:var(--color-mist);color:var(--color-emerald);border-color:transparent;}
.tab-content{padding:1.5rem;max-width:1200px;margin:0 auto;animation:fadeUp .25s var(--ease-out);}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.info-grid{display:grid;grid-template-columns:1fr 380px;gap:1.25rem;align-items:flex-start;}
.info-left{display:flex;flex-direction:column;gap:1.25rem;}
.info-right{position:sticky;top:1rem;}
.card{background:var(--color-white);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--shadow-sm);overflow:hidden;}
.card__header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--color-foam);}
.card__title{font-size:.9375rem;font-weight:800;color:var(--color-ink);letter-spacing:-.01em;}
.card__body{padding:1.25rem;}
.count-badge{font-size:.7rem;font-weight:700;padding:.2rem .625rem;background:var(--color-foam);color:var(--color-emerald);border-radius:99px;}
.info-list{display:flex;flex-direction:column;margin-bottom:1rem;}
.info-item{display:flex;align-items:baseline;gap:.75rem;padding:.5rem 0;border-bottom:1px solid rgba(168,200,180,.12);}
.info-item:last-child{border-bottom:none;}
.k{font-size:.75rem;font-weight:700;color:var(--color-stone);min-width:140px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em;}
.v{font-size:.875rem;color:var(--color-ink);font-weight:500;}
.mono{font-family:monospace;color:var(--color-emerald);font-weight:700;}
.blk{margin-top:1rem;}
.blk__label{font-size:.7rem;font-weight:700;color:var(--color-stone);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;}
.desc-box{background:var(--color-mist);border-radius:10px;padding:.875rem;font-size:.875rem;color:var(--color-ink);line-height:1.6;white-space:pre-wrap;}
.desc-box--info{background:#eff6ff;color:#1e40af;border:1px solid rgba(59,130,246,.2);}
.doc-link{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem .875rem;background:var(--color-foam);border:1px solid rgba(46,184,106,.2);border-radius:8px;font-size:.8rem;font-weight:600;color:var(--color-emerald);text-decoration:none;margin-bottom:.5rem;transition:all .15s;}
.doc-link:hover{background:var(--color-mint);color:white;border-color:var(--color-mint);}
.field{margin-bottom:1rem;}
.field__label{display:block;font-size:.72rem;font-weight:700;color:var(--color-stone);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.field__select{width:100%;padding:.5rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--font);font-size:.875rem;color:var(--color-ink);background:white;outline:none;transition:border-color .15s;cursor:pointer;}
.field__select:focus{border-color:var(--color-mint);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.field__textarea{width:100%;padding:.625rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--font);font-size:.875rem;color:var(--color-ink);background:white;resize:vertical;outline:none;transition:border-color .15s;box-sizing:border-box;}
.field__textarea:focus{border-color:var(--color-mint);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.selesai-btn{display:flex;align-items:center;gap:.5rem;padding:.625rem 1.375rem;background:linear-gradient(135deg,var(--color-mint),var(--color-emerald));border:none;border-radius:10px;font-family:var(--font);font-size:.875rem;font-weight:700;color:white;cursor:pointer;box-shadow:var(--shadow-green);transition:opacity .15s;}
.selesai-btn:hover:not(:disabled){opacity:.9;}
.selesai-btn:disabled{opacity:.45;cursor:not-allowed;}
.chat-card{display:flex;flex-direction:column;height:580px;}
.chat-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.625rem;background:var(--color-mist);}
.chat-empty{text-align:center;font-size:.8125rem;color:var(--color-silver);padding:2rem;}
.msg{display:flex;}
.msg--sent{justify-content:flex-end;}
.msg--recv{justify-content:flex-start;}
.msg__bubble{max-width:80%;padding:.625rem .875rem;border-radius:12px;font-size:.8125rem;}
.msg--recv .msg__bubble{background:var(--color-white);border:1px solid rgba(168,200,180,.2);color:var(--color-ink);}
.msg--sent .msg__bubble{background:linear-gradient(135deg,var(--color-mint),var(--color-emerald));color:white;}
.msg__sender{font-size:.7rem;font-weight:700;opacity:.7;margin-bottom:.2rem;}
.msg__text{margin:0;line-height:1.5;word-break:break-word;}
.msg__time{font-size:.65rem;opacity:.6;margin-top:.3rem;text-align:right;}
.msg__img{max-width:150px;border-radius:8px;margin-top:.4rem;}
.msg__doc-link{display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;opacity:.85;text-decoration:underline;color:inherit;margin-top:.3rem;}
.chat-input-area{border-top:1px solid rgba(168,200,180,.15);padding:.75rem;}
.file-chip{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .625rem;background:var(--color-foam);border:1px solid rgba(46,184,106,.2);border-radius:99px;font-size:.72rem;font-weight:600;color:var(--color-emerald);margin-bottom:.5rem;}
.chip-remove{background:none;border:none;cursor:pointer;display:flex;color:var(--color-stone);padding:0;}
.chat-row{display:flex;align-items:flex-end;gap:.5rem;}
.attach-btn{width:34px;height:34px;border-radius:9px;background:var(--color-foam);border:1px solid rgba(46,184,106,.2);display:flex;align-items:center;justify-content:center;color:var(--color-emerald);cursor:pointer;flex-shrink:0;transition:background .15s;}
.attach-btn:hover{background:var(--color-mint);color:white;}
.chat-ta{flex:1;font-family:var(--font);font-size:.8125rem;color:var(--color-ink);background:var(--color-mist);border:1.5px solid transparent;border-radius:10px;padding:.5rem .75rem;resize:none;outline:none;transition:border-color .15s;line-height:1.5;}
.chat-ta:focus{border-color:var(--color-mint);background:white;}
.send-btn{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--color-mint),var(--color-emerald));border:none;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;flex-shrink:0;transition:opacity .15s;box-shadow:var(--shadow-green);}
.send-btn:hover:not(:disabled){opacity:.88;}
.send-btn:disabled{opacity:.4;cursor:not-allowed;}
.tracking-card{max-width:640px;margin:0 auto;}
.steps{display:flex;flex-direction:column;}
.step-item{display:flex;align-items:flex-start;gap:1rem;position:relative;}
.step-conn{position:absolute;left:17px;top:-24px;width:2px;height:24px;background:rgba(168,200,180,.3);}
.sc--done{background:var(--color-mint);}
.step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.step--done{background:linear-gradient(135deg,var(--color-mint),var(--color-emerald));box-shadow:0 0 0 4px rgba(46,184,106,.15);}
.step--inactive{background:var(--color-mist);border:2px solid rgba(168,200,180,.4);}
.step-num{font-size:.8rem;font-weight:700;color:var(--color-silver);}
.step-label{flex:1;padding:.625rem .875rem;border-radius:10px;font-size:.875rem;color:var(--color-stone);background:var(--color-mist);margin-bottom:.625rem;border:1px solid transparent;}
.label--done{color:var(--color-emerald);font-weight:700;background:var(--color-foam);border-color:rgba(46,184,106,.2);}
@media(max-width:1024px){.info-grid{grid-template-columns:1fr;}.info-right{position:static;}.chat-card{height:400px;}}
@media(max-width:640px){.page-header{flex-direction:column;gap:.875rem;padding:1.25rem 1.25rem 1.75rem;margin:0 0 1.5rem;border-radius:20px;}.tabs{padding:.75rem 1.25rem 0;}.tab-content{padding:1rem;}.page-header__actions{width:100%;}}
</style>