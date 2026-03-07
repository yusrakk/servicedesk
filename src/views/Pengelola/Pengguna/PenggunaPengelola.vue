<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isLoading = ref(true)
const daftarPengguna = ref([])
const search = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10
const showModal = ref(false)
const showModalUndo = ref(false)
const namaUserToDelete = ref('')
const namaUserToUndo = ref('')
const idUserToDelete = ref(null)
const idUserToUndo = ref(null)

const statusConfig = {
  'Aktif':    { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  'Nonaktif': { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
}
const roleConfig = {
  'Superadmin': { color: '#7c3aed', bg: '#ede9fe' },
  'Pengelola':  { color: '#1d4ed8', bg: '#dbeafe' },
  'Unit':       { color: '#d97706', bg: '#fef3c7' },
  'Teknis':     { color: '#0891b2', bg: '#e0f2fe' },
  'User':       { color: '#374151', bg: '#f3f4f6' },
}

onBeforeMount(() => fetchDataUser())

const fetchDataUser = () => {
  isLoading.value = true
  const token = localStorage.getItem('Token')
  axios.get('/api/user', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      daftarPengguna.value = res.data.map(item => ({
        id:          item.ID_User,
        nama_depan:  item.Nama_Depan,
        nama_belakang: item.Nama_Belakang,
        NIP:         item.NIP,
        role:        item.user_role.Nama_Role,
        jabatan:     item.user_jabatan?.Nama_Jabatan || '-',
        organisasi:  item.user_organisasi?.Nama_OPD || '-',
        status:      item.Status,
      }))
    })
    .catch(e => console.error(e))
    .finally(() => { isLoading.value = false })
}

const filteredItems = computed(() => {
  let items = daftarPengguna.value.filter(u =>
    u.nama_depan.toLowerCase().includes(search.value.toLowerCase()) ||
    u.nama_belakang.toLowerCase().includes(search.value.toLowerCase()) ||
    u.role.toLowerCase().includes(search.value.toLowerCase()) ||
    u.organisasi.toLowerCase().includes(search.value.toLowerCase())
  )
  if (sortKey.value) {
    items.sort((a, b) => {
      const vA = a[sortKey.value]?.toString().toLowerCase()
      const vB = b[sortKey.value]?.toString().toLowerCase()
      if (vA < vB) return sortOrder.value === 'asc' ? -1 : 1
      if (vA > vB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return items
})
const totalPages     = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => filteredItems.value.slice((currentPage.value-1)*itemsPerPage, currentPage.value*itemsPerPage))
const visiblePages   = computed(() => {
  const pages = [], s = Math.max(1, currentPage.value-2), e = Math.min(totalPages.value, currentPage.value+2)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})
watch(search, () => { currentPage.value = 1 })

function toggleSort(key) {
  if (sortKey.value !== key) { sortKey.value = key; sortOrder.value = 'asc' }
  else sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

function openDelete(user) { idUserToDelete.value = user.id; namaUserToDelete.value = `${user.nama_depan} ${user.nama_belakang}`; showModal.value = true }
function cancelDelete()   { showModal.value = false; idUserToDelete.value = null }
function confirmDelete()  {
  const token = localStorage.getItem('Token')
  axios.delete(`/api/user/${idUserToDelete.value}`, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => { fetchDataUser(); showModal.value = false })
    .catch(e => alert(e.response?.data?.message || 'Gagal menonaktifkan pengguna.'))
}

function openUndo(user)   { idUserToUndo.value = user.id; namaUserToUndo.value = `${user.nama_depan} ${user.nama_belakang}`; showModalUndo.value = true }
function cancelUndo()     { showModalUndo.value = false; idUserToUndo.value = null }
function confirmUndo()    {
  const token = localStorage.getItem('Token')
  axios.delete(`/api/user/undo/${idUserToUndo.value}`, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => { fetchDataUser(); showModalUndo.value = false })
    .catch(e => alert(e.response?.data?.message || 'Gagal mengaktifkan pengguna.'))
}

function ubahPengguna(u)  {
  router.push({ path: '/ubahPengguna', query: { user_id: u.id, nama_depan: u.nama_depan, nama_belakang: u.nama_belakang, role: u.role, jabatan: u.jabatan, organisasi: u.organisasi, status: u.status } })
}
function lihatPengguna(u) {
  router.push({ path: '/lihatPengguna', query: { user_id: u.id, nama_depan: u.nama_depan, nama_belakang: u.nama_belakang, NIP: u.NIP, role: u.role, jabatan: u.jabatan, organisasi: u.organisasi, status: u.status } })
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <span class="page-header__label">Pengelola</span>
        <h1 class="page-header__title">Manajemen Pengguna</h1>
        <p class="page-header__sub">Kelola akun dan hak akses seluruh pengguna sistem</p>
      </div>
      <button class="btn-tambah" @click="router.push('TambahPengguna')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Tambah Pengguna
      </button>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" type="text" placeholder="Cari nama, role, organisasi..." class="search-input"/>
          <span v-if="search" class="search-clear" @click="search=''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <span class="result-count">{{ filteredItems.length }} pengguna</span>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="16" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6 38c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada pengguna terdaftar' }}</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="th-sort" @click="toggleSort('id')">ID
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 1l3 4H2l3-4zM5 9L2 5h6L5 9z" fill="currentColor" opacity=".4"/></svg>
                </th>
                <th class="th-sort" @click="toggleSort('nama_depan')">Nama
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 1l3 4H2l3-4zM5 9L2 5h6L5 9z" fill="currentColor" opacity=".4"/></svg>
                </th>
                <th>Role</th>
                <th>Organisasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, i) in paginatedItems" :key="i" class="table-row">
                <td><span class="id-text">{{ user.id }}</span></td>
                <td>
                  <div class="user-name">
                    <div class="avatar">{{ user.nama_depan[0] }}{{ user.nama_belakang[0] }}</div>
                    <div>
                      <p class="name-full">{{ user.nama_depan }} {{ user.nama_belakang }}</p>
                      <p class="name-nip">NIP: {{ user.NIP }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" :style="{ color: roleConfig[user.role]?.color||'#374151', background: roleConfig[user.role]?.bg||'#f3f4f6' }">
                    {{ user.role }}
                  </span>
                </td>
                <td><span class="meta-text">{{ user.organisasi }}</span></td>
                <td>
                  <span class="badge" :style="{ color: statusConfig[user.status]?.color||'#374151', background: statusConfig[user.status]?.bg||'#f3f4f6', borderColor: statusConfig[user.status]?.border||'transparent' }">
                    <span class="status-dot" :style="{ background: statusConfig[user.status]?.color||'#374151' }"></span>
                    {{ user.status }}
                  </span>
                </td>
                <td>
                  <div class="action-group">
                    <button class="act-btn act-btn--detail" @click="lihatPengguna(user)" title="Detail">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 4v3.5M6.5 9h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    </button>
                    <button class="act-btn act-btn--edit" @click="ubahPengguna(user)" title="Ubah">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button v-if="user.status === 'Aktif'" class="act-btn act-btn--deactivate" @click="openDelete(user)" title="Nonaktifkan">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M4 6.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    </button>
                    <button v-else class="act-btn act-btn--activate" @click="openUndo(user)" title="Aktifkan">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 6.5l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage===1" @click="currentPage--">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 3L4 6.5l4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{ 'page-btn--active': currentPage===p }" @click="currentPage=p">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="currentPage++">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nonaktifkan -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon modal__icon--red">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M7 11h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </div>
          <h3 class="modal__title">Nonaktifkan Pengguna</h3>
          <p class="modal__desc">Yakin ingin menonaktifkan <strong>{{ namaUserToDelete }}</strong>? Pengguna tidak akan bisa login.</p>
          <div class="modal__actions">
            <button class="mbutton mbutton--red" @click="confirmDelete">Ya, Nonaktifkan</button>
            <button class="mbutton mbutton--gray" @click="cancelDelete">Batal</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Aktifkan -->
    <Teleport to="body">
      <div v-if="showModalUndo" class="modal-overlay" @click.self="cancelUndo">
        <div class="modal">
          <div class="modal__icon modal__icon--green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M7 11l3 3 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="modal__title">Aktifkan Pengguna</h3>
          <p class="modal__desc">Yakin ingin mengaktifkan kembali <strong>{{ namaUserToUndo }}</strong>?</p>
          <div class="modal__actions">
            <button class="mbutton mbutton--green" @click="confirmUndo">Ya, Aktifkan</button>
            <button class="mbutton mbutton--gray" @click="cancelUndo">Batal</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:linear-gradient(135deg,var(--cf),var(--ce));padding:2rem 2rem 2.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
.page-header__orb{position:absolute;width:280px;height:280px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.page-header__label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.375rem,3vw,1.875rem);font-weight:800;color:white;letter-spacing:-.02em;margin-bottom:.375rem;}
.page-header__sub{font-size:.875rem;color:rgba(255,255,255,.6);}
.btn-tambah{display:flex;align-items:center;gap:.5rem;padding:.6rem 1.125rem;background:var(--cm);border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;color:white;cursor:pointer;white-space:nowrap;transition:opacity .15s;z-index:1;flex-shrink:0;margin-top:.25rem;}
.btn-tambah:hover{opacity:.88;}
.body{padding:1.5rem;max-width:1200px;margin:0 auto;}
.toolbar{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;}
.search-box{flex:1;display:flex;align-items:center;gap:.625rem;background:var(--cw);border:1.5px solid rgba(168,200,180,.3);border-radius:12px;padding:.625rem .875rem;box-shadow:var(--sh);transition:border-color .15s;}
.search-box:focus-within{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.search-box svg{color:var(--csv);flex-shrink:0;}
.search-input{flex:1;border:none;outline:none;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:transparent;}
.search-input::placeholder{color:var(--csv);}
.search-clear{cursor:pointer;color:var(--csv);display:flex;}
.result-count{font-size:.75rem;font-weight:600;color:var(--cs);white-space:nowrap;}
.table-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.table-wrap{overflow-x:auto;}
.state-center{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:4rem 2rem;color:var(--csv);font-size:.875rem;}
.spinner{width:28px;height:28px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.table{width:100%;border-collapse:collapse;}
.table thead tr{background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);}
.table th{padding:.875rem 1rem;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;text-align:left;white-space:nowrap;}
.th-sort{cursor:pointer;user-select:none;display:flex;align-items:center;gap:.35rem;}
.th-sort:hover{color:var(--ce);}
.table-row{border-bottom:1px solid rgba(168,200,180,.12);transition:background .15s;}
.table-row:last-child{border-bottom:none;}
.table-row:hover{background:var(--cmi);}
.table td{padding:.875rem 1rem;vertical-align:middle;}
.id-text{font-size:.75rem;font-weight:700;color:var(--csv);}
.user-name{display:flex;align-items:center;gap:.75rem;}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--cm),var(--ce));color:white;font-size:.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:.03em;}
.name-full{font-size:.875rem;font-weight:700;color:var(--ci);margin-bottom:.1rem;}
.name-nip{font-size:.72rem;color:var(--csv);}
.meta-text{font-size:.8rem;color:var(--cs);}
.badge{display:inline-flex;align-items:center;gap:.35rem;padding:.25rem .75rem;border-radius:99px;font-size:.72rem;font-weight:700;border:1.5px solid transparent;white-space:nowrap;}
.status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.action-group{display:flex;align-items:center;gap:.375rem;}
.act-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:var(--cmi);}
.act-btn--detail{color:var(--cs);}
.act-btn--detail:hover{background:#e0f2fe;color:#0284c7;border-color:#bae6fd;}
.act-btn--edit{color:var(--cs);}
.act-btn--edit:hover{background:var(--cfo);color:var(--ce);border-color:rgba(46,184,106,.3);}
.act-btn--deactivate{color:var(--cs);}
.act-btn--deactivate:hover{background:#fef2f2;color:#dc2626;border-color:#fca5a5;}
.act-btn--activate{color:var(--cs);}
.act-btn--activate:hover{background:#ecfdf5;color:#059669;border-color:#6ee7b7;}
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:var(--cw);border-radius:20px;padding:2rem;max-width:380px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:pop .2s cubic-bezier(.16,1,.3,1);}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
.modal__icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}
.modal__icon--red{background:#fef2f2;color:#dc2626;}
.modal__icon--green{background:#ecfdf5;color:#059669;}
.modal__title{font-size:1.0625rem;font-weight:800;color:var(--ci);margin-bottom:.5rem;letter-spacing:-.01em;}
.modal__desc{font-size:.875rem;color:var(--cs);line-height:1.6;margin-bottom:1.5rem;}
.modal__actions{display:flex;gap:.75rem;justify-content:center;}
.mbutton{padding:.5rem 1.25rem;border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:opacity .15s;}
.mbutton:hover{opacity:.88;}
.mbutton--red{background:#ef4444;color:white;}
.mbutton--green{background:var(--cm);color:white;}
.mbutton--gray{background:var(--cmi);color:var(--cs);}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.5rem 1.25rem 2rem;}.body{padding:1rem;}}
</style>