<script setup>
import { ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()

onUnmounted(() => { localStorage.removeItem('ID_Sub_Jenis_Pelayanan') })

const layanan      = ref(route.query.layanan || '')
const persyaratan  = ref(route.query.persyaratan || '')
const namaPelapor  = ref([localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' '))
const id_user      = localStorage.getItem('ID_User')
const id_sub_jenis_pelayanan = localStorage.getItem('ID_Sub_Jenis_Pelayanan')
const id_jenis_pelayanan = ref('')
const id_status    = 1

const perihal      = ref('')
const deskripsi    = ref('')
const notelp       = ref('')
const suratDinas   = ref('')
const lampiran     = ref('')
const suratDinasPath = ref(null)
const lampiranPath   = ref(null)
const isSubmitted  = ref(false)
const isLoading    = ref(false)

function handleFileChange(e, field) {
  const file = e.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    alert('Hanya file PDF yang diperbolehkan.')
    e.target.value = ''; return
  }
  if (file.size > 8 * 1024 * 1024) {
    alert('Ukuran file melebihi 8MB.')
    e.target.value = ''; return
  }
  if (field === 'suratDinas') suratDinas.value = file
  else lampiran.value = file
}

async function uploadFiles() {
  if (!suratDinas.value && !lampiran.value) { alert('Harap unggah semua keperluan'); return false }
  const token = localStorage.getItem('Token')
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
    alert('Upload gagal: ' + (e.response?.data?.message || e.message))
    return false
  }
}

async function handleSubmit() {
  if (isSubmitted.value) { alert('Permintaan sudah dikirim.'); return }
  if (!namaPelapor.value || !notelp.value || !perihal.value || !deskripsi.value) {
    alert('Harap isi semua kolom yang bertanda *'); return
  }
  if (isLoading.value) return
  if (!window.confirm('Apakah Anda yakin ingin mengirim permintaan ini?')) return
  isLoading.value = true
  const uploaded = await uploadFiles()
  if (!uploaded) { isLoading.value = false; return }
  const token = localStorage.getItem('Token')
  axios.post('/api/pelayanan/tambah', {
    ID_User: id_user, Nama_Pelapor: namaPelapor.value,
    ID_Sub_Jenis_Pelayanan: id_sub_jenis_pelayanan,
    ID_Jenis_Pelayanan: id_jenis_pelayanan,
    ID_Status: id_status, Perihal: perihal.value,
    Deskripsi: deskripsi.value, No_Telp: notelp.value,
    Surat_Dinas_Path: suratDinasPath.value, Lampiran_Path: lampiranPath.value,
    ID_Unit: null, Pesan_Pengelola: null
  }, { headers: { Authorization: 'Bearer ' + token } })
  .then(() => {
    isSubmitted.value = true
    isLoading.value   = false
    const role = parseInt(localStorage.getItem('id_role'))
    router.push(role === 1 ? '/permintaanDiproses' : '/pelayanan')
  })
  .catch(e => { console.error(e); isLoading.value = false })
}
</script>

<template>
  <div class="formulir">

    <!-- Page Header -->
    <div class="page-header">
      <button class="page-header__back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kembali
      </button>
      <span class="page-header__label">Permintaan Baru</span>
      <h1 class="page-header__title">Formulir Tiket Baru</h1>
      <p class="page-header__sub">Isi informasi di bawah untuk mengajukan permintaan layanan</p>
    </div>

    <div class="body">

      <!-- Persyaratan Banner -->
      <div class="req-banner" v-if="persyaratan">
        <div class="req-banner__header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v6M8 11v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          Persyaratan Pelayanan
        </div>
        <p class="req-banner__text">{{ persyaratan }}</p>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <div class="form-card__header">
          <div class="form-card__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 7h8M6 10h8M6 13h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="form-card__title">Detail Permintaan</h2>
            <p class="form-card__sub">Kolom bertanda <span class="req-star">*</span> wajib diisi</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="form">

          <!-- Layanan (readonly) -->
          <div class="field">
            <label class="field__label">Layanan</label>
            <div class="field__display">{{ layanan }}</div>
          </div>

          <!-- 2 kolom: Pelapor + No Telp -->
          <div class="field-row">
            <div class="field">
              <label class="field__label">Nama Pelapor <span class="req-star">*</span></label>
              <input class="field__input" type="text" v-model="namaPelapor" maxlength="50"/>
            </div>
            <div class="field">
              <label class="field__label">No. Telepon <span class="req-star">*</span></label>
              <input class="field__input" type="text" v-model="notelp" placeholder="Contoh: 08123456789" maxlength="50"/>
            </div>
          </div>

          <!-- Perihal -->
          <div class="field">
            <label class="field__label">Perihal <span class="req-star">*</span></label>
            <input class="field__input" type="text" v-model="perihal" placeholder="Masukkan perihal permintaan" maxlength="50"/>
          </div>

          <!-- Deskripsi -->
          <div class="field">
            <label class="field__label">Deskripsi <span class="req-star">*</span></label>
            <textarea class="field__textarea" v-model="deskripsi" rows="5" placeholder="Jelaskan detail permintaan Anda..."></textarea>
          </div>

          <!-- File uploads -->
          <div class="field-row">
            <div class="field">
              <label class="field__label">Surat Dinas <span class="req-star">*</span></label>
              <div class="file-upload" :class="{ 'file-upload--filled': suratDinas }">
                <input type="file" accept=".pdf" @change="handleFileChange($event, 'suratDinas')" class="file-upload__input" id="suratDinas"/>
                <label for="suratDinas" class="file-upload__label">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 13V5M7 8l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <span>{{ suratDinas ? suratDinas.name : 'Pilih file PDF' }}</span>
                </label>
              </div>
              <p class="field__hint">PDF, maks. 8MB</p>
            </div>
            <div class="field">
              <label class="field__label">Lampiran <span class="req-star">*</span></label>
              <div class="file-upload" :class="{ 'file-upload--filled': lampiran }">
                <input type="file" accept=".pdf" @change="handleFileChange($event, 'lampiran')" class="file-upload__input" id="lampiran"/>
                <label for="lampiran" class="file-upload__label">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 13V5M7 8l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <span>{{ lampiran ? lampiran.name : 'Pilih file PDF' }}</span>
                </label>
              </div>
              <p class="field__hint">PDF, maks. 8MB</p>
            </div>
          </div>

          <!-- Submit -->
          <div class="form__actions">
            <button type="button" class="btn-cancel" @click="$router.back()">Batal</button>
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <svg v-if="isLoading" class="btn-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.3)" stroke-width="2"/>
                <path d="M8 2a6 6 0 016 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8l4 4 8-8" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isLoading ? 'Mengirim...' : 'Kirim Permintaan' }}
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.formulir {
  --color-forest:  #1a3a2a; --color-emerald: #0f5c38; --color-mint: #2eb86a;
  --color-foam:    #e8f4ee; --color-ink:     #0d1a12; --color-stone: #5a7566;
  --color-silver:  #b8ccc2; --color-mist:    #f0f6f2; --color-white: #ffffff;
  --font:          'Plus Jakarta Sans', sans-serif;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-sm:     0 1px 3px rgba(13,26,18,.06);
  --shadow-md:     0 4px 16px rgba(13,26,18,.08);
  --shadow-green:  0 4px 16px rgba(46,184,106,.3);
  font-family: var(--font); min-height: 100vh; background: var(--color-mist);
}

/* PAGE HEADER */
.page-header {
  background:var(--color-forest);
  padding: 1.5rem 2rem 2.5rem;margin:0 0 1.5rem; position: relative; overflow: hidden;border-radius:20px;}
.page-header::after { content: ''; position: absolute; width: 300px; height: 300px; background: var(--color-mint); border-radius: 50%; filter: blur(80px); opacity: .1; top: -100px; right: -60px; pointer-events: none; }
.page-header__back {
  display: inline-flex; align-items: center; gap: .375rem;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
  border-radius: 8px; padding: .375rem .75rem; color: rgba(255,255,255,.8);
  font-family: var(--font); font-size: .75rem; font-weight: 600; cursor: pointer;
  margin-bottom: 1rem; transition: background .15s;
}
.page-header__back:hover { background: rgba(255,255,255,.18); color: white; }
.page-header__label { display: block; font-size: .7rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color:rgba(255,255,255,.74); margin-bottom: .375rem; }
.page-header__title { font-size: clamp(1.375rem, 3vw, 1.875rem); font-weight: 800; color:#ffffff; letter-spacing: -.02em; margin-bottom: .375rem; }
.page-header__sub   { font-size: .875rem; color:rgba(255,255,255,.74); }

/* BODY */
.body { padding: 1.5rem; max-width: 760px; margin: 0 auto; }

/* REQ BANNER */
.req-banner {
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
  padding: 1rem 1.125rem; margin-bottom: 1.25rem;
}
.req-banner__header { display: flex; align-items: center; gap: .5rem; font-size: .8125rem; font-weight: 700; color: #92400e; margin-bottom: .4rem; }
.req-banner__text   { font-size: .8rem; color: #78350f; line-height: 1.6; margin: 0; }

/* FORM CARD */
.form-card { background: var(--color-white); border-radius: 16px; border: 1px solid rgba(168,200,180,.2); box-shadow: var(--shadow-sm); overflow: hidden; }
.form-card__header { display: flex; align-items: center; gap: .875rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-foam); }
.form-card__icon { width: 44px; height: 44px; background: var(--color-foam); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--color-emerald); flex-shrink: 0; }
.form-card__title { font-size: 1rem; font-weight: 800; color: var(--color-ink); letter-spacing: -.01em; margin-bottom: 2px; }
.form-card__sub   { font-size: .75rem; color: var(--color-stone); }
.req-star { color: #ef4444; font-weight: 700; }

/* FORM */
.form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.field__label { font-size: .8rem; font-weight: 700; color: var(--color-charcoal); }
.field__input, .field__textarea {
  font-family: var(--font); font-size: .875rem; color: var(--color-ink);
  background: var(--color-mist); border: 1.5px solid transparent;
  border-radius: 10px; padding: .625rem .875rem; outline: none;
  transition: border-color .15s, background .15s;
}
.field__input:focus, .field__textarea:focus { border-color: var(--color-mint); background: var(--color-white); box-shadow: 0 0 0 3px rgba(46,184,106,.1); }
.field__textarea { resize: vertical; min-height: 100px; }
.field__display { font-size: .875rem; color: var(--color-stone); background: var(--color-mist); border-radius: 10px; padding: .625rem .875rem; font-weight: 600; }
.field__hint { font-size: .7rem; color: var(--color-stone); margin-top: .125rem; }

/* FILE UPLOAD */
.file-upload { position: relative; }
.file-upload__input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.file-upload__label {
  display: flex; align-items: center; gap: .625rem;
  background: var(--color-mist); border: 1.5px dashed rgba(168,200,180,.5);
  border-radius: 10px; padding: .75rem .875rem; cursor: pointer;
  font-size: .8125rem; color: var(--color-stone); transition: all .15s;
}
.file-upload__label:hover { background: var(--color-foam); border-color: var(--color-mint); color: var(--color-emerald); }
.file-upload--filled .file-upload__label { background: var(--color-foam); border-color: var(--color-mint); border-style: solid; color: var(--color-emerald); }
.file-upload__label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ACTIONS */
.form__actions { display: flex; gap: .75rem; justify-content: flex-end; padding-top: .5rem; border-top: 1px solid var(--color-foam); margin-top: .375rem; }
.btn-cancel { padding: .625rem 1.25rem; background: var(--color-mist); border: 1px solid rgba(168,200,180,.3); border-radius: 10px; font-family: var(--font); font-size: .875rem; font-weight: 600; color: var(--color-stone); cursor: pointer; transition: all .15s; }
.btn-cancel:hover { background: var(--color-foam); color: var(--color-emerald); }
.btn-submit {
  display: flex; align-items: center; gap: .5rem;
  padding: .625rem 1.5rem; background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  border: none; border-radius: 10px; font-family: var(--font); font-size: .875rem; font-weight: 700;
  color: white; cursor: pointer; box-shadow: var(--shadow-green); transition: all .2s var(--ease-out);
}
.btn-submit:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(46,184,106,.35); }
.btn-submit:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
.btn-spinner { animation: spin .65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .body { padding: 1rem; }
  .page-header { padding: 1.25rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}
  .field-row { grid-template-columns: 1fr; }
  .form { padding: 1.125rem; }
}
</style>