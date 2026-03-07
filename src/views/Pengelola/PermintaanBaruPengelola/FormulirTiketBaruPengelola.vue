<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()

onUnmounted(() => { localStorage.removeItem('ID_Sub_Jenis_Pelayanan') })

const layanan              = ref(route.query.layanan || '')
const persyaratan          = ref(route.query.persyaratan || '')
const id_user              = localStorage.getItem('ID_User')
const id_sub_jenis_pelayanan = localStorage.getItem('ID_Sub_Jenis_Pelayanan')
const id_status            = 2

const namaPelapor      = ref('')
const notelp           = ref('')
const perihal          = ref('')
const deskripsi        = ref('')
const idUnitTerpilih   = ref('')
const idUrgensiTerpilih = ref('')
const pesan            = ref('')
const suratDinas       = ref(null)
const lampiran         = ref(null)
const suratDinasPath   = ref(null)
const lampiranPath     = ref(null)
const suratDinasName   = ref('')
const lampiranName     = ref('')

const pelaksana    = ref([])
const urgensi      = ref([])
const isLoading    = ref(false)
const isSubmitted  = ref(false)
const stepsID      = ref([])

const token = localStorage.getItem('Token')

onMounted(() => {
  axios.get('/api/pelayanan/unit', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      pelaksana.value = res.data.map(i => ({
        id_user: i.ID_User, nama_depan: i.Nama_Depan, nama_belakang: i.Nama_Belakang
      }))
    }).catch(console.error)

  axios.get('/api/urgensi', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      urgensi.value = res.data.map(i => ({ id_urgensi: i.ID_Urgensi, nama_urgensi: i.Nama_Urgensi }))
    }).catch(console.error)
})

function handleFileChange(e, field) {
  const file = e.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') { alert('Hanya file PDF yang diperbolehkan.'); e.target.value = ''; return }
  if (file.size > 8 * 1024 * 1024) { alert('Ukuran file melebihi 8MB.'); e.target.value = ''; return }
  if (field === 'suratDinas') { suratDinas.value = file; suratDinasName.value = file.name }
  else if (field === 'lampiran') { lampiran.value = file; lampiranName.value = file.name }
}

async function uploadFiles() {
  if (!suratDinas.value && !lampiran.value) { alert('Harap unggah semua file yang diperlukan'); return false }
  const formData = new FormData()
  formData.append('surat_dinas', suratDinas.value)
  formData.append('lampiran', lampiran.value)
  try {
    const res = await axios.post('/api/uploadKeperluan', formData, {
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }
    })
    suratDinasPath.value = res.data.surat_dinas
    lampiranPath.value   = res.data.lampiran
    return true
  } catch (e) {
    alert('Upload gagal: ' + (e.response?.data?.message || e.message)); return false
  }
}

async function handleSubmit() {
  if (isSubmitted.value || isLoading.value) return
  if (!namaPelapor.value || !notelp.value || !perihal.value || !deskripsi.value || !idUnitTerpilih.value || !idUrgensiTerpilih.value) {
    alert('Harap isi semua kolom yang bertanda *'); return
  }
  if (!confirm('Apakah Anda yakin ingin mengirim permintaan ini?')) return
  isLoading.value = true
  const uploaded = await uploadFiles()
  if (!uploaded) { isLoading.value = false; return }

  axios.post('/api/pelayanan/tambah', {
    ID_User: id_user, Nama_Pelapor: namaPelapor.value,
    ID_Sub_Jenis_Pelayanan: id_sub_jenis_pelayanan, ID_Status: id_status,
    Perihal: perihal.value, Deskripsi: deskripsi.value, No_Telp: notelp.value,
    Surat_Dinas_Path: suratDinasPath.value, Lampiran_Path: lampiranPath.value,
    ID_Unit: idUnitTerpilih.value, Pesan_Pengelola: pesan.value, ID_Urgensi: idUrgensiTerpilih.value
  }, { headers: { Authorization: 'Bearer ' + token } })
  .then(async res => {
    isSubmitted.value = true; isLoading.value = false
    const role = parseInt(localStorage.getItem('id_role'))
    router.push(role === 1 ? '/permintaanDiproses' : '/pelayanan')
    const pelayananId = res.data.ID_Pelayanan
    await new Promise(r => setTimeout(r, 500))
    const progressRes = await axios.get(`/api/pelayanan/alur/progress/${pelayananId}`, { headers: { Authorization: 'Bearer ' + token } })
    stepsID.value = progressRes.data.map(i => i.ID_Progress_Alur)
    const idStep3 = stepsID.value[2]
    if (idStep3) await axios.put(`/api/progress-alur/update-status/${idStep3}`, { Is_Done: 1 }, { headers: { Authorization: 'Bearer ' + token } })
  })
  .catch(e => { console.error(e); isLoading.value = false })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/permintaanBaruPengelola')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="page-header__label">Pengelola · Permintaan Baru</span>
        <h1 class="page-header__title">Formulir Tiket Baru</h1>
        <p class="page-header__sub">Isi data permintaan layanan dengan lengkap</p>
      </div>
      <div class="orb"></div>
    </div>

    <div class="body">
      <!-- Persyaratan note -->
      <div class="persyaratan-note">
        <div class="persyaratan-note__header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 5h4M5 8h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Persyaratan Layanan: <strong>{{ layanan }}</strong>
        </div>
        <p class="persyaratan-note__text">{{ persyaratan || '-' }}</p>
      </div>

      <div class="form-card">
        <div class="form-card__header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 5h4M5 8h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Formulir Permintaan
          <span class="req-note"><span class="req">*</span> Wajib diisi</span>
        </div>
        <div class="form-body">
          <div class="form-grid">
            <!-- Nama Pelapor -->
            <div class="field">
              <label class="flabel">Nama Pelapor <span class="req">*</span></label>
              <input v-model="namaPelapor" class="finput" type="text" placeholder="Masukkan nama pelapor..." maxlength="50"/>
            </div>
            <!-- No Telp -->
            <div class="field">
              <label class="flabel">No. Telepon <span class="req">*</span></label>
              <input v-model="notelp" class="finput" type="text" placeholder="Nomor telepon aktif..." maxlength="20"/>
            </div>
            <!-- Layanan (read-only) -->
            <div class="field field--full">
              <label class="flabel">Layanan</label>
              <div class="finput finput--readonly">{{ layanan }}</div>
            </div>
            <!-- Perihal -->
            <div class="field field--full">
              <label class="flabel">Perihal <span class="req">*</span></label>
              <input v-model="perihal" class="finput" type="text" placeholder="Ringkasan singkat permintaan..." maxlength="50"/>
            </div>
            <!-- Deskripsi -->
            <div class="field field--full">
              <label class="flabel">Deskripsi <span class="req">*</span></label>
              <textarea v-model="deskripsi" class="ftextarea" rows="5" placeholder="Jelaskan secara detail permintaan Anda..."></textarea>
            </div>
            <!-- Unit Pelaksana -->
            <div class="field">
              <label class="flabel">Unit Pelaksana <span class="req">*</span></label>
              <select v-model="idUnitTerpilih" class="fselect">
                <option disabled value="">Pilih Unit Pelaksana</option>
                <option v-for="item in pelaksana" :key="item.id_user" :value="item.id_user">
                  {{ item.nama_depan }} {{ item.nama_belakang }}
                </option>
              </select>
            </div>
            <!-- Urgensi -->
            <div class="field">
              <label class="flabel">Urgensi <span class="req">*</span></label>
              <select v-model="idUrgensiTerpilih" class="fselect">
                <option disabled value="">Pilih Urgensi</option>
                <option v-for="item in urgensi" :key="item.id_urgensi" :value="item.id_urgensi">
                  {{ item.nama_urgensi }}
                </option>
              </select>
            </div>
            <!-- Pesan Pengelola -->
            <div class="field field--full">
              <label class="flabel">Pesan Pengelola</label>
              <textarea v-model="pesan" class="ftextarea ftextarea--sm" placeholder="Pesan tambahan untuk unit pelaksana (opsional)..."></textarea>
            </div>
          </div>

          <!-- File uploads -->
          <div class="file-section">
            <h4 class="file-section__title">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M7 1.5H3a1 1 0 00-1 1v8a1 1 0 001 1h7a1 1 0 001-1V6M7 1.5L11 5.5M7 1.5V5.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Lampiran Dokumen
            </h4>
            <div class="file-grid">
              <div class="file-field">
                <label class="flabel">Surat Dinas <span class="req">*</span></label>
                <label class="file-upload-btn">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v7M3.5 5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 10.5h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                  {{ suratDinasName || 'Pilih File PDF' }}
                  <input type="file" accept=".pdf" style="display:none" @change="handleFileChange($event,'suratDinas')"/>
                </label>
                <p class="file-note">PDF, maks. 8MB</p>
              </div>
              <div class="file-field">
                <label class="flabel">Lampiran <span class="req">*</span></label>
                <label class="file-upload-btn">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v7M3.5 5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 10.5h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                  {{ lampiranName || 'Pilih File PDF' }}
                  <input type="file" accept=".pdf" style="display:none" @change="handleFileChange($event,'lampiran')"/>
                </label>
                <p class="file-note">PDF, maks. 8MB</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="fbtn fbtn--ghost" @click="router.push('/permintaanBaruPengelola')">Batal</button>
            <button class="fbtn fbtn--primary" :disabled="isLoading || isSubmitted" @click="handleSubmit">
              <svg v-if="!isLoading" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <div v-else class="btn-spinner"></div>
              {{ isLoading ? 'Mengirim...' : 'Kirim Permintaan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:linear-gradient(135deg,var(--cf),var(--ce));padding:1.5rem 2rem 2rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;}
.orb{position:absolute;width:240px;height:240px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:white;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.6);}
.body{padding:1.5rem;max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;}

/* Persyaratan note */
.persyaratan-note{background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:1rem 1.125rem;}
.persyaratan-note__header{display:flex;align-items:center;gap:.5rem;font-size:.8125rem;font-weight:700;color:#78350f;margin-bottom:.5rem;}
.persyaratan-note__header svg{color:#d97706;flex-shrink:0;}
.persyaratan-note__text{font-size:.8rem;color:#92400e;line-height:1.6;white-space:pre-line;}

/* Form card */
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);}
.req-note{margin-left:auto;font-size:.72rem;color:var(--csv);}
.req{color:#ef4444;}
.form-body{padding:1.5rem;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;}
.field{display:flex;flex-direction:column;gap:.35rem;}
.field--full{grid-column:1/-1;}
.flabel{font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;}
.finput,.fselect{padding:.6rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;width:100%;}
.finput:focus,.fselect:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.finput::placeholder{color:var(--csv);}
.finput--readonly{background:var(--cmi);color:var(--cs);cursor:default;font-weight:600;}
.ftextarea{padding:.6rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;resize:vertical;transition:border-color .15s;width:100%;box-sizing:border-box;}
.ftextarea:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.ftextarea::placeholder{color:var(--csv);}
.ftextarea--sm{min-height:70px;}

/* File section */
.file-section{background:var(--cmi);border-radius:12px;padding:1.125rem;margin-bottom:1.25rem;}
.file-section__title{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:700;color:var(--ci);margin-bottom:.875rem;}
.file-section__title svg{color:var(--cm);}
.file-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.file-field{display:flex;flex-direction:column;gap:.35rem;}
.file-upload-btn{display:flex;align-items:center;gap:.5rem;padding:.6rem .875rem;border:1.5px dashed rgba(46,184,106,.4);border-radius:9px;background:white;font-family:var(--fn);font-size:.8rem;font-weight:600;color:var(--ce);cursor:pointer;transition:all .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.file-upload-btn:hover{background:var(--cfo);border-color:var(--cm);}
.file-upload-btn svg{color:var(--cm);flex-shrink:0;}
.file-note{font-size:.68rem;color:var(--csv);}

/* Actions */
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;padding-top:1.25rem;border-top:1px solid rgba(168,200,180,.15);}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.575rem 1.375rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.3);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
.btn-spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.25rem;}.body{padding:1rem;}.form-grid,.file-grid{grid-template-columns:1fr;}}
</style>