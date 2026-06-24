<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router      = useRouter()
const services    = ref([])
const isLoading   = ref(true)
const searchTerm  = ref('')
const showModal   = ref(false)
const isChecked   = ref(false)
const selectedItem = ref(null)
const page        = ref(1)
const itemsPerPage = 10

onBeforeMount(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/subjenispelayanan', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => { services.value = res.data })
    .catch(console.error)
    .finally(() => { isLoading.value = false })
})

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return services.value.filter(s => s.Nama_Sub_Jenis_Pelayanan.toLowerCase().includes(term))
})
const totalPages   = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage))
const paginatedItems = computed(() => filteredServices.value.slice((page.value-1)*itemsPerPage, page.value*itemsPerPage))
const visiblePages = computed(() => {
  const pages = [], s = Math.max(1, page.value-2), e = Math.min(totalPages.value, page.value+2)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})
watch(searchTerm, () => { page.value = 1 })

function openModal(item) { selectedItem.value = item; isChecked.value = false; showModal.value = true }
function handleSetuju() {
  const item = selectedItem.value
  showModal.value = false
  localStorage.setItem('ID_Sub_Jenis_Pelayanan', item.ID_Sub_Jenis_Pelayanan)
  router.push({
    name: 'FormulirTiketBaruPengelola',
    query: { layanan: item.Nama_Sub_Jenis_Pelayanan, persyaratan: item.Persyaratan }
  })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <span class="page-header__label">Pengelola</span>
        <h1 class="page-header__title">Permintaan Baru</h1>
        <p class="page-header__sub">Pilih layanan untuk membuat tiket permintaan baru</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <!-- Info note -->
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v4M8 10.5h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <div>
          <p class="info-note__title">Petunjuk Pelayanan</p>
          <p>Siapkan surat permohonan (khusus layanan infrastruktur) serta file pendukung untuk memperjelas pelaporan. Klik tombol <strong>+</strong> untuk memulai permintaan. Pantau perkembangan melalui notifikasi email dari tim Service Desk.</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="searchTerm" type="text" class="search-input" placeholder="Cari layanan..."/>
          <span v-if="searchTerm" class="search-clear" @click="searchTerm=''">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </div>
        <span class="result-count">{{ filteredServices.length }} layanan</span>
      </div>

      <!-- List -->
      <div class="service-card">
        <div v-if="isLoading" class="state-center">
          <div class="spinner"></div><p>Memuat data...</p>
        </div>
        <div v-else-if="filteredServices.length === 0" class="state-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="10" width="28" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M15 22h14M15 28h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p>{{ searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data layanan' }}</p>
        </div>
        <div v-else>
          <div v-for="(item, i) in paginatedItems" :key="i" class="service-row">
            <div class="service-row__num">{{ (page-1)*itemsPerPage + i + 1 }}</div>
            <div class="service-row__body">
              <div class="service-row__icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11V5l5-3 5 3v6l-5 3-5-3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
              </div>
              <div class="service-row__info">
                <p class="service-row__name">{{ item.Nama_Sub_Jenis_Pelayanan }}</p>
                <p class="service-row__jenis">{{ item.sub__jns_pelayanan?.Nama_Jenis_Pelayanan || '' }}</p>
              </div>
            </div>
            <button class="btn-plus" @click="openModal(item)" title="Ajukan permintaan">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="page===1" @click="page--">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 3L4 6.5l4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{'page-btn--active':page===p}" @click="page=p">{{ p }}</button>
          <button class="page-btn" :disabled="page===totalPages" @click="page++">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Persyaratan -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="modal">
          <button class="modal-close" @click="showModal=false">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <div class="modal__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 7h6M7 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <h3 class="modal__title">Persyaratan Layanan</h3>
          <p class="modal__service-name">{{ selectedItem?.Nama_Sub_Jenis_Pelayanan }}</p>

          <div class="modal__persyaratan">
            <p class="modal__persyaratan-label">Harap pemohon menyertakan:</p>
            <p class="modal__persyaratan-text">{{ selectedItem?.Persyaratan || '-' }}</p>
          </div>

          <label class="modal__check">
            <input type="checkbox" v-model="isChecked"/>
            <span class="check-box" :class="{ 'check-box--checked': isChecked }">
              <svg v-if="isChecked" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span>Persyaratan sudah lengkap dan saya siap melanjutkan</span>
          </label>

          <button class="modal__btn-setuju" :disabled="!isChecked" @click="handleSetuju">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Lanjutkan ke Formulir
          </button>
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
.body{padding:1.5rem;max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;}

/* Info note */
.info-note{display:flex;gap:.75rem;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:1rem 1.125rem;color:#78350f;font-size:.8125rem;line-height:1.6;}
.info-note svg{color:#d97706;margin-top:.1rem;}
.info-note__title{font-weight:700;margin-bottom:.25rem;font-size:.8125rem;}

/* Toolbar */
.toolbar{display:flex;align-items:center;gap:1rem;}
.search-box{flex:1;display:flex;align-items:center;gap:.625rem;background:var(--cw);border:1.5px solid rgba(168,200,180,.3);border-radius:12px;padding:.625rem .875rem;box-shadow:var(--sh);transition:border-color .15s;}
.search-box:focus-within{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.search-box svg{color:var(--csv);flex-shrink:0;}
.search-input{flex:1;border:none;outline:none;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:transparent;}
.search-input::placeholder{color:var(--csv);}
.search-clear{cursor:pointer;color:var(--csv);display:flex;}
.result-count{font-size:.75rem;font-weight:600;color:var(--cs);white-space:nowrap;}

/* Service list card */
.service-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.state-center{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:4rem 2rem;color:var(--csv);font-size:.875rem;}
.spinner{width:28px;height:28px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.service-row{display:flex;align-items:center;gap:.875rem;padding:.875rem 1.25rem;border-bottom:1px solid rgba(168,200,180,.1);transition:background .15s;}
.service-row:last-of-type{border-bottom:none;}
.service-row:hover{background:var(--cmi);}
.service-row__num{width:24px;font-size:.72rem;font-weight:700;color:var(--csv);text-align:center;flex-shrink:0;}
.service-row__body{display:flex;align-items:center;gap:.75rem;flex:1;min-width:0;}
.service-row__icon{width:32px;height:32px;border-radius:9px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.service-row__info{min-width:0;}
.service-row__name{font-size:.875rem;font-weight:700;color:var(--ci);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.service-row__jenis{font-size:.75rem;color:var(--csv);margin-top:.1rem;}
.btn-plus{width:34px;height:34px;border-radius:10px;background:var(--cm);border:none;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;box-shadow:0 2px 8px rgba(46,184,106,.3);}
.btn-plus:hover{background:var(--ce);transform:scale(1.08);}

/* Pagination */
.pagination{display:flex;justify-content:center;align-items:center;gap:.375rem;padding:1rem;border-top:1px solid rgba(168,200,180,.15);}
.page-btn{width:34px;height:34px;background:var(--cw);border:1px solid rgba(168,200,180,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--fn);font-size:.8125rem;font-weight:600;color:var(--cs);cursor:pointer;transition:all .15s;}
.page-btn:hover:not(:disabled){background:var(--cfo);color:var(--ce);}
.page-btn--active{background:var(--cm)!important;color:white!important;border-color:var(--cm)!important;}
.page-btn:disabled{opacity:.35;cursor:not-allowed;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:var(--cw);border-radius:20px;padding:2rem 1.75rem;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:pop .2s cubic-bezier(.16,1,.3,1);position:relative;}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px);}to{opacity:1;transform:none;}}
.modal-close{position:absolute;top:.875rem;right:.875rem;width:28px;height:28px;border-radius:8px;background:var(--cmi);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--cs);}
.modal-close:hover{background:#fef2f2;color:#dc2626;}
.modal__icon{width:48px;height:48px;border-radius:50%;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;margin:0 auto .875rem;}
.modal__title{font-size:1.0625rem;font-weight:800;color:var(--ci);margin-bottom:.375rem;}
.modal__service-name{font-size:.8125rem;font-weight:600;color:var(--cm);margin-bottom:1rem;padding:.3rem .75rem;background:var(--cfo);border-radius:99px;display:inline-block;}
.modal__persyaratan{background:var(--cmi);border-radius:12px;padding:.875rem 1rem;text-align:left;margin-bottom:1.25rem;}
.modal__persyaratan-label{font-size:.72rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem;}
.modal__persyaratan-text{font-size:.8125rem;color:var(--ci);white-space:pre-line;line-height:1.6;}
.modal__check{display:flex;align-items:flex-start;gap:.625rem;cursor:pointer;text-align:left;margin-bottom:1.25rem;font-size:.8125rem;color:var(--cs);line-height:1.5;}
.modal__check input{display:none;}
.check-box{width:16px;height:16px;border-radius:5px;border:1.5px solid rgba(168,200,180,.5);background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.1rem;transition:all .15s;}
.check-box--checked{background:var(--cm);border-color:var(--cm);}
.modal__btn-setuju{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.5rem;background:linear-gradient(135deg,var(--cm),var(--ce));border:none;border-radius:12px;font-family:var(--fn);font-size:.875rem;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(46,184,106,.3);transition:opacity .15s;}
.modal__btn-setuju:hover:not(:disabled){opacity:.88;}
.modal__btn-setuju:disabled{background:rgba(168,200,180,.3);color:var(--csv);box-shadow:none;cursor:not-allowed;}
@media(max-width:640px){.page-header{padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>