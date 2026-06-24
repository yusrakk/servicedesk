<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router  = useRouter()
const userID  = localStorage.getItem('ID_User')
const gambar  = ref(localStorage.getItem('src_gambar') || '')

const DataDiri = reactive({ namaDepan: '', namaBelakang: '', nip: '' })
const Password = reactive({ lama: '', baru: '', konfirmasi: '' })
const showPass = reactive({ lama: false, baru: false, konfirmasi: false })

const showOverlay    = ref(false)
const selectedImage  = ref(null)
const newImageFile   = ref(null)
const fileInput      = ref(null)
const isSavingData   = ref(false)
const isSavingPass   = ref(false)
const isUploadingImg = ref(false)
const isDeletingImg  = ref(false)

const imageSrc = computed(() => {
  if (gambar.value && gambar.value !== 'null') return `/images/${gambar.value}?t=${Date.now()}`
  return null
})
const previewSrc = computed(() => selectedImage.value || imageSrc.value)
const initials   = computed(() =>
  ((DataDiri.namaDepan?.[0] || '') + (DataDiri.namaBelakang?.[0] || '')).toUpperCase()
)

onMounted(() => {
  DataDiri.namaDepan    = localStorage.getItem('nama_depan') || ''
  DataDiri.namaBelakang = localStorage.getItem('nama_belakang') || ''
  DataDiri.nip          = localStorage.getItem('nip_user') || ''
})

// === Foto ===
function triggerFileInput() { fileInput.value?.click() }

function handleImageSelect(e) {
  const file = e.target.files[0]
  if (file && ['image/png','image/jpeg'].includes(file.type)) {
    selectedImage.value = URL.createObjectURL(file)
    newImageFile.value  = file
  } else {
    alert('Hanya mendukung PNG atau JPEG')
    selectedImage.value = null; newImageFile.value = null
  }
}

function uploadSelectedImage() {
  if (!newImageFile.value) return
  isUploadingImg.value = true
  const token    = localStorage.getItem('Token')
  const formData = new FormData()
  formData.append('Gambar_Path', newImageFile.value)
  formData.append('ID_User', userID)
  axios.post('/api/user/profilepict', formData, {
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }
  })
    .then(res => {
      gambar.value = res.data.nama_file
      localStorage.setItem('src_gambar', res.data.nama_file)
      window.dispatchEvent(new Event('gambar-changed'))
      selectedImage.value = null; newImageFile.value = null; showOverlay.value = false
    })
    .catch(e => alert(e.response?.data?.message || 'Gagal upload foto.'))
    .finally(() => { isUploadingImg.value = false })
}

function cancelImageChange() { selectedImage.value = null; newImageFile.value = null; showOverlay.value = false }

function removeImage() {
  if (!confirm('Yakin ingin menghapus foto profil?')) return
  isDeletingImg.value = true
  const token = localStorage.getItem('Token')
  axios.delete('/api/user/profilepict', {
    data: { ID_User: userID },
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => {
      gambar.value = res.data.nama_file
      localStorage.setItem('src_gambar', res.data.nama_file)
      window.dispatchEvent(new Event('gambar-changed'))
    })
    .catch(e => alert(e.response?.data?.message || 'Gagal menghapus foto.'))
    .finally(() => { isDeletingImg.value = false })
}

// === Data Diri ===
function saveProfileData() {
  if (!DataDiri.namaDepan.trim()) { alert('Nama Depan wajib diisi'); return }
  isSavingData.value = true
  const token = localStorage.getItem('Token')
  axios.put('/api/user/profiledata', {
    ID_User: userID, Nama_Depan: DataDiri.namaDepan,
    Nama_Belakang: DataDiri.namaBelakang, NIP: DataDiri.nip
  }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => {
      localStorage.setItem('nama_depan', DataDiri.namaDepan)
      localStorage.setItem('nama_belakang', DataDiri.namaBelakang)
      localStorage.setItem('nip_user', DataDiri.nip)
      window.dispatchEvent(new Event('profile-data-changed'))
      router.push('/profileSaya')
    })
    .catch(e => alert(e.response?.data?.message || 'Gagal menyimpan data diri.'))
    .finally(() => { isSavingData.value = false })
}

// === Password ===
function savePassword() {
  if (!Password.lama)  { alert('Password lama wajib diisi'); return }
  if (!Password.baru)  { alert('Password baru wajib diisi'); return }
  if (Password.baru !== Password.konfirmasi) { alert('Konfirmasi password tidak cocok'); return }
  if (Password.baru.length < 8) { alert('Password baru minimal 8 karakter'); return }
  isSavingPass.value = true
  const token = localStorage.getItem('Token')
  axios.put('/api/user/profile', {
    ID_User: userID, PasswordLama: Password.lama, PasswordBaru: Password.baru
  }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => { router.push('/profileSaya') })
    .catch(e => alert(e.response?.data?.message || 'Gagal mengubah password.'))
    .finally(() => { isSavingPass.value = false })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/profileSaya')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="page-header__label">Akun Saya</span>
        <h1 class="page-header__title">Edit Profil</h1>
        <p class="page-header__sub">Perbarui foto, data diri, dan password akun Anda</p>
      </div>
      <div class="orb"></div>
    </div>

    <div class="body">
      <div class="grid">

        <!-- Kolom Kiri: Foto Profil -->
        <div class="photo-card">
          <div class="photo-card__header">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M5 3V2.5a2 2 0 014 0V3" stroke="currentColor" stroke-width="1.3"/></svg>
            Foto Profil
          </div>
          <div class="photo-body">
            <div class="avatar-wrap">
              <img v-if="imageSrc" :src="imageSrc" class="avatar-img" alt="Foto Profil"/>
              <div v-else class="avatar-initials">{{ initials || '?' }}</div>
            </div>
            <p class="photo-hint">Klik "Ubah Foto" untuk mengganti gambar profil. Format PNG/JPEG.</p>
            <div class="photo-actions">
              <button class="pbtn pbtn--blue" @click="showOverlay=true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2l2 2-6 6H2V8l6-6z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Ubah Foto
              </button>
              <button class="pbtn pbtn--red" :disabled="isDeletingImg" @click="removeImage">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M9.5 3l-.4 6.5a1 1 0 01-1 .9H3.9a1 1 0 01-1-.9L2.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                {{ isDeletingImg ? 'Menghapus...' : 'Hapus Foto' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Kolom Tengah: Data Diri -->
        <div class="form-card">
          <div class="form-card__header">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Ubah Data Diri
            <span class="req-note"><span class="req">*</span> Wajib diisi</span>
          </div>
          <div class="form-body">
            <div class="field">
              <label class="flabel">Nama Depan <span class="req">*</span></label>
              <input v-model="DataDiri.namaDepan" class="finput" placeholder="Nama depan..."/>
            </div>
            <div class="field">
              <label class="flabel">Nama Belakang</label>
              <input v-model="DataDiri.namaBelakang" class="finput" placeholder="Nama belakang..."/>
            </div>
            <div class="field">
              <label class="flabel">NIP</label>
              <input v-model="DataDiri.nip" class="finput" placeholder="Nomor Induk Pegawai..."/>
            </div>
            <div class="form-actions">
              <button class="fbtn fbtn--ghost" @click="router.push('/profileSaya')">Batal</button>
              <button class="fbtn fbtn--primary" :disabled="isSavingData" @click="saveProfileData">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ isSavingData ? 'Menyimpan...' : 'Simpan Data' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Password -->
        <div class="form-card">
          <div class="form-card__header">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="6" width="8" height="7" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M5 6V4a2 2 0 014 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Ubah Password
            <span class="req-note"><span class="req">*</span> Wajib diisi</span>
          </div>
          <div class="form-body">
            <div class="info-note">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6 4v3M6 8.5h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Kosongkan jika tidak ingin mengganti password.
            </div>
            <div class="field">
              <label class="flabel">Password Lama <span class="req">*</span></label>
              <div class="input-wrap">
                <input v-model="Password.lama" :type="showPass.lama ? 'text':'password'" class="finput finput--pass" placeholder="Password saat ini..."/>
                <button class="eye-btn" type="button" @click="showPass.lama=!showPass.lama">
                  <svg v-if="!showPass.lama" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M2 2l10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            <div class="field">
              <label class="flabel">Password Baru <span class="req">*</span></label>
              <div class="input-wrap">
                <input v-model="Password.baru" :type="showPass.baru ? 'text':'password'" class="finput finput--pass" placeholder="Min. 8 karakter..."/>
                <button class="eye-btn" type="button" @click="showPass.baru=!showPass.baru">
                  <svg v-if="!showPass.baru" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M2 2l10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            <div class="field">
              <label class="flabel">Konfirmasi Password Baru <span class="req">*</span></label>
              <div class="input-wrap">
                <input v-model="Password.konfirmasi" :type="showPass.konfirmasi ? 'text':'password'" class="finput finput--pass" placeholder="Ulangi password baru..."/>
                <button class="eye-btn" type="button" @click="showPass.konfirmasi=!showPass.konfirmasi">
                  <svg v-if="!showPass.konfirmasi" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M2 2l10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
              </div>
              <p v-if="Password.baru && Password.konfirmasi && Password.baru !== Password.konfirmasi" class="error-text">Password tidak cocok</p>
            </div>
            <div class="form-actions">
              <button class="fbtn fbtn--ghost" @click="router.push('/profileSaya')">Batal</button>
              <button class="fbtn fbtn--primary" :disabled="isSavingPass" @click="savePassword">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ isSavingPass ? 'Menyimpan...' : 'Simpan Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay Ubah Foto -->
    <Teleport to="body">
      <div v-if="showOverlay" class="modal-overlay" @click.self="cancelImageChange">
        <div class="photo-modal">
          <button class="modal-close" @click="cancelImageChange">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <div class="photo-modal__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="11" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M7 5V4a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.4"/></svg>
          </div>
          <h3 class="photo-modal__title">Ubah Foto Profil</h3>
          <div class="photo-preview-wrap">
            <img v-if="previewSrc" :src="previewSrc" class="photo-preview-img" alt="Preview"/>
            <div v-else class="photo-preview-placeholder">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
          </div>
          <input type="file" ref="fileInput" @change="handleImageSelect" accept="image/png,image/jpeg" style="display:none"/>
          <button class="pbtn pbtn--blue" style="margin-bottom:.75rem" @click="triggerFileInput">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v6M3 5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 9h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            Pilih Foto
          </button>
          <div class="photo-modal__actions">
            <button class="fbtn fbtn--primary" :disabled="!newImageFile || isUploadingImg" @click="uploadSelectedImage">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isUploadingImg ? 'Mengupload...' : 'Simpan Foto' }}
            </button>
            <button class="fbtn fbtn--ghost" @click="cancelImageChange">Batal</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;border-radius:20px;}
.orb{position:absolute;width:240px;height:240px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.body{padding:1.5rem;max-width:1100px;margin:0 auto;}
.grid{display:grid;grid-template-columns:220px 1fr 1fr;gap:1.25rem;align-items:start;}

/* Photo card */
.photo-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.photo-card__header{display:flex;align-items:center;gap:.5rem;padding:.875rem 1.25rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.8125rem;font-weight:700;color:var(--ci);}
.photo-card__header svg{color:var(--cm);}
.photo-body{padding:1.5rem;display:flex;flex-direction:column;align-items:center;gap:1rem;}
.avatar-wrap{width:100px;height:100px;flex-shrink:0;}
.avatar-img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 16px rgba(13,26,18,.12);}
.avatar-initials{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--cm),var(--ce));color:white;font-size:1.75rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(13,26,18,.12);}
.photo-hint{font-size:.72rem;color:var(--csv);text-align:center;line-height:1.5;}
.photo-actions{display:flex;flex-direction:column;gap:.5rem;width:100%;}
.pbtn{display:flex;align-items:center;justify-content:center;gap:.375rem;padding:.5rem .875rem;border-radius:9px;font-family:var(--fn);font-size:.78rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;width:100%;}
.pbtn--blue{background:#dbeafe;color:#2563eb;}
.pbtn--blue:hover{background:#2563eb;color:white;}
.pbtn--red{background:#fef2f2;color:#dc2626;}
.pbtn--red:hover{background:#dc2626;color:white;}
.pbtn--red:disabled{opacity:.5;cursor:not-allowed;}

/* Form cards */
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.5rem;padding:.875rem 1.25rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.8125rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);}
.req-note{margin-left:auto;font-size:.7rem;color:var(--csv);}
.req{color:#ef4444;}
.form-body{padding:1.25rem;}
.info-note{display:flex;align-items:center;gap:.4rem;font-size:.75rem;color:var(--cs);background:var(--cfo);border:1px solid rgba(46,184,106,.15);border-radius:8px;padding:.5rem .75rem;margin-bottom:1rem;}
.info-note svg{color:var(--cm);flex-shrink:0;}
.field{margin-bottom:.875rem;}
.flabel{display:block;font-size:.7rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem;}
.finput{width:100%;padding:.575rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.finput:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.finput::placeholder{color:var(--csv);}
.finput--pass{padding-right:2.5rem;}
.input-wrap{position:relative;}
.eye-btn{position:absolute;right:.625rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--csv);display:flex;padding:0;}
.eye-btn:hover{color:var(--cs);}
.error-text{font-size:.72rem;color:#ef4444;margin-top:.25rem;}
.form-actions{display:flex;justify-content:flex-end;gap:.625rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(168,200,180,.15);}
.fbtn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.125rem;border-radius:9px;font-family:var(--fn);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 3px 10px rgba(46,184,106,.25);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}

/* Photo modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;}
.photo-modal{background:var(--cw);border-radius:20px;padding:1.75rem 1.5rem;width:90%;max-width:340px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:pop .2s cubic-bezier(.16,1,.3,1);position:relative;}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px);}to{opacity:1;transform:none;}}
.modal-close{position:absolute;top:.875rem;right:.875rem;width:28px;height:28px;border-radius:8px;background:var(--cmi);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--cs);}
.modal-close:hover{background:#fef2f2;color:#dc2626;}
.photo-modal__icon{width:48px;height:48px;border-radius:50%;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;margin:0 auto .75rem;}
.photo-modal__title{font-size:1rem;font-weight:800;color:var(--ci);margin-bottom:1rem;}
.photo-preview-wrap{margin-bottom:1rem;}
.photo-preview-img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 16px rgba(13,26,18,.12);}
.photo-preview-placeholder{width:100px;height:100px;border-radius:50%;background:var(--cmi);display:flex;align-items:center;justify-content:center;margin:0 auto;color:var(--csv);}
.photo-modal__actions{display:flex;gap:.625rem;justify-content:center;margin-top:.5rem;}

@media(max-width:900px){.grid{grid-template-columns:1fr;}.body{padding:1rem;}.page-header{flex-direction:column;padding:1.25rem;margin:0 0 1.5rem;border-radius:20px;}}
</style>