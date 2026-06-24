<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users     = ref([])
const userCount = ref(0)
const isLoading = ref(true)
const isSubmitting = ref(false)
const showForm  = ref(false)
const showModalNonaktif = ref(false)
const showModalAktif    = ref(false)
const targetUser = ref({ id: null, nama: '' })

const form = ref({
  Nama_Depan: '', Nama_Belakang: '', NIP: '', Password: '',
  ID_Role: '', ID_Jabatan: '', ID_Organisasi: '', Status: 'Aktif'
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/user', { headers: { Authorization: 'Bearer ' + token } })
    users.value = res.data
  } catch (err) { console.error(err) }
  finally { isLoading.value = false }
}

const fetchUserCount = async () => {
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/userCount', { headers: { Authorization: 'Bearer ' + token } })
    userCount.value = res.data
  } catch (err) { console.error(err) }
}

const createUser = async () => {
  if (!form.value.Nama_Depan || !form.value.NIP || !form.value.Password) {
    alert('Nama Depan, NIP, dan Password wajib diisi'); return
  }
  isSubmitting.value = true
  try {
    const token = localStorage.getItem('Token')
    await axios.post('/api/user', form.value, { headers: { Authorization: 'Bearer ' + token } })
    resetForm(); showForm.value = false
    fetchUsers(); fetchUserCount()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menambah user.')
  } finally { isSubmitting.value = false }
}

const resetForm = () => {
  form.value = { Nama_Depan:'', Nama_Belakang:'', NIP:'', Password:'', ID_Role:'', ID_Jabatan:'', ID_Organisasi:'', Status:'Aktif' }
}

const openNonaktif = (user) => { targetUser.value = { id: user.ID_User, nama: user.Nama_Depan + ' ' + user.Nama_Belakang }; showModalNonaktif.value = true }
const openAktif    = (user) => { targetUser.value = { id: user.ID_User, nama: user.Nama_Depan + ' ' + user.Nama_Belakang }; showModalAktif.value = true }

const nonaktifkan = async () => {
  try {
    const token = localStorage.getItem('Token')
    await axios.delete(`/api/user/${targetUser.value.id}`, { headers: { Authorization: 'Bearer ' + token } })
    showModalNonaktif.value = false; fetchUsers(); fetchUserCount()
  } catch (err) { alert(err.response?.data?.message || 'Gagal menonaktifkan user.') }
}

const aktifkan = async () => {
  try {
    const token = localStorage.getItem('Token')
    await axios.delete(`/api/user/undo/${targetUser.value.id}`, { headers: { Authorization: 'Bearer ' + token } })
    showModalAktif.value = false; fetchUsers(); fetchUserCount()
  } catch (err) { alert(err.response?.data?.message || 'Gagal mengaktifkan user.') }
}

function getInitials(depan, belakang) {
  return ((depan?.[0] || '') + (belakang?.[0] || '')).toUpperCase()
}

onMounted(() => { fetchUsers(); fetchUserCount() })
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <span class="page-header__label">Admin Panel</span>
        <h1 class="page-header__title">Menu Akun</h1>
        <p class="page-header__sub">Kelola akun pengguna dan pantau aktivitas sistem</p>
      </div>
      <button class="btn-tambah" @click="showForm = !showForm">
        <svg v-if="!showForm" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        {{ showForm ? 'Tutup Form' : 'Tambah User' }}
      </button>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon stat-icon--green">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Total User Aktif</p>
            <p class="stat-value">{{ userCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M6 7h6M6 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Total Akun</p>
            <p class="stat-value">{{ users.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--red">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13 10l3 3M16 10l-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">User Nonaktif</p>
            <p class="stat-value">{{ users.filter(u => u.Status !== 'Aktif').length }}</p>
          </div>
        </div>
      </div>

      <!-- Form Tambah User (collapsible) -->
      <div v-if="showForm" class="form-card">
        <div class="form-card__header">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Formulir Tambah User
          <span class="req-note"><span class="req">*</span> Wajib diisi</span>
        </div>
        <div class="form-body">
          <div class="form-grid">
            <div class="field">
              <label class="flabel">Nama Depan <span class="req">*</span></label>
              <input v-model="form.Nama_Depan" class="finput" placeholder="Nama depan..."/>
            </div>
            <div class="field">
              <label class="flabel">Nama Belakang</label>
              <input v-model="form.Nama_Belakang" class="finput" placeholder="Nama belakang..."/>
            </div>
            <div class="field">
              <label class="flabel">NIP <span class="req">*</span></label>
              <input v-model="form.NIP" class="finput" placeholder="Nomor Induk Pegawai..."/>
            </div>
            <div class="field">
              <label class="flabel">Password <span class="req">*</span></label>
              <input v-model="form.Password" type="password" class="finput" placeholder="Min. 8 karakter..."/>
            </div>
            <div class="field">
              <label class="flabel">ID Role</label>
              <input v-model="form.ID_Role" class="finput" placeholder="ID Role..."/>
            </div>
            <div class="field">
              <label class="flabel">ID Jabatan</label>
              <input v-model="form.ID_Jabatan" class="finput" placeholder="ID Jabatan..."/>
            </div>
            <div class="field">
              <label class="flabel">ID Organisasi</label>
              <input v-model="form.ID_Organisasi" class="finput" placeholder="ID Organisasi..."/>
            </div>
            <div class="field">
              <label class="flabel">Status</label>
              <select v-model="form.Status" class="fselect">
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="fbtn fbtn--ghost" @click="resetForm">Reset</button>
            <button class="fbtn fbtn--primary" :disabled="isSubmitting" @click="createUser">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan User' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Daftar User -->
      <div class="table-card">
        <div class="table-card__header">
          <div class="tch-left">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Daftar User
          </div>
          <span class="tch-count">{{ users.length }} akun</span>
        </div>

        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="users.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="14" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6 38c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>Belum ada user terdaftar</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIP</th>
                <th>Status</th>
                <th style="width:140px">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.ID_User" class="table-row">
                <td>
                  <div class="name-cell">
                    <div class="avatar">{{ getInitials(user.Nama_Depan, user.Nama_Belakang) }}</div>
                    <div>
                      <p class="name-full">{{ user.Nama_Depan }} {{ user.Nama_Belakang }}</p>
                      <p class="name-id">#{{ user.ID_User }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="nip-text">{{ user.NIP }}</span></td>
                <td>
                  <span :class="['status-badge', user.Status === 'Aktif' ? 'status-badge--aktif' : 'status-badge--nonaktif']">
                    <span class="sdot"></span>{{ user.Status }}
                  </span>
                </td>
                <td>
                  <div class="action-group">
                    <button v-if="user.Status === 'Aktif'" class="act-btn act-btn--red" @click="openNonaktif(user)" title="Nonaktifkan">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                      Nonaktif
                    </button>
                    <button v-else class="act-btn act-btn--green" @click="openAktif(user)" title="Aktifkan">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      Aktifkan
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Nonaktifkan -->
    <Teleport to="body">
      <div v-if="showModalNonaktif" class="modal-overlay" @click.self="showModalNonaktif=false">
        <div class="modal">
          <div class="modal__icon modal__icon--red">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M7 11h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="modal__title">Nonaktifkan User</h3>
          <p class="modal__desc">Yakin ingin menonaktifkan akun <strong>{{ targetUser.nama }}</strong>?</p>
          <div class="modal__actions">
            <button class="mbutton mbutton--red" @click="nonaktifkan">Ya, Nonaktifkan</button>
            <button class="mbutton mbutton--gray" @click="showModalNonaktif=false">Batal</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Aktifkan -->
    <Teleport to="body">
      <div v-if="showModalAktif" class="modal-overlay" @click.self="showModalAktif=false">
        <div class="modal">
          <div class="modal__icon modal__icon--green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M7 11l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="modal__title">Aktifkan User</h3>
          <p class="modal__desc">Yakin ingin mengaktifkan kembali akun <strong>{{ targetUser.nama }}</strong>?</p>
          <div class="modal__actions">
            <button class="mbutton mbutton--green" @click="aktifkan">Ya, Aktifkan</button>
            <button class="mbutton mbutton--gray" @click="showModalAktif=false">Batal</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:2rem 2rem 2.5rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-radius:20px;}
.page-header__orb{position:absolute;width:280px;height:280px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.page-header__label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.375rem,3vw,1.875rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.375rem;}
.page-header__sub{font-size:.875rem;color:rgba(255,255,255,.74);}
.btn-tambah{display:flex;align-items:center;gap:.5rem;padding:.6rem 1.125rem;background:var(--cm);border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;color:white;cursor:pointer;white-space:nowrap;transition:opacity .15s;z-index:1;flex-shrink:0;margin-top:.25rem;}
.btn-tambah:hover{opacity:.88;}
.body{padding:1.5rem;max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:1.25rem;}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.stat-card{background:var(--cw);border-radius:14px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);padding:1.125rem 1.25rem;display:flex;align-items:center;gap:.875rem;}
.stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.stat-icon--green{background:var(--cfo);color:var(--cm);}
.stat-icon--blue{background:#dbeafe;color:#2563eb;}
.stat-icon--red{background:#fef2f2;color:#dc2626;}
.stat-label{font-size:.72rem;font-weight:600;color:var(--csv);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.2rem;}
.stat-value{font-size:1.5rem;font-weight:800;color:var(--ci);}

/* Form */
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);}
.req-note{margin-left:auto;font-size:.72rem;font-weight:500;color:var(--csv);}
.req{color:#ef4444;}
.form-body{padding:1.5rem;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;}
.field{display:flex;flex-direction:column;gap:.375rem;}
.flabel{font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;}
.finput,.fselect{padding:.575rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;}
.finput:focus,.fselect:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.finput::placeholder{color:var(--csv);}
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;padding-top:1rem;border-top:1px solid rgba(168,200,180,.15);}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.55rem 1.25rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.25);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}

/* Table */
.table-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.table-card__header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);}
.tch-left{display:flex;align-items:center;gap:.5rem;font-size:.875rem;font-weight:700;color:var(--ci);}
.tch-left svg{color:var(--cm);}
.tch-count{font-size:.75rem;font-weight:600;color:var(--csv);}
.table-wrap{overflow-x:auto;}
.state-center{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:3.5rem 2rem;color:var(--csv);font-size:.875rem;}
.spinner{width:28px;height:28px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.table{width:100%;border-collapse:collapse;}
.table thead tr{background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);}
.table th{padding:.875rem 1.25rem;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;text-align:left;}
.table-row{border-bottom:1px solid rgba(168,200,180,.1);transition:background .15s;}
.table-row:last-child{border-bottom:none;}
.table-row:hover{background:var(--cmi);}
.table td{padding:.875rem 1.25rem;vertical-align:middle;}
.name-cell{display:flex;align-items:center;gap:.75rem;}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--cm),var(--ce));color:white;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.name-full{font-size:.875rem;font-weight:700;color:var(--ci);margin-bottom:.1rem;}
.name-id{font-size:.72rem;color:var(--csv);font-family:monospace;}
.nip-text{font-size:.8125rem;color:var(--cs);font-family:monospace;}
.status-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .7rem;border-radius:99px;font-size:.75rem;font-weight:700;}
.status-badge--aktif{background:#dcfce7;color:#16a34a;}
.status-badge--aktif .sdot{background:#16a34a;}
.status-badge--nonaktif{background:#fef2f2;color:#dc2626;}
.status-badge--nonaktif .sdot{background:#dc2626;}
.sdot{width:5px;height:5px;border-radius:50%;}
.action-group{display:flex;gap:.375rem;}
.act-btn{display:inline-flex;align-items:center;gap:.375rem;padding:.35rem .75rem;border-radius:8px;font-family:var(--fn);font-size:.75rem;font-weight:700;cursor:pointer;border:1.5px solid transparent;transition:all .15s;}
.act-btn--red{background:#fef2f2;color:#dc2626;border-color:#fca5a5;}
.act-btn--red:hover{background:#dc2626;color:white;}
.act-btn--green{background:var(--cfo);color:var(--ce);border-color:rgba(46,184,106,.3);}
.act-btn--green:hover{background:var(--cm);color:white;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:var(--cw);border-radius:20px;padding:2rem;max-width:360px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:pop .2s cubic-bezier(.16,1,.3,1);}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px);}to{opacity:1;transform:none;}}
.modal__icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}
.modal__icon--red{background:#fef2f2;color:#dc2626;}
.modal__icon--green{background:#dcfce7;color:#16a34a;}
.modal__title{font-size:1.0625rem;font-weight:800;color:var(--ci);margin-bottom:.5rem;}
.modal__desc{font-size:.875rem;color:var(--cs);line-height:1.6;margin-bottom:1.25rem;}
.modal__actions{display:flex;gap:.75rem;justify-content:center;}
.mbutton{padding:.5rem 1.25rem;border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.mbutton--red{background:#ef4444;color:white;}
.mbutton--red:hover{background:#dc2626;}
.mbutton--green{background:var(--cm);color:white;}
.mbutton--green:hover{background:var(--ce);}
.mbutton--gray{background:var(--cmi);color:var(--cs);}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}.stats-row{grid-template-columns:1fr;}.form-grid{grid-template-columns:1fr;}}
</style>