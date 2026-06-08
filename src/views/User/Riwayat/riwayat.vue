<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router       = useRouter()
const search       = ref('')
const currentPage  = ref(1)
const isLoading    = ref(true)
const itemsPerPage = 10
const items        = ref([])

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusConfig = {
  'Selesai': { color: '#059669', bg: '#ecfdf5' },
  'Tutup':   { color: '#374151', bg: '#f3f4f6' },
  'Ditolak': { color: '#dc2626', bg: '#fef2f2' },
  'Proses':  { color: '#2563eb', bg: '#dbeafe' },
  'Disetujui': { color: '#0f5c38', bg: '#e8f4ee' },
  'Baru':    { color: '#4b5563', bg: '#f3f4f6' },
}

onMounted(() => {
  const token = localStorage.getItem('Token')
  const role = parseInt(localStorage.getItem('id_role'))
  const endpoint = (role === 3 || role === 4) ? '/api/pelayanan' : '/api/pelayananUser'
  axios.get(endpoint, { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      items.value = res.data
        .filter(item => {
          const statusName = item.status_pelayanan?.Nama_Status;
          if (role === 3) {
            // Unit Pelaksana: tampilkan yang sudah selesai/ditolak/ditutup ATAU yang sudah diteruskan ke pelaksana teknis (ID_Teknis tidak null)
            return ['Tutup','Ditolak','Selesai'].includes(statusName) || item.ID_Teknis !== null;
          }
          return ['Tutup','Ditolak','Selesai'].includes(statusName);
        })
        .map(item => ({
          ticket:  item.ID_Pelayanan,
          perihal: item.Perihal,
          pic:     item.teknis_pelayanan?.Nama_Depan || '-',
          date:    item.created_at,
          status:  item.status_pelayanan.Nama_Status,
        }))
    })
    .catch(e => console.error(e))
    .finally(() => { isLoading.value = false })
})

watch(search, () => { currentPage.value = 1 })

const filteredItems = computed(() => {
  const t = search.value.toLowerCase()
  return items.value.filter(item =>
    item.perihal?.toLowerCase().includes(t) ||
    String(item.ticket).toLowerCase().includes(t) ||
    formatDate(item.date).toLowerCase().includes(t) ||
    item.pic?.toLowerCase().includes(t)
  )
})
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})
const visiblePages = computed(() => {
  const pages = [], start = Math.max(1, currentPage.value - 2), end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
watch(filteredItems, () => { currentPage.value = 1 })

function lihatDetail(item) {
  router.push({ name: 'DetailPermintaanRiwayat', query: { layanan: item.ticket } })
}
</script>

<template>
  <div class="riwayat">
    <div class="page-header">
      <div class="page-header__content">
        <span class="page-header__label">Layanan Saya</span>
        <h1 class="page-header__title">Riwayat Permintaan</h1>
        <p class="page-header__sub">Permintaan yang telah selesai, ditutup, atau ditolak</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <input v-model="search" type="text" placeholder="Cari tiket, perihal, pelaksana..." class="search-input"/>
          <span v-if="search" class="search-clear" @click="search = ''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
        </div>
        <span class="result-count">{{ filteredItems.length }} riwayat</span>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-center">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>
        <div v-else-if="filteredItems.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="6" y="6" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14 22h16M14 15h16M14 29h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat permintaan' }}</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>No. Tiket</th>
                <th>Perihal</th>
                <th>Tanggal</th>
                <th>Pelaksana Teknis</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedItems" :key="item.ticket" class="table-row" @click="lihatDetail(item)">
                <td><span class="ticket-id">#{{ item.ticket }}</span></td>
                <td><span class="perihal-text">{{ item.perihal }}</span></td>
                <td><span class="meta-text">{{ formatDate(item.date) }}</span></td>
                <td><span class="meta-text">{{ item.pic }}</span></td>
                <td>
                  <span class="status-badge" :style="{ color: statusConfig[item.status]?.color || '#374151', background: statusConfig[item.status]?.bg || '#f3f4f6' }">
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <button class="detail-btn" @click.stop="lihatDetail(item)">
                    Lihat Detail
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 3L4 6.5l4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-for="page in visiblePages" :key="page" class="page-btn" :class="{ 'page-btn--active': currentPage === page }" @click="currentPage = page">{{ page }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.riwayat {
  --color-forest:#1a3a2a;--color-emerald:#0f5c38;--color-mint:#2eb86a;
  --color-foam:#e8f4ee;--color-ink:#0d1a12;--color-stone:#5a7566;
  --color-silver:#b8ccc2;--color-mist:#f0f6f2;--color-white:#ffffff;
  --font:'Plus Jakarta Sans',sans-serif;--ease-out:cubic-bezier(0.16,1,0.3,1);
  --shadow-sm:0 1px 3px rgba(13,26,18,.06);--shadow-md:0 4px 16px rgba(13,26,18,.08);
  font-family:var(--font);min-height:100vh;background:var(--color-mist);
}
.page-header { background:linear-gradient(135deg,var(--color-forest) 0%,var(--color-emerald) 100%);padding:2rem 2rem 2.5rem;position:relative;overflow:hidden; }
.page-header__orb { position:absolute;width:280px;height:280px;background:var(--color-mint);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none; }
.page-header__label { display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-mint);margin-bottom:.375rem; }
.page-header__title { font-size:clamp(1.375rem,3vw,1.875rem);font-weight:800;color:white;letter-spacing:-.02em;margin-bottom:.375rem; }
.page-header__sub { font-size:.875rem;color:rgba(255,255,255,.6); }
.body { padding:1.5rem;max-width:1100px;margin:0 auto; }
.toolbar { display:flex;align-items:center;gap:1rem;margin-bottom:1rem; }
.search-box { flex:1;display:flex;align-items:center;gap:.625rem;background:var(--color-white);border:1.5px solid rgba(168,200,180,.3);border-radius:12px;padding:.625rem .875rem;box-shadow:var(--shadow-sm);transition:border-color .15s,box-shadow .15s; }
.search-box:focus-within { border-color:var(--color-mint);box-shadow:0 0 0 3px rgba(46,184,106,.12); }
.search-box svg { color:var(--color-silver);flex-shrink:0; }
.search-input { flex:1;border:none;outline:none;font-family:var(--font);font-size:.875rem;color:var(--color-ink);background:transparent; }
.search-input::placeholder { color:var(--color-silver); }
.search-clear { cursor:pointer;color:var(--color-silver);display:flex;transition:color .15s; }
.search-clear:hover { color:var(--color-stone); }
.result-count { font-size:.75rem;font-weight:600;color:var(--color-stone);white-space:nowrap; }
.table-card { background:var(--color-white);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--shadow-sm);overflow:hidden; }
.table-wrap { overflow-x:auto; }
.state-center { display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:4rem 2rem;color:var(--color-silver);font-size:.875rem; }
.spinner { width:28px;height:28px;border:3px solid var(--color-foam);border-top-color:var(--color-mint);border-radius:50%;animation:spin .65s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table { width:100%;border-collapse:collapse; }
.table thead tr { background:var(--color-mist);border-bottom:1px solid rgba(168,200,180,.2); }
.table th { padding:.875rem 1rem;font-size:.75rem;font-weight:700;color:var(--color-stone);text-transform:uppercase;letter-spacing:.05em;text-align:left;white-space:nowrap; }
.table-row { border-bottom:1px solid rgba(168,200,180,.12);cursor:pointer;transition:background .15s; }
.table-row:last-child { border-bottom:none; }
.table-row:hover { background:var(--color-mist); }
.table td { padding:.875rem 1rem;vertical-align:middle; }
.ticket-id { font-size:.8125rem;font-weight:700;color:var(--color-emerald);font-family:monospace; }
.perihal-text { font-size:.875rem;font-weight:600;color:var(--color-ink); }
.meta-text { font-size:.8rem;color:var(--color-stone); }
.status-badge { display:inline-flex;align-items:center;padding:.25rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;white-space:nowrap; }
.detail-btn { display:inline-flex;align-items:center;gap:.375rem;padding:.375rem .875rem;background:var(--color-foam);border:1px solid rgba(46,184,106,.2);border-radius:8px;font-family:var(--font);font-size:.75rem;font-weight:700;color:var(--color-emerald);cursor:pointer;transition:all .15s;white-space:nowrap; }
.detail-btn:hover { background:var(--color-mint);color:white;border-color:var(--color-mint); }
.pagination { display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15); }
.page-btn { width:34px;height:34px;background:var(--color-white);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:.8125rem;font-weight:600;color:var(--color-stone);cursor:pointer;transition:all .15s; }
.page-btn:hover:not(:disabled) { background:var(--color-foam);color:var(--color-emerald);border-color:rgba(46,184,106,.3); }
.page-btn--active { background:var(--color-mint) !important;color:white !important;border-color:var(--color-mint) !important; }
.page-btn:disabled { opacity:.35;cursor:not-allowed; }
@media (max-width:640px) { .page-header { padding:1.5rem 1.25rem 2rem; } .body { padding:1rem; } }
</style>