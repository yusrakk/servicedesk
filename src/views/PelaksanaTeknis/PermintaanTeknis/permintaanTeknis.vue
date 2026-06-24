<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router   = useRouter()
const isLoading = ref(true)
const layananData = ref([])
const search    = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const sortKey   = ref('')
const sortOrder = ref(null)

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })
}

const statusConfig = {
  'Baru':             { color: '#2563eb', bg: '#dbeafe' },
  'Sedang Diproses':  { color: '#d97706', bg: '#fef3c7' },
  'Ditolak':          { color: '#dc2626', bg: '#fef2f2' },
  'Revisi':           { color: '#ea580c', bg: '#fff7ed' },
  'Selesai':          { color: '#059669', bg: '#ecfdf5' },
  'Tutup':            { color: '#6b7280', bg: '#f3f4f6' },
}

const urgensiConfig = {
  'Rendah':  { color: '#16a34a', bg: '#dcfce7' },
  'Sedang':  { color: '#d97706', bg: '#fef3c7' },
  'Tinggi':  { color: '#dc2626', bg: '#fef2f2' },
  'Kritis':  { color: '#7c3aed', bg: '#f3e8ff' },
}

onMounted(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/teknis/pelayanan/proses', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      layananData.value = res.data.map(i => ({
        noTiket:   i.ID_Pelayanan,
        perihal:   i.Perihal,
        prioritas: i.urgensi_pelayanan?.Nama_Urgensi || '-',
        teknis:    i.teknis_pelayanan?.Nama_Depan || '-',
        tanggal:   i.created_at,
        organisasi:i.user?.user_organisasi?.Nama_OPD || '-',
        status:    i.status_pelayanan?.Nama_Status || '-',
      }))
    })
    .catch(console.error)
    .finally(() => { isLoading.value = false })
})

function lihatDetail(item) {
  router.push({ name: 'DetailPermintaanTeknis', query: { layanan: item.noTiket } })
}

function toggleSort(key) {
  if (sortKey.value !== key) { sortKey.value = key; sortOrder.value = 'asc' }
  else if (sortOrder.value === 'asc') { sortOrder.value = 'desc' }
  else { sortKey.value = ''; sortOrder.value = null }
}

const filteredItems = computed(() => {
  const q = search.value.toLowerCase()
  let items = layananData.value.filter(i =>
    i.perihal.toLowerCase().includes(q) ||
    i.noTiket.toString().toLowerCase().includes(q) ||
    i.organisasi.toLowerCase().includes(q) ||
    i.prioritas.toLowerCase().includes(q) ||
    i.status.toLowerCase().includes(q) ||
    formatDate(i.tanggal).toLowerCase().includes(q)
  )
  if (sortKey.value && sortOrder.value) {
    items = [...items].sort((a, b) => {
      const va = a[sortKey.value]?.toString().toLowerCase()
      const vb = b[sortKey.value]?.toString().toLowerCase()
      if (va < vb) return sortOrder.value === 'asc' ? -1 : 1
      if (va > vb) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return items
})
const totalPages    = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => filteredItems.value.slice((currentPage.value-1)*itemsPerPage, currentPage.value*itemsPerPage))
const visiblePages  = computed(() => {
  const pages = [], s = Math.max(1, currentPage.value-2), e = Math.min(totalPages.value, currentPage.value+2)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})
watch(search, () => { currentPage.value = 1 })
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <span class="page-header__label">Pelaksana Teknis</span>
        <h1 class="page-header__title">Permintaan Pelayanan</h1>
        <p class="page-header__sub">Daftar permintaan yang sedang dalam penanganan teknis</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" type="text" class="search-input" placeholder="Cari perihal, organisasi, status..."/>
          <span v-if="search" class="search-clear" @click="search=''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <span class="result-count">{{ filteredItems.length }} permintaan</span>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="10" width="28" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M15 22h14M15 28h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Tidak ada permintaan pelayanan' }}</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:90px">No. Tiket</th>
                <th>Perihal</th>
                <th style="width:110px">Prioritas</th>
                <th style="width:120px">Tanggal</th>
                <th style="width:140px;cursor:pointer" @click="toggleSort('status')">
                  Status
                  <span class="sort-icon">{{ sortKey==='status' ? (sortOrder==='asc'?'↑':'↓') : '↕' }}</span>
                </th>
                <th style="width:80px">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in paginatedItems" :key="i" class="table-row">
                <td><span class="ticket-chip">#{{ item.noTiket }}</span></td>
                <td>
                  <div class="perihal-cell">
                    <span class="perihal-text">{{ item.perihal }}</span>
                    <span class="org-text">{{ item.organisasi }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge"
                    :style="{ color: urgensiConfig[item.prioritas]?.color||'#374151', background: urgensiConfig[item.prioritas]?.bg||'#f3f4f6' }">
                    <span class="bdot" :style="{ background: urgensiConfig[item.prioritas]?.color||'#374151' }"></span>
                    {{ item.prioritas }}
                  </span>
                </td>
                <td><span class="date-text">{{ formatDate(item.tanggal) }}</span></td>
                <td>
                  <span class="badge"
                    :style="{ color: statusConfig[item.status]?.color||'#374151', background: statusConfig[item.status]?.bg||'#f3f4f6' }">
                    <span class="bdot" :style="{ background: statusConfig[item.status]?.color||'#374151' }"></span>
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <button class="act-btn" @click="lihatDetail(item)">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" stroke-width="1.3"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
                    Lihat
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
.body{padding:1.5rem;max-width:1100px;margin:0 auto;}
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
.sort-icon{font-size:.65rem;margin-left:.25rem;opacity:.6;}
.table-row{border-bottom:1px solid rgba(168,200,180,.1);transition:background .15s;}
.table-row:last-child{border-bottom:none;}
.table-row:hover{background:var(--cmi);}
.table td{padding:.875rem 1rem;vertical-align:middle;}
.ticket-chip{font-size:.72rem;font-weight:700;color:var(--cs);font-family:monospace;}
.perihal-cell{display:flex;flex-direction:column;gap:.15rem;}
.perihal-text{font-size:.875rem;font-weight:600;color:var(--ci);}
.org-text{font-size:.72rem;color:var(--csv);}
.badge{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .7rem;border-radius:99px;font-size:.75rem;font-weight:700;}
.bdot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.date-text{font-size:.8rem;color:var(--cs);}
.act-btn{display:inline-flex;align-items:center;gap:.375rem;padding:.35rem .75rem;border-radius:8px;font-family:var(--fn);font-size:.75rem;font-weight:700;color:var(--ce);background:var(--cfo);border:1.5px solid rgba(46,184,106,.25);cursor:pointer;transition:all .15s;}
.act-btn:hover{background:var(--cm);color:white;border-color:var(--cm);}
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}
@media(max-width:640px){.page-header{padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>