<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router   = useRouter()
const services = ref([])
const isLoading = ref(true)
const isChecked = ref(false)
const searchTerm = ref('')
const showModal  = ref(false)
const selectedItem = ref(null)
const currentPage  = ref(1)
const itemsPerPage = 10

onBeforeMount(() => {
  const token = localStorage.getItem('Token')
  axios.get('/api/subjenispelayanan', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => { services.value = res.data })
    .catch(e => console.error(e))
    .finally(() => { isLoading.value = false })
})

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return services.value.filter(s => s.Nama_Sub_Jenis_Pelayanan.toLowerCase().includes(term))
})
const totalPages = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage))
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end   = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredServices.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => { currentPage.value = 1 })
function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function goToPage(page) { currentPage.value = page }

function openModal(item) { selectedItem.value = item; showModal.value = true; isChecked.value = false }
function handleSetuju() {
  const item = selectedItem.value
  if (!item) return
  showModal.value = false
  localStorage.setItem('ID_Sub_Jenis_Pelayanan', item.ID_Sub_Jenis_Pelayanan)
  router.push({ name: 'FormulirTiketBaru', query: { layanan: item.Nama_Sub_Jenis_Pelayanan, persyaratan: item.Persyaratan } })
}
</script>

<template>
  <div class="pengajuan">

    <!-- Hero kecil -->
    <div class="page-header">
      <div class="page-header__content">
        <span class="page-header__label">Layanan</span>
        <h1 class="page-header__title">Pengajuan Permintaan</h1>
        <p class="page-header__sub">Pilih jenis layanan yang ingin diajukan</p>
      </div>
    </div>

    <div class="body">

      <!-- Info Banner -->
      <div class="info-banner">
        <div class="info-banner__icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M9 8v5M9 6v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="info-banner__text">
          <strong>Petunjuk Pelayanan</strong>
          <p>Siapkan surat permohonan (khusus layanan infrastruktur) serta file pendukung. Klik tombol <strong>+</strong> untuk memulai permintaan. Pantau perkembangan melalui notifikasi email.</p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-wrap">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <input v-model="searchTerm" type="text" placeholder="Cari layanan..." class="search-input"/>
          <span v-if="searchTerm" class="search-clear" @click="searchTerm = ''">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
        </div>
        <span class="search-count">{{ filteredServices.length }} layanan</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data layanan...</p>
      </div>

      <!-- List -->
      <div v-else>
        <div v-if="paginatedServices.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="18" cy="18" r="12" stroke="currentColor" stroke-width="1.5"/>
            <path d="M28 28l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13 18h10M18 13v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p>Layanan tidak ditemukan</p>
        </div>

        <div class="service-list">
          <div
            v-for="(item, index) in paginatedServices"
            :key="index"
            class="service-row"
          >
            <div class="service-row__num">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</div>
            <div class="service-row__name">{{ item.Nama_Sub_Jenis_Pelayanan }}</div>
            <button class="service-row__btn" @click="openModal(item)" title="Ajukan layanan ini">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="pagination__btn" :disabled="currentPage === 1" @click="prevPage">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            v-for="page in visiblePages" :key="page"
            class="pagination__btn"
            :class="{ 'pagination__btn--active': currentPage === page }"
            @click="goToPage(page)"
          >{{ page }}</button>
          <button class="pagination__btn" :disabled="currentPage === totalPages" @click="nextPage">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l5 4-5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>

    <!-- Modal Persyaratan -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal__header">
            <div class="modal__icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 5h8M9 10h8M9 15h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="3" y="4" width="3" height="3" rx="1" fill="currentColor"/>
                <rect x="3" y="9" width="3" height="3" rx="1" fill="currentColor"/>
                <rect x="3" y="14" width="3" height="3" rx="1" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h2 class="modal__title">Persyaratan Layanan</h2>
              <p class="modal__sub">{{ selectedItem?.Nama_Sub_Jenis_Pelayanan }}</p>
            </div>
            <button class="modal__close" @click="showModal = false">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal__body">
            <p class="modal__note">Harap pemohon menyertakan atau melampirkan informasi berikut:</p>
            <ul class="modal__list">
              <li>Jenis Pengguna Akun (Personal/Grup/Fungsi)</li>
              <li>Jenis Akun</li>
              <li>Nama Pengguna</li>
              <li>Nama Afiliasi (Penanggung Jawab)</li>
              <li>Nama Alias Email</li>
              <li>Unit Organisasi</li>
              <li>NIP (apabila PNS dan Afiliasi)</li>
              <li>Nomor Telepon</li>
              <li>Nama Penjamin</li>
              <li>NIP Penjamin</li>
              <li>Alamat Surel Penjamin (@jabarprov.go.id)</li>
              <li>Alamat Surel Alternatif Penjamin</li>
            </ul>
          </div>

          <div class="modal__footer">
            <label class="modal__check">
              <input type="checkbox" v-model="isChecked" />
              <span class="modal__check-box"></span>
              Persyaratan sudah lengkap dan saya setuju melanjutkan
            </label>
            <div class="modal__actions">
              <button class="modal__cancel" @click="showModal = false">Batal</button>
              <button class="modal__submit" :disabled="!isChecked" @click="handleSetuju">
                Lanjutkan
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.pengajuan {
  --color-forest:  #1a3a2a; --color-emerald: #0f5c38; --color-mint: #2eb86a;
  --color-foam:    #e8f4ee; --color-ink:     #0d1a12; --color-stone: #5a7566;
  --color-silver:  #b8ccc2; --color-mist:    #f0f6f2; --color-white: #ffffff;
  --font:          'Plus Jakarta Sans', sans-serif;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-sm:     0 1px 3px rgba(13,26,18,.06);
  --shadow-md:     0 4px 16px rgba(13,26,18,.08);
  --shadow-lg:     0 12px 40px rgba(13,26,18,.14);
  --shadow-green:  0 4px 16px rgba(46,184,106,.3);
  font-family: var(--font); min-height: 100vh; background: var(--color-mist);
}

/* PAGE HEADER */
.page-header {
  background:var(--color-forest);
  padding: 2rem 2rem 2.5rem;margin:0 0 1.5rem; position: relative; overflow: hidden;border-radius:20px;}
.page-header::after {
  content: ''; position: absolute; width: 300px; height: 300px;
  background: var(--color-mint); border-radius: 50%; filter: blur(80px);
  opacity: .12; top: -100px; right: -60px; pointer-events: none;
}
.page-header__label {
  display: inline-block; font-size: .7rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color:rgba(255,255,255,.74); margin-bottom: .5rem;
}
.page-header__title { font-size: clamp(1.375rem, 3vw, 2rem); font-weight: 800; color:#ffffff; letter-spacing: -.02em; margin-bottom: .375rem; }
.page-header__sub   { font-size: .875rem; color:rgba(255,255,255,.74); }

/* BODY */
.body { padding: 1.5rem; max-width: 900px; margin: 0 auto; }

/* INFO BANNER */
.info-banner {
  display: flex; align-items: flex-start; gap: .875rem;
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
  padding: 1rem 1.125rem; margin-bottom: 1.25rem;
}
.info-banner__icon { width: 32px; height: 32px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #d97706; flex-shrink: 0; }
.info-banner__text { font-size: .8125rem; color: #92400e; line-height: 1.6; }
.info-banner__text strong { display: block; font-weight: 700; margin-bottom: .25rem; color: #78350f; }
.info-banner__text p { margin: 0; }

/* SEARCH */
.search-wrap { display: flex; align-items: center; gap: .875rem; margin-bottom: 1.25rem; }
.search-box {
  flex: 1; display: flex; align-items: center; gap: .625rem;
  background: var(--color-white); border: 1.5px solid rgba(168,200,180,.3);
  border-radius: 12px; padding: .625rem .875rem; box-shadow: var(--shadow-sm);
  transition: border-color .15s, box-shadow .15s;
}
.search-box:focus-within { border-color: var(--color-mint); box-shadow: 0 0 0 3px rgba(46,184,106,.12); }
.search-box svg { color: var(--color-silver); flex-shrink: 0; }
.search-input { flex: 1; border: none; outline: none; font-family: var(--font); font-size: .875rem; color: var(--color-ink); background: transparent; }
.search-input::placeholder { color: var(--color-silver); }
.search-clear { cursor: pointer; color: var(--color-silver); display: flex; transition: color .15s; }
.search-clear:hover { color: var(--color-stone); }
.search-count { font-size: .75rem; font-weight: 600; color: var(--color-stone); white-space: nowrap; }

/* LOADING */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 3rem; color: var(--color-stone); font-size: .875rem; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--color-foam); border-top-color: var(--color-mint); border-radius: 50%; animation: spin .65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* EMPTY */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 3rem; color: var(--color-silver); font-size: .875rem; }

/* SERVICE LIST */
.service-list { display: flex; flex-direction: column; gap: 6px; }
.service-row {
  display: flex; align-items: center; gap: .875rem;
  background: var(--color-white); border-radius: 12px;
  border: 1px solid rgba(168,200,180,.2); padding: .875rem 1rem;
  box-shadow: var(--shadow-sm); transition: box-shadow .2s, transform .2s, border-color .2s;
}
.service-row:hover { box-shadow: var(--shadow-md); transform: translateX(2px); border-color: rgba(46,184,106,.2); }
.service-row__num { width: 28px; height: 28px; background: var(--color-mist); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; color: var(--color-stone); flex-shrink: 0; }
.service-row__name { flex: 1; font-size: .875rem; font-weight: 600; color: var(--color-ink); }
.service-row__btn {
  width: 34px; height: 34px; background: var(--color-mint); border: none; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; color: white;
  cursor: pointer; flex-shrink: 0; box-shadow: var(--shadow-green);
  transition: background .15s, transform .15s;
}
.service-row__btn:hover { background: var(--color-emerald); transform: scale(1.08); }

/* PAGINATION */
.pagination { display: flex; justify-content: center; align-items: center; gap: .375rem; margin-top: 1.5rem; }
.pagination__btn { width: 36px; height: 36px; background: var(--color-white); border: 1px solid rgba(168,200,180,.3); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: var(--font); font-size: .8125rem; font-weight: 600; color: var(--color-stone); cursor: pointer; transition: all .15s; }
.pagination__btn:hover:not(:disabled) { background: var(--color-foam); color: var(--color-emerald); border-color: rgba(46,184,106,.3); }
.pagination__btn--active { background: var(--color-mint) !important; color: white !important; border-color: var(--color-mint) !important; box-shadow: var(--shadow-green); }
.pagination__btn:disabled { opacity: .35; cursor: not-allowed; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(13,26,18,.5);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 1rem;
}
.modal {
  background: var(--color-white); border-radius: 20px; width: 100%; max-width: 500px;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.modal__header {
  display: flex; align-items: flex-start; gap: .875rem;
  padding: 1.25rem 1.25rem 1rem; border-bottom: 1px solid var(--color-foam);
}
.modal__icon { width: 40px; height: 40px; background: var(--color-foam); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--color-emerald); flex-shrink: 0; }
.modal__title { font-size: 1rem; font-weight: 800; color: var(--color-ink); margin-bottom: 2px; letter-spacing: -.01em; }
.modal__sub    { font-size: .75rem; color: var(--color-stone); }
.modal__close  { margin-left: auto; width: 32px; height: 32px; background: var(--color-mist); border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-stone); transition: background .15s; flex-shrink: 0; }
.modal__close:hover { background: var(--color-foam); color: var(--color-emerald); }

.modal__body { padding: 1.125rem 1.25rem; max-height: 300px; overflow-y: auto; }
.modal__note { font-size: .8125rem; color: var(--color-stone); margin-bottom: .875rem; }
.modal__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.modal__list li {
  display: flex; align-items: center; gap: .625rem;
  font-size: .8125rem; color: var(--color-ink); padding: .5rem .75rem;
  background: var(--color-mist); border-radius: 8px;
}
.modal__list li::before { content: ''; width: 6px; height: 6px; background: var(--color-mint); border-radius: 50%; flex-shrink: 0; }

.modal__footer { padding: 1rem 1.25rem; border-top: 1px solid var(--color-foam); }
.modal__check { display: flex; align-items: center; gap: .625rem; cursor: pointer; font-size: .8125rem; font-weight: 600; color: var(--color-charcoal); margin-bottom: 1rem; user-select: none; }
.modal__check input[type="checkbox"] { display: none; }
.modal__check-box {
  width: 18px; height: 18px; border: 2px solid var(--color-silver); border-radius: 5px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all .15s; background: var(--color-white);
}
.modal__check input:checked + .modal__check-box { background: var(--color-mint); border-color: var(--color-mint); }
.modal__check input:checked + .modal__check-box::after { content: ''; width: 10px; height: 6px; border-left: 2px solid white; border-bottom: 2px solid white; transform: rotate(-45deg) translateY(-1px); display: block; }

.modal__actions { display: flex; gap: .625rem; justify-content: flex-end; }
.modal__cancel { padding: .55rem 1.125rem; background: var(--color-mist); border: 1px solid rgba(168,200,180,.3); border-radius: 9px; font-family: var(--font); font-size: .8125rem; font-weight: 600; color: var(--color-stone); cursor: pointer; transition: all .15s; }
.modal__cancel:hover { background: var(--color-foam); color: var(--color-emerald); }
.modal__submit { display: flex; align-items: center; gap: .4rem; padding: .55rem 1.25rem; background: var(--color-mint); border: none; border-radius: 9px; font-family: var(--font); font-size: .8125rem; font-weight: 700; color: white; cursor: pointer; box-shadow: var(--shadow-green); transition: all .2s; }
.modal__submit:hover:not(:disabled) { background: var(--color-emerald); transform: translateY(-1px); }
.modal__submit:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }

/* Transitions */
.modal-enter-active { transition: all .25s var(--ease-out); }
.modal-leave-active { transition: all .18s ease-in; }
.modal-enter-from   { opacity: 0; }
.modal-leave-to     { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95) translateY(10px); }
.modal-leave-to   .modal { transform: scale(0.97) translateY(4px); }

@media (max-width: 640px) {
  .body { padding: 1rem; }
  .page-header { padding: 1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}
}
</style>