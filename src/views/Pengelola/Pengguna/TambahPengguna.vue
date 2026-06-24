<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const Nama_Depan         = ref('')
const Nama_Belakang      = ref('')
const NIP                = ref('')
const status             = ref('')
const password           = ref('')
const konfirmasiPassword = ref('')
const showPass           = ref(false)
const showPassConfirm    = ref(false)
const isSubmitting       = ref(false)

const pilihanRole        = ref([])
const idRoleTerpilih     = ref('')
const pilihanJabatan     = ref([])
const idJabatanTerpilih  = ref('')
const pilihanInduk       = ref([])
const idOrganisasiTerpilih = ref('')

const token = localStorage.getItem('Token')
const hdr   = { Authorization: 'Bearer ' + token }

Promise.all([
  axios.get('/api/role',       { headers: hdr }),
  axios.get('/api/jabatan',    { headers: hdr }),
  axios.get('/api/organisasi', { headers: hdr }),
]).then(([roleRes, jabRes, orgRes]) => {
  pilihanRole.value    = roleRes.data.map(i => ({ id: i.ID_Role,       label: i.Nama_Role }))
  pilihanJabatan.value = jabRes.data.map(i =>  ({ id: i.ID_Jabatan,    label: i.Nama_Jabatan }))
  pilihanInduk.value   = orgRes.data.map(i =>  ({ id: i.ID_Organisasi, label: i.Nama_OPD }))
}).catch(console.error)

function handleSubmit() {
  if (!Nama_Depan.value || !Nama_Belakang.value || !NIP.value ||
      !idRoleTerpilih.value || !idJabatanTerpilih.value || !idOrganisasiTerpilih.value ||
      !status.value || !password.value || !konfirmasiPassword.value) {
    alert('Harap isi semua kolom yang bertanda *'); return
  }
  if (NIP.value.length < 4)         { alert('NIP minimal 4 digit'); return }
  if (password.value.length < 8)    { alert('Password minimal 8 karakter'); return }
  if (password.value !== konfirmasiPassword.value) { alert('Konfirmasi password tidak cocok!'); return }

  isSubmitting.value = true
  axios.post('/api/user', {
    Nama_Depan: Nama_Depan.value, Nama_Belakang: Nama_Belakang.value,
    NIP: NIP.value, ID_Role: idRoleTerpilih.value,
    ID_Jabatan: idJabatanTerpilih.value, ID_Organisasi: idOrganisasiTerpilih.value,
    Password: password.value, Status: status.value
  }, { headers: hdr })
  .then(() => router.push('/pengguna'))
  .catch(e => {
    if (e.response?.status === 400) alert(e.response.data.message || 'NIP sudah digunakan!')
    else if (e.response?.status === 422) { const err = e.response.data.errors; alert(err[Object.keys(err)[0]][0]) }
    else alert('Terjadi kesalahan: ' + (e.response?.data?.message || e.message))
  })
  .finally(() => { isSubmitting.value = false })
}

function handleReset() {
  Nama_Depan.value = ''; Nama_Belakang.value = ''; NIP.value = ''
  status.value = ''; password.value = ''; konfirmasiPassword.value = ''
  idRoleTerpilih.value = ''; idJabatanTerpilih.value = ''; idOrganisasiTerpilih.value = ''
}
</script>

<template>
  <div class="form-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/pengguna')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="page-header__label">Pengelola · Pengguna</span>
        <h1 class="page-header__title">Tambah Pengguna</h1>
        <p class="page-header__sub">Buat akun pengguna baru untuk mengakses sistem</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="form-card">
        <div class="form-card__header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Formulir Tambah Pengguna
          <span class="req-note"><span class="req">*</span> Wajib diisi</span>
        </div>
        <div class="form-body">
          <div class="form-row">
            <div class="field">
              <label class="field__label">Nama Depan <span class="req">*</span></label>
              <input v-model="Nama_Depan" type="text" class="field__input" placeholder="Masukkan nama depan"/>
            </div>
            <div class="field">
              <label class="field__label">Nama Belakang <span class="req">*</span></label>
              <input v-model="Nama_Belakang" type="text" class="field__input" placeholder="Masukkan nama belakang"/>
            </div>
          </div>
          <div class="field">
            <label class="field__label">NIP <span class="req">*</span></label>
            <input v-model="NIP" type="text" class="field__input" placeholder="Nomor Induk Pegawai (min. 4 digit)"/>
          </div>
          <div class="form-row">
            <div class="field">
              <label class="field__label">Role <span class="req">*</span></label>
              <select v-model="idRoleTerpilih" class="field__select">
                <option value="" disabled>Pilih Role</option>
                <option v-for="o in pilihanRole" :key="o.id" :value="o.id">{{ o.label }}</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Jabatan <span class="req">*</span></label>
              <select v-model="idJabatanTerpilih" class="field__select">
                <option value="" disabled>Pilih Jabatan</option>
                <option v-for="o in pilihanJabatan" :key="o.id" :value="o.id">{{ o.label }}</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field__label">Perangkat Daerah / Organisasi <span class="req">*</span></label>
            <select v-model="idOrganisasiTerpilih" class="field__select">
              <option value="" disabled>Pilih Perangkat Daerah</option>
              <option v-for="o in pilihanInduk" :key="o.id" :value="o.id">{{ o.label }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label">Status <span class="req">*</span></label>
            <select v-model="status" class="field__select">
              <option value="" disabled>Pilih Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
          <div class="divider"></div>
          <div class="form-row">
            <div class="field">
              <label class="field__label">Password <span class="req">*</span></label>
              <div class="pass-wrap">
                <input v-model="password" :type="showPass?'text':'password'" class="field__input" placeholder="Min. 8 karakter"/>
                <button type="button" class="pass-eye" @click="showPass=!showPass">
                  <svg v-if="!showPass" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 3C4 3 1 7.5 1 7.5S4 12 7.5 12 14 7.5 14 7.5 11 3 7.5 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 1l13 13M6.3 6.4A2 2 0 009.6 9.7M4.2 4.3C2.5 5.4 1 7.5 1 7.5S4 12 7.5 12c1.1 0 2.1-.3 3-.7M7.5 3c3.5 0 6.5 4.5 6.5 4.5s-.6.9-1.7 1.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            <div class="field">
              <label class="field__label">Konfirmasi Password <span class="req">*</span></label>
              <div class="pass-wrap">
                <input v-model="konfirmasiPassword" :type="showPassConfirm?'text':'password'" class="field__input" placeholder="Ulangi password"/>
                <button type="button" class="pass-eye" @click="showPassConfirm=!showPassConfirm">
                  <svg v-if="!showPassConfirm" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 3C4 3 1 7.5 1 7.5S4 12 7.5 12 14 7.5 14 7.5 11 3 7.5 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 1l13 13M6.3 6.4A2 2 0 009.6 9.7M4.2 4.3C2.5 5.4 1 7.5 1 7.5S4 12 7.5 12c1.1 0 2.1-.3 3-.7M7.5 3c3.5 0 6.5 4.5 6.5 4.5s-.6.9-1.7 1.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="fbtn fbtn--ghost" @click="handleReset">Reset Form</button>
            <button type="button" class="fbtn fbtn--primary" :disabled="isSubmitting" @click="handleSubmit">
              <svg v-if="isSubmitting" width="14" height="14" viewBox="0 0 14 14" fill="none" style="animation:spin .6s linear infinite"><circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,.3)" stroke-width="2"/><path d="M7 2a5 5 0 015 5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;border-radius:20px;}
.page-header::after{content:'';position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.body{padding:1.5rem;max-width:760px;margin:0 auto;}
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);flex-shrink:0;}
.req-note{margin-left:auto;font-size:.72rem;font-weight:500;color:var(--csv);}
.req{color:#ef4444;}
.form-body{padding:1.5rem;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.field{margin-bottom:1rem;}
.field__label{display:block;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.field__input,.field__select{width:100%;padding:.575rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.field__input:focus,.field__select:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.field__input::placeholder{color:var(--csv);}
.pass-wrap{position:relative;}
.pass-wrap .field__input{padding-right:2.5rem;}
.pass-eye{position:absolute;right:.625rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--csv);display:flex;padding:0;}
.pass-eye:hover{color:var(--cs);}
.divider{height:1px;background:rgba(168,200,180,.2);margin:1rem 0 1.25rem;}
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.575rem 1.375rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.3);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
@keyframes spin{to{transform:rotate(360deg);}}
@media(max-width:640px){.form-row{grid-template-columns:1fr;}.page-header{flex-direction:column;padding:1.25rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>