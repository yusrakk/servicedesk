<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isLoading = ref(true)
const services  = ref([])
const search    = ref('')
const currentPage  = ref(1)
const itemsPerPage = 10
const showModal = ref(false)
const toDelete  = ref({ id: null, nama: '' })
const countdown = ref(5)
const isCounting = ref(false)
let timer = null

function formatDate(d) {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onBeforeMount(() => fetchData())

const fetchData = () => {
  isLoading.value = true
  const token = localStorage.getItem('Token')
  axios.get('/api/jenispelayanan', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      services.value = res.data.map(i => ({
        id: i.ID_Jenis_Pelayanan, nama: i.Nama_Jenis_Pelayanan, tglPembuatan: i.created_at || '-'
      }))
    })
    .catch(console.error)
    .finally(() => { isLoading.value = false })
}

const filteredItems  = computed(() => {
  const q = search.value.toLowerCase()
  return services.value.filter(i => i.nama?.toLowerCase().includes(q))
})
const totalPages     = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => filteredItems.value.slice((currentPage.value-1)*itemsPerPage, currentPage.value*itemsPerPage))
const visiblePages   = computed(() => {
  const pages = [], s = Math.max(1, currentPage.value-2), e = Math.min(totalPages.value, currentPage.value+2)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})
watch(search, () => { currentPage.value = 1 })

function startCountdown() {
  countdown.value = 5; isCounting.value = true; clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 1) countdown.value--
    else { clearInterval(timer); isCounting.value = false }
  }, 1000)
}
function openDelete(item) { toDelete.value = { id: item.id, nama: item.nama }; showModal.value = true; startCountdown() }
function cancelDelete()   { showModal.value = false; clearInterval(timer); isCounting.value = false }
function confirmDelete()  {
  const token = localStorage.getItem('Token')
  axios.delete(`/api/jenispelayanan/delete/${toDelete.value.id}`, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => { services.value = services.value.filter(i => i.id !== toDelete.value.id); showModal.value = false })
    .catch(e => alert(e.response?.data?.message || 'Gagal menghapus jenis pelayanan.'))
}
function editItem(item) {
  router.push({ path: '/ubahPelayanan', query: { id: item.id, nama_jenis_pelayanan: item.nama } })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <span class="page-header__label">Referensi</span>
        <h1 class="page-header__title">Referensi Jenis Pelayanan</h1>
        <p class="page-header__sub">Kelola daftar jenis pelayanan yang tersedia dalam sistem</p>
      </div>
      <button class="btn-tambah" @click="router.push('/tambahPelayanan')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Tambah Jenis Pelayanan
      </button>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" type="text" placeholder="Cari nama jenis pelayanan..." class="search-input"/>
          <span v-if="search" class="search-clear" @click="search=''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <span class="result-count">{{ filteredItems.length }} jenis pelayanan</span>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="10" width="28" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M15 18h14M15 24h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada data jenis pelayanan' }}</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:60px">ID</th>
                <th>Nama Jenis Pelayanan</th>
                <th>Tanggal Dibuat</th>
                <th style="width:100px">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in paginatedItems" :key="i" class="table-row">
                <td><span class="id-chip">#{{ item.id }}</span></td>
                <td>
                  <div class="name-cell">
                    <div class="name-icon">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2L1.7 5l3.3-.5 1.5-3z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
                    </div>
                    <span class="name-text">{{ item.nama }}</span>
                  </div>
                </td>
                <td><span class="date-text">{{ formatDate(item.tglPembuatan) }}</span></td>
                <td>
                  <div class="action-group">
                    <button class="act-btn act-btn--edit" @click="editItem(item)" title="Ubah">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="act-btn act-btn--delete" @click="openDelete(item)" title="Hapus">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.5 7a1 1 0 01-1 .9H4a1 1 0 01-1-.9l-.5-7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
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
          <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{'page-btn--active':currentPage===p}" @click="currentPage=p">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="currentPage++">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4.5A.5.5 0 018.5 4h5a.5.5 0 01.5.5V6M18 6l-.5 11a1.5 1.5 0 01-1.5 1.4H6a1.5 1.5 0 01-1.5-1.4L4 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="modal__title">Hapus Jenis Pelayanan</h3>
          <p class="modal__desc">Yakin ingin menghapus <strong>{{ toDelete.nama }}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div v-if="isCounting" class="modal__countdown">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Tunggu {{ countdown }} detik...
          </div>
          <div class="modal__actions">
            <button class="mbutton mbutton--red" :disabled="isCounting" @click="confirmDelete">{{ isCounting ? `(${countdown})` : 'Ya, Hapus' }}</button>
            <button class="mbutton mbutton--gray" @click="cancelDelete">Batal</button>
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
.body{padding:1.5rem;max-width:900px;margin:0 auto;}
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
.table th{padding:.875rem 1rem;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;text-align:left;}
.table-row{border-bottom:1px solid rgba(168,200,180,.12);transition:background .15s;}
.table-row:last-child{border-bottom:none;}
.table-row:hover{background:var(--cmi);}
.table td{padding:.875rem 1rem;vertical-align:middle;}
.id-chip{font-size:.72rem;font-weight:700;color:var(--cs);font-family:monospace;}
.name-cell{display:flex;align-items:center;gap:.625rem;}
.name-icon{width:26px;height:26px;border-radius:7px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.name-text{font-size:.875rem;font-weight:600;color:var(--ci);}
.date-text{font-size:.8rem;color:var(--cs);}
.action-group{display:flex;align-items:center;gap:.375rem;}
.act-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:var(--cmi);}
.act-btn--edit{color:var(--cs);}
.act-btn--edit:hover{background:var(--cfo);color:var(--ce);border-color:rgba(46,184,106,.3);}
.act-btn--delete{color:var(--cs);}
.act-btn--delete:hover{background:#fef2f2;color:#dc2626;border-color:#fca5a5;}
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:var(--cw);border-radius:20px;padding:2rem;max-width:360px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:pop .2s cubic-bezier(.16,1,.3,1);}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px);}to{opacity:1;transform:none;}}
.modal__icon{width:52px;height:52px;border-radius:50%;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}
.modal__title{font-size:1.0625rem;font-weight:800;color:var(--ci);margin-bottom:.5rem;}
.modal__desc{font-size:.875rem;color:var(--cs);line-height:1.6;margin-bottom:1rem;}
.modal__countdown{display:inline-flex;align-items:center;gap:.4rem;font-size:.75rem;color:var(--csv);background:var(--cmi);padding:.375rem .75rem;border-radius:99px;margin-bottom:1rem;}
.modal__actions{display:flex;gap:.75rem;justify-content:center;}
.mbutton{padding:.5rem 1.25rem;border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.mbutton--red{background:#ef4444;color:white;}
.mbutton--red:disabled{opacity:.4;cursor:not-allowed;}
.mbutton--gray{background:var(--cmi);color:var(--cs);}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.5rem 1.25rem 2rem;}.body{padding:1rem;}}
</style>