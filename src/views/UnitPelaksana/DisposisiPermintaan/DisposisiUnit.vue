<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isLoading    = ref(true)
const layananData  = ref([])
const sortKey      = ref('')
const sortOrder    = ref(null)
const search       = ref('')
const currentPage  = ref(1)
const itemsPerPage = 10

const statusConfig = {
  'Menunggu': { color: '#d97706', bg: '#fef3c7' },
  'Diproses': { color: '#2563eb', bg: '#dbeafe' },
  'Selesai':  { color: '#059669', bg: '#ecfdf5' },
  'Ditolak':  { color: '#dc2626', bg: '#fef2f2' },
  'Tutup':    { color: '#374151', bg: '#f3f4f6' },
  'Revisi':   { color: '#d97706', bg: '#fff7ed' },
}
const urgensiConfig = {
  'Tinggi': { color: '#dc2626', bg: '#fef2f2' },
  'Sedang': { color: '#d97706', bg: '#fef3c7' },
  'Rendah': { color: '#059669', bg: '#ecfdf5' },
}

onMounted(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/unit/pelayanan/disposisi', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      layananData.value = res.data.map(item => ({
        noTiket:  item.ID_Pelayanan,
        perihal:  item.Perihal,
        teknis:   item.teknis_pelayanan?.Nama_Depan || '-',
        tanggal:  item.created_at,
        status:   item.status_pelayanan.Nama_Status,
        terkirim: item.Is_Done,
        urgensi:  item.urgensi_pelayanan?.Nama_Urgensi || '-',
      }))
    })
    .catch(e => console.error(e))
    .finally(() => { isLoading.value = false })
})

function lihatDetail(item) {
  router.push({ name: 'DetailPelayananDisposisi', query: { layanan: item.noTiket } })
}

function toggleSort(key) {
  if (sortKey.value !== key) { sortKey.value = key; sortOrder.value = 'asc' }
  else if (sortOrder.value === 'asc') sortOrder.value = 'desc'
  else if (sortOrder.value === 'desc') { sortKey.value = ''; sortOrder.value = null }
  else sortOrder.value = 'asc'
}

const filteredItems = computed(() => {
  let items = layananData.value.filter(item =>
    item.perihal?.toLowerCase().includes(search.value.toLowerCase()) ||
    String(item.noTiket).toLowerCase().includes(search.value.toLowerCase()) ||
    item.teknis?.toLowerCase().includes(search.value.toLowerCase()) ||
    formatDate(item.tanggal).toLowerCase().includes(search.value.toLowerCase()) ||
    item.status?.toLowerCase().includes(search.value.toLowerCase())
  )
  if (sortKey.value && sortOrder.value) {
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
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})
const visiblePages   = computed(() => {
  const pages = [], start = Math.max(1, currentPage.value - 2), end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(search, () => { currentPage.value = 1 })
watch(filteredItems, () => { currentPage.value = 1 })
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <span class="page-header__label">Unit Kerja</span>
        <h1 class="page-header__title">Disposisi Pelayanan</h1>
        <p class="page-header__sub">Pantau pelayanan yang telah didisposisikan ke pelaksana teknis</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" type="text" placeholder="Cari tiket, perihal, pelaksana, status..." class="search-input"/>
          <span v-if="search" class="search-clear" @click="search = ''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <div class="legend">
          <span class="legend-item"><span class="dot dot--on"></span>Sudah terkirim</span>
          <span class="legend-item"><span class="dot dot--off"></span>Belum terkirim</span>
        </div>
        <span class="result-count">{{ filteredItems.length }} permintaan</span>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-center"><div class="spinner"></div><p>Memuat data...</p></div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="6" y="6" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M14 22h16M14 15h16M14 29h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada pelayanan terdisposisi' }}</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>No. Tiket</th>
                <th>Perihal</th>
                <th>Tanggal</th>
                <th>Prioritas</th>
                <th>Pelaksana Teknis</th>
                <th class="th-sort" @click="toggleSort('status')">
                  Status
                  <span class="sort-icon">
                    <svg v-if="sortKey==='status'&&sortOrder==='asc'" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2l4 6H1l4-6z" fill="currentColor"/></svg>
                    <svg v-else-if="sortKey==='status'&&sortOrder==='desc'" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8L1 2h8L5 8z" fill="currentColor"/></svg>
                    <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l3 4H2l3-4zM5 9L2 5h6L5 9z" fill="currentColor" opacity=".4"/></svg>
                  </span>
                </th>
                <th class="th-center">Terkirim</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in paginatedItems" :key="i" class="table-row" @click="lihatDetail(item)">
                <td><span class="ticket-id">#{{ item.noTiket }}</span></td>
                <td><span class="perihal-text">{{ item.perihal }}</span></td>
                <td><span class="meta-text">{{ formatDate(item.tanggal) }}</span></td>
                <td><span class="badge" :style="{ color: urgensiConfig[item.urgensi]?.color||'#374151', background: urgensiConfig[item.urgensi]?.bg||'#f3f4f6' }">{{ item.urgensi }}</span></td>
                <td><span class="meta-text">{{ item.teknis }}</span></td>
                <td><span class="badge" :style="{ color: statusConfig[item.status]?.color||'#374151', background: statusConfig[item.status]?.bg||'#f3f4f6' }">{{ item.status }}</span></td>
                <td class="td-center">
                  <span class="send-dot" :class="item.terkirim ? 'send-dot--on' : 'send-dot--off'"
                    :title="item.terkirim ? 'Sudah terkirim ke teknis' : 'Belum terkirim'"></span>
                </td>
                <td>
                  <button class="detail-btn" @click.stop="lihatDetail(item)">
                    Lihat
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage===1" @click="currentPage--"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 3L4 6.5l4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{'page-btn--active':currentPage===p}" @click="currentPage=p">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="currentPage++"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:2rem 2rem 2.5rem;margin:0 0 1.5rem;position:relative;overflow:hidden;border-radius:20px;}
.page-header__orb{position:absolute;width:280px;height:280px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.page-header__label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.375rem,3vw,1.875rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.375rem;}
.page-header__sub{font-size:.875rem;color:rgba(255,255,255,.74);}
.body{padding:1.5rem;max-width:1200px;margin:0 auto;}
.toolbar{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;}
.search-box{flex:1;min-width:200px;display:flex;align-items:center;gap:.625rem;background:var(--cw);border:1.5px solid rgba(168,200,180,.3);border-radius:12px;padding:.625rem .875rem;box-shadow:var(--sh);transition:border-color .15s,box-shadow .15s;}
.search-box:focus-within{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.search-box svg{color:var(--csv);flex-shrink:0;}
.search-input{flex:1;border:none;outline:none;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:transparent;}
.search-input::placeholder{color:var(--csv);}
.search-clear{cursor:pointer;color:var(--csv);display:flex;}
.legend{display:flex;align-items:center;gap:.75rem;}
.legend-item{display:flex;align-items:center;gap:.375rem;font-size:.75rem;color:var(--cs);}
.dot{width:9px;height:9px;border-radius:50%;display:inline-block;}
.dot--on{background:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.2);}
.dot--off{background:#d1d5db;}
.result-count{font-size:.75rem;font-weight:600;color:var(--cs);white-space:nowrap;}
.table-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.table-wrap{overflow-x:auto;}
.state-center{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:4rem 2rem;color:var(--csv);font-size:.875rem;}
.spinner{width:28px;height:28px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.table{width:100%;border-collapse:collapse;}
.table thead tr{background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);}
.table th{padding:.875rem 1rem;font-size:.75rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;text-align:left;white-space:nowrap;}
.th-sort{cursor:pointer;user-select:none;}
.th-sort:hover{color:var(--ce);}
.th-center{text-align:center!important;}
.sort-icon{display:inline-flex;align-items:center;margin-left:.375rem;color:var(--csv);}
.table-row{border-bottom:1px solid rgba(168,200,180,.12);cursor:pointer;transition:background .15s;}
.table-row:last-child{border-bottom:none;}
.table-row:hover{background:var(--cmi);}
.table td{padding:.875rem 1rem;vertical-align:middle;}
.td-center{text-align:center;}
.ticket-id{font-size:.8125rem;font-weight:700;color:var(--ce);font-family:monospace;}
.perihal-text{font-size:.875rem;font-weight:600;color:var(--ci);}
.meta-text{font-size:.8rem;color:var(--cs);}
.badge{display:inline-flex;align-items:center;padding:.25rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;white-space:nowrap;}
.send-dot{display:inline-block;width:11px;height:11px;border-radius:50%;}
.send-dot--on{background:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.2);}
.send-dot--off{background:#e5e7eb;}
.detail-btn{display:inline-flex;align-items:center;gap:.375rem;padding:.375rem .875rem;background:var(--cfo);border:1px solid rgba(46,184,106,.2);border-radius:8px;font-family:var(--fn);font-size:.75rem;font-weight:700;color:var(--ce);cursor:pointer;transition:all .15s;white-space:nowrap;}
.detail-btn:hover{background:var(--cm);color:white;border-color:var(--cm);}
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}
@media(max-width:640px){.page-header{padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>