<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router   = useRouter()
const isLoading = ref(true)
const referensiStatus = ref([])
const search   = ref('')
const currentPage  = ref(1)
const itemsPerPage = 10

// Status badge config
const statusConfig = {
  'Baru':           { color: '#2563eb', bg: '#dbeafe' },
  'Sedang Diproses':{ color: '#d97706', bg: '#fef3c7' },
  'Ditolak':        { color: '#dc2626', bg: '#fef2f2' },
  'Revisi':         { color: '#ea580c', bg: '#fff7ed' },
  'Selesai':        { color: '#059669', bg: '#ecfdf5' },
  'Tutup':          { color: '#6b7280', bg: '#f3f4f6' },
}

function formatDate(d) {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onBeforeMount(() => fetchData())

const fetchData = () => {
  isLoading.value = true
  const token = localStorage.getItem('Token')
  axios.get('/api/status', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      referensiStatus.value = res.data.map(i => ({
        id: i.ID_Status, nama: i.Nama_Status, tglPembuatan: i.created_at || '-'
      }))
    })
    .catch(console.error)
    .finally(() => { isLoading.value = false })
}

const filteredItems  = computed(() => {
  const q = search.value.toLowerCase()
  return referensiStatus.value.filter(i => i.nama.toLowerCase().includes(q))
})
const totalPages     = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => filteredItems.value.slice((currentPage.value-1)*itemsPerPage, currentPage.value*itemsPerPage))
const visiblePages   = computed(() => {
  const pages = [], s = Math.max(1, currentPage.value-2), e = Math.min(totalPages.value, currentPage.value+2)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})
watch(search, () => { currentPage.value = 1 })

function editStatus(item) {
  router.push({ path: '/ubahStatus', query: { statusId: item.id, nama_status: item.nama } })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <span class="page-header__label">Referensi</span>
        <h1 class="page-header__title">Referensi Status</h1>
        <p class="page-header__sub">Daftar status pelayanan yang digunakan dalam sistem</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <!-- info note: read-only -->
      <div class="info-note">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 5v4M7 4h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        Status bersifat tetap dan tidak dapat ditambah atau dihapus — hanya nama yang dapat diubah.
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" type="text" placeholder="Cari nama status..." class="search-input"/>
          <span v-if="search" class="search-clear" @click="search=''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <span class="result-count">{{ filteredItems.length }} status</span>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="10" width="28" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M15 18h14M15 24h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>Tidak ada hasil pencarian</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:60px">ID</th>
                <th>Nama Status</th>
                <th>Tanggal Dibuat</th>
                <th style="width:80px">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in paginatedItems" :key="i" class="table-row">
                <td><span class="id-chip">#{{ item.id }}</span></td>
                <td>
                  <span class="status-badge"
                    :style="{ color: statusConfig[item.nama]?.color||'#374151', background: statusConfig[item.nama]?.bg||'#f3f4f6' }">
                    <span class="sdot" :style="{ background: statusConfig[item.nama]?.color||'#374151' }"></span>
                    {{ item.nama }}
                  </span>
                </td>
                <td><span class="date-text">{{ formatDate(item.tglPembuatan) }}</span></td>
                <td>
                  <button class="act-btn act-btn--edit" @click="editStatus(item)" title="Ubah">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
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
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:2rem 2rem 2.5rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-radius:20px;}
.page-header__orb{position:absolute;width:280px;height:280px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.page-header__label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.375rem,3vw,1.875rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.375rem;}
.page-header__sub{font-size:.875rem;color:rgba(255,255,255,.74);}
.body{padding:1.5rem;max-width:900px;margin:0 auto;}
.info-note{display:flex;align-items:center;gap:.5rem;font-size:.8125rem;color:var(--cs);background:var(--cfo);border:1px solid rgba(46,184,106,.15);border-radius:10px;padding:.625rem .875rem;margin-bottom:1rem;}
.info-note svg{color:var(--cm);flex-shrink:0;}
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
.status-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .75rem;border-radius:99px;font-size:.78rem;font-weight:700;}
.sdot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.date-text{font-size:.8rem;color:var(--cs);}
.act-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:var(--cmi);color:var(--cs);}
.act-btn--edit:hover{background:var(--cfo);color:var(--ce);border-color:rgba(46,184,106,.3);}
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>