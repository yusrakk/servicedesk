<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router        = useRouter()
const ticketNumber  = ref('')
const isLoading     = ref(false)
const isFound       = ref(false)
const showError     = ref(false)
const errorMessage  = ref('')
const pelayananData = ref(null)
const steps         = ref([])
const stepsStatus   = ref([])

const formatTanggal = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
}

const statusConfig = {
  'Baru':            { color:'#2563eb', bg:'#dbeafe' },
  'Sedang Diproses': { color:'#d97706', bg:'#fef3c7' },
  'Ditolak':         { color:'#dc2626', bg:'#fef2f2' },
  'Revisi':          { color:'#ea580c', bg:'#fff7ed' },
  'Selesai':         { color:'#059669', bg:'#ecfdf5' },
  'Tutup':           { color:'#6b7280', bg:'#f3f4f6' },
}

const searchTicket = async () => {
  if (!ticketNumber.value.trim()) {
    showError.value = true; errorMessage.value = 'Mohon masukkan nomor tiket'; return
  }
  isLoading.value = true; showError.value = false; isFound.value = false; pelayananData.value = null
  try {
    const res = await axios.get(`/api/lacak/${ticketNumber.value}`)
    if (res.data) {
      pelayananData.value = res.data
      try {
        const prRes = await axios.get(`/api/lacak/${ticketNumber.value}/progress`)
        steps.value       = prRes.data.slice(0,5).map(i => i.progress_to_alur?.isi_alur?.Nama_Alur || '-')
        stepsStatus.value = prRes.data.slice(0,5).map(i => i.Is_Done)
      } catch { steps.value = []; stepsStatus.value = [] }
      isFound.value = true
    } else {
      showError.value = true; errorMessage.value = 'Tiket tidak ditemukan'
    }
  } catch {
    showError.value = true
    errorMessage.value = 'Tiket tidak ditemukan. Mohon periksa kembali nomor tiket Anda.'
    pelayananData.value = null
  } finally { isLoading.value = false }
}

const resetSearch = () => {
  ticketNumber.value = ''; isFound.value = false; showError.value = false
  pelayananData.value = null; steps.value = []; stepsStatus.value = []
}
</script>

<template>
  <div class="page">
    <!-- Login button -->
    <button class="login-btn" @click="router.push('/login')">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2H10.5a1 1 0 011 1v7a1 1 0 01-1 1H8M5.5 9l3-2.5-3-2.5M1.5 6.5h7" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Login
    </button>

    <!-- Hero -->
    <div class="hero">
      <div class="orb orb--1"></div>
      <div class="orb orb--2"></div>
      <div class="hero__badge">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 6l2 2 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Service Desk Diskominfo Jabar
      </div>
      <h1 class="hero__title">Lacak Tiket <span class="hero__accent">Pelayanan</span></h1>
      <p class="hero__sub">Masukkan nomor tiket untuk melacak status pelayanan Anda</p>

      <!-- Search box -->
      <div v-if="!isFound" class="search-wrap">
        <div class="search-box" :class="{'search-box--err': showError}">
          <svg class="s-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <input
            v-model="ticketNumber" type="text"
            class="s-input" placeholder="Contoh: P-00001"
            :disabled="isLoading" @keyup.enter="searchTicket"
          />
          <button class="s-btn" :disabled="isLoading" @click="searchTicket">
            <span v-if="!isLoading">Lacak Tiket</span>
            <div v-else class="s-spin"></div>
          </button>
        </div>
        <div v-if="showError" class="err-msg">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          {{ errorMessage }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-row">
        <div class="spinner"></div><span>Mencari tiket...</span>
      </div>
    </div>

    <!-- Result -->
    <div v-if="isFound && pelayananData" class="result">
      <button class="reset-btn" @click="resetSearch">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3L1 6.5l4 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 6.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        Cari Tiket Lain
      </button>

      <div class="result-grid">
        <!-- Info tiket -->
        <div class="card">
          <div class="card-head">
            <div>
              <span class="c-label">No. Tiket</span>
              <h2 class="c-ticket">#{{ pelayananData.ID_Pelayanan }}</h2>
            </div>
            <span class="s-badge"
              :style="{ color: statusConfig[pelayananData.status_pelayanan?.Nama_Status]?.color||'#374151', background: statusConfig[pelayananData.status_pelayanan?.Nama_Status]?.bg||'#f3f4f6' }">
              <span class="bdot" :style="{ background: statusConfig[pelayananData.status_pelayanan?.Nama_Status]?.color||'#374151' }"></span>
              {{ pelayananData.status_pelayanan?.Nama_Status || '-' }}
            </span>
          </div>
          <div class="divider"></div>
          <div class="info-grid">
            <div class="ig ig--full">
              <span class="ig-l">Perihal</span>
              <span class="ig-v">{{ pelayananData.Perihal }}</span>
            </div>
            <div class="ig">
              <span class="ig-l">Layanan</span>
              <span class="ig-v">{{ pelayananData.sub__jenis__pelayanan?.Nama_Sub_Jenis_Pelayanan }}</span>
            </div>
            <div class="ig">
              <span class="ig-l">Tipe Layanan</span>
              <span class="ig-v">{{ pelayananData.jenis__pelayanan?.Nama_Jenis_Pelayanan }}</span>
            </div>
            <div class="ig">
              <span class="ig-l">Organisasi</span>
              <span class="ig-v">{{ pelayananData.user?.user_organisasi?.Nama_OPD }}</span>
            </div>
            <div class="ig">
              <span class="ig-l">Tanggal Laporan</span>
              <span class="ig-v">{{ formatTanggal(pelayananData.created_at) }}</span>
            </div>
            <div class="ig ig--full">
              <span class="ig-l">Pelaksana Teknis</span>
              <span class="ig-v">{{ pelayananData.teknis_pelayanan?.Nama_Depan || 'Belum' }} {{ pelayananData.teknis_pelayanan?.Nama_Belakang || 'Tersedia' }}</span>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="card">
          <div class="card-head">
            <div>
              <span class="c-label">Alur Pelayanan</span>
              <h2 class="c-ticket" style="font-size:1.125rem;font-family:inherit">Progress Pengerjaan</h2>
            </div>
            <span class="prog-count">{{ stepsStatus.filter(s=>s===1).length }}/{{ steps.length }}</span>
          </div>
          <div class="divider"></div>
          <div class="steps">
            <div v-if="steps.length===0" class="steps-empty">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="currentColor" stroke-width="1.3"/><path d="M14 9v6M14 18h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              <p>Data progress belum tersedia</p>
            </div>
            <div v-for="(step, i) in steps" :key="i" class="step-row">
              <div class="step-l">
                <div :class="['step-circle', stepsStatus[i]===1?'step-circle--on':'step-circle--off']">
                  <svg v-if="stepsStatus[i]===1" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span v-else>{{ i+1 }}</span>
                </div>
                <div v-if="i < steps.length-1" :class="['step-line', stepsStatus[i]===1?'step-line--on':'']"></div>
              </div>
              <span :class="['step-label', stepsStatus[i]===1?'step-label--on':'']">{{ step }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">© Service Desk 3.0 — Diskominfo Jawa Barat</div>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);display:flex;flex-direction:column;align-items:center;position:relative;}

.login-btn{position:absolute;top:1.25rem;right:1.5rem;display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.125rem;background:var(--cm);color:white;border:none;border-radius:99px;font-family:var(--fn);font-size:.8rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(46,184,106,.3);transition:all .15s;z-index:10;}
.login-btn:hover{background:var(--ce);transform:translateY(-1px);}

.hero{width:100%;background:linear-gradient(160deg,var(--cf) 0%,var(--ce) 55%,#0a4a2c 100%);padding:5rem 2rem 4rem;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;overflow:hidden;}
.orb{position:absolute;border-radius:50%;pointer-events:none;}
.orb--1{width:400px;height:400px;background:var(--cm);filter:blur(100px);opacity:.08;top:-150px;right:-100px;}
.orb--2{width:280px;height:280px;background:#4ade80;filter:blur(80px);opacity:.06;bottom:-100px;left:-60px;}
.hero__badge{display:inline-flex;align-items:center;gap:.4rem;background:rgba(46,184,106,.15);border:1px solid rgba(46,184,106,.3);color:var(--cm);padding:.35rem .875rem;border-radius:99px;font-size:.75rem;font-weight:700;margin-bottom:1.5rem;}
.hero__title{font-size:clamp(2rem,5vw,3.25rem);font-weight:800;color:white;line-height:1.15;letter-spacing:-.03em;margin-bottom:.875rem;}
.hero__accent{color:var(--cm);}
.hero__sub{font-size:1rem;color:rgba(255,255,255,.6);margin-bottom:2.5rem;max-width:480px;}

.search-wrap{width:100%;max-width:580px;display:flex;flex-direction:column;gap:.75rem;}
.search-box{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.08);backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.15);border-radius:14px;padding:.5rem .5rem .5rem 1rem;transition:border-color .15s;}
.search-box:focus-within{border-color:var(--cm);}
.search-box--err{border-color:#ef4444;}
.s-icon{color:rgba(255,255,255,.35);flex-shrink:0;}
.s-input{flex:1;background:transparent;border:none;outline:none;font-family:var(--fn);font-size:.9375rem;color:white;padding:.5rem 0;}
.s-input::placeholder{color:rgba(255,255,255,.3);}
.s-input:disabled{opacity:.6;}
.s-btn{padding:.625rem 1.25rem;background:var(--cm);color:white;border:none;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:background .15s;flex-shrink:0;display:flex;align-items:center;min-width:88px;justify-content:center;}
.s-btn:hover:not(:disabled){background:var(--ce);}
.s-btn:disabled{opacity:.6;cursor:not-allowed;}
.s-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .65s linear infinite;}
.err-msg{display:flex;align-items:center;gap:.4rem;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;padding:.625rem .875rem;border-radius:9px;font-size:.8125rem;font-weight:600;}

.loading-row{display:flex;align-items:center;gap:.75rem;color:rgba(255,255,255,.6);font-size:.875rem;}
.spinner{width:22px;height:22px;border:2.5px solid rgba(255,255,255,.15);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.result{width:100%;max-width:1000px;padding:2rem 1.5rem;display:flex;flex-direction:column;gap:1.25rem;}
.reset-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1.125rem;background:var(--cw);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);border-radius:99px;font-family:var(--fn);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .15s;align-self:flex-start;}
.reset-btn:hover{background:var(--cfo);color:var(--ce);}
.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start;}
.card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.card-head{display:flex;align-items:flex-start;justify-content:space-between;padding:1.25rem 1.5rem;}
.c-label{display:block;font-size:.68rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.25rem;}
.c-ticket{font-size:1.375rem;font-weight:800;color:var(--ci);letter-spacing:-.02em;font-family:monospace;}
.divider{height:1px;background:rgba(168,200,180,.15);}
.s-badge{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;flex-shrink:0;}
.bdot{width:5px;height:5px;border-radius:50%;}
.prog-count{font-size:.8125rem;font-weight:700;color:var(--cm);background:var(--cfo);padding:.3rem .75rem;border-radius:99px;flex-shrink:0;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;padding:1.125rem;}
.ig{display:flex;flex-direction:column;gap:.2rem;padding:.625rem .75rem;background:var(--cmi);border-radius:9px;}
.ig--full{grid-column:1/-1;}
.ig-l{font-size:.68rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.05em;}
.ig-v{font-size:.8125rem;font-weight:600;color:var(--ci);}
.steps{padding:1.125rem;display:flex;flex-direction:column;}
.steps-empty{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:2rem 0;color:var(--csv);font-size:.8125rem;}
.step-row{display:flex;gap:.875rem;align-items:flex-start;}
.step-l{display:flex;flex-direction:column;align-items:center;flex-shrink:0;}
.step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;}
.step-circle--on{background:var(--cm);color:white;}
.step-circle--off{background:var(--cmi);color:var(--csv);border:2px solid rgba(168,200,180,.4);}
.step-line{width:2px;height:24px;margin-top:2px;}
.step-line--on{background:var(--cm);}
.step-line:not(.step-line--on){background:rgba(168,200,180,.3);}
.step-label{font-size:.875rem;font-weight:600;color:var(--cs);padding:.375rem 0 1.25rem;flex:1;}
.step-label--on{color:var(--ci);}
.footer{padding:2rem;color:var(--csv);font-size:.8rem;}

@media(max-width:680px){
  .result-grid{grid-template-columns:1fr;}
  .hero{padding:4rem 1.25rem 3rem;}
  .result{padding:1.25rem 1rem;}
  .login-btn{top:.875rem;right:1rem;}
}
</style>