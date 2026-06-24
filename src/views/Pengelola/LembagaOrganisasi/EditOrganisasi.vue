<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const id_organisasi        = ref(route.query.id_organisasi)
const namaPerangkatDaerah  = ref(route.query.nama_PerangkatDaerah || '')
const indukOrganisasi      = ref(route.query.indukOrganisasi || '')
const email                = ref(route.query.email || '')
const status               = ref(route.query.status || '')
const nomorHP              = ref('')
const namaPengelola        = ref('')
const pilihanInduk         = ref([])
const idOrganisasiTerpilih = ref(route.query.id_induk_organisasi || '')
const isSubmitting         = ref(false)
const readonlyMode         = ref(route.query.viewOnly === 'true')

const token = localStorage.getItem('Token')

Promise.all([
  axios.get('/api/organisasi', { headers: { Authorization: 'Bearer ' + token } }),
  axios.get(`/api/organisasi/${id_organisasi.value}`, { headers: { Authorization: 'Bearer ' + token } }),
]).then(([orgRes, detailRes]) => {
  pilihanInduk.value = orgRes.data.map(i => ({ id: i.ID_Organisasi, label: i.Nama_OPD }))
  namaPengelola.value = detailRes.data.Nama_Pengelola || ''
  nomorHP.value = detailRes.data.No_HP_Pengelola || ''
}).catch(console.error)

function handleSubmit() {
  if (!namaPerangkatDaerah.value || !email.value || !status.value || !namaPengelola.value || !nomorHP.value) {
    alert('Harap isi semua field yang bertanda *'); return
  }
  isSubmitting.value = true
  axios.put(`/api/organisasi/${id_organisasi.value}`, {
    Nama_OPD:            namaPerangkatDaerah.value,
    ID_Induk_Organisasi: idOrganisasiTerpilih.value || null,
    Nama_Pengelola:      namaPengelola.value,
    No_HP_Pengelola:     nomorHP.value,
    Email:               email.value,
    Status:              status.value,
  }, { headers: { Authorization: 'Bearer ' + token } })
  .then(() => router.push('/lembaga'))
  .catch(e => alert(e.response?.data?.message || 'Gagal memperbarui organisasi.'))
  .finally(() => { isSubmitting.value = false })
}
</script>

<template>
  <div class="form-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/lembaga')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="page-header__label">Pengelola · Lembaga & Organisasi</span>
        <h1 class="page-header__title">{{ readonlyMode ? 'Detail Organisasi' : 'Ubah Organisasi' }}</h1>
        <p class="page-header__sub">{{ namaPerangkatDaerah }}</p>
      </div>
      <div v-if="!readonlyMode" class="page-header__meta">
        <button class="switch-btn" @click="readonlyMode = true">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M4 6.5h5M6.5 4v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Mode Lihat
        </button>
      </div>
      <div v-else class="page-header__meta">
        <button class="switch-btn switch-btn--green" @click="readonlyMode = false">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Mode Edit
        </button>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="form-card">
        <div class="form-card__header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="5" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          {{ readonlyMode ? 'Informasi Organisasi' : 'Formulir Ubah Organisasi' }}
          <span v-if="!readonlyMode" class="req-note"><span class="req">*</span> Wajib diisi</span>
          <span v-else class="mode-badge">Hanya Lihat</span>
        </div>
        <div class="form-body">

          <!-- View-only mode: info list -->
          <div v-if="readonlyMode" class="info-list">
            <div class="info-item"><span class="ik">Nama Perangkat Daerah</span><span class="iv">{{ namaPerangkatDaerah }}</span></div>
            <div class="info-item"><span class="ik">Induk Perangkat Daerah</span><span class="iv">{{ indukOrganisasi || 'Tidak ada (Organisasi Induk)' }}</span></div>
            <div class="info-item"><span class="ik">Nama Pengelola</span><span class="iv">{{ namaPengelola || '-' }}</span></div>
            <div class="info-item"><span class="ik">Nomor HP Pengelola</span><span class="iv mono">{{ nomorHP || '-' }}</span></div>
            <div class="info-item"><span class="ik">Email</span><span class="iv mono">{{ email }}</span></div>
            <div class="info-item">
              <span class="ik">Status</span>
              <span class="iv">
                <span class="badge" :style="status==='Aktif' ? 'color:#059669;background:#ecfdf5' : 'color:#dc2626;background:#fef2f2'">
                  <span class="sdot" :style="status==='Aktif' ? 'background:#059669' : 'background:#dc2626'"></span>
                  {{ status }}
                </span>
              </span>
            </div>
          </div>

          <!-- Edit mode: form fields -->
          <template v-else>
            <div class="field">
              <label class="field__label">Nama Perangkat Daerah <span class="req">*</span></label>
              <input v-model="namaPerangkatDaerah" type="text" class="field__input" placeholder="Nama Perangkat Daerah"/>
            </div>
            <div class="field">
              <label class="field__label">Induk Perangkat Daerah</label>
              <select v-model="idOrganisasiTerpilih" class="field__select">
                <option value="">Tidak Ada (Organisasi Induk)</option>
                <option v-for="o in pilihanInduk" :key="o.id" :value="o.id">{{ o.label }}</option>
              </select>
            </div>
            <div class="divider"></div>
            <div class="form-row">
              <div class="field">
                <label class="field__label">Nama Pengelola <span class="req">*</span></label>
                <input v-model="namaPengelola" type="text" class="field__input" placeholder="Nama pengelola OPD"/>
              </div>
              <div class="field">
                <label class="field__label">Nomor HP Pengelola <span class="req">*</span></label>
                <input v-model="nomorHP" type="text" inputmode="numeric" class="field__input" placeholder="08xx-xxxx-xxxx"
                  @input="nomorHP = $event.target.value.replace(/\D/g, '')"/>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="field__label">Email <span class="req">*</span></label>
                <input v-model="email" type="email" class="field__input" placeholder="email@organisasi.go.id"/>
              </div>
              <div class="field">
                <label class="field__label">Status <span class="req">*</span></label>
                <select v-model="status" class="field__select">
                  <option value="" disabled>Pilih Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="fbtn fbtn--ghost" @click="router.push('/lembaga')">Batal</button>
              <button type="button" class="fbtn fbtn--primary" :disabled="isSubmitting" @click="handleSubmit">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;border-radius:20px;}
.page-header::after{content:'';position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.page-header__meta{margin-left:auto;z-index:1;}
.switch-btn{display:flex;align-items:center;gap:.4rem;padding:.4rem .875rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;font-family:var(--fn);font-size:.75rem;font-weight:600;color:rgba(255,255,255,.8);cursor:pointer;transition:background .15s;}
.switch-btn:hover{background:rgba(255,255,255,.18);}
.switch-btn--green{background:rgba(46,184,106,.2);border-color:rgba(46,184,106,.4);color:#a7f3d0;}
.page-header__orb{position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.body{padding:1.5rem;max-width:760px;margin:0 auto;}
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);flex-shrink:0;}
.req-note{margin-left:auto;font-size:.72rem;font-weight:500;color:var(--csv);}
.mode-badge{margin-left:auto;font-size:.72rem;font-weight:700;color:var(--cs);background:var(--csv);background:rgba(168,200,180,.3);padding:.15rem .5rem;border-radius:6px;}
.req{color:#ef4444;}
.form-body{padding:1.5rem;}
/* View-only */
.info-list{display:flex;flex-direction:column;}
.info-item{display:flex;align-items:flex-start;gap:.75rem;padding:.75rem 0;border-bottom:1px solid rgba(168,200,180,.12);}
.info-item:last-child{border-bottom:none;}
.ik{font-size:.72rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.05em;min-width:160px;flex-shrink:0;padding-top:.1rem;}
.iv{font-size:.9rem;font-weight:600;color:var(--ci);}
.mono{font-family:monospace;}
.badge{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .625rem;border-radius:99px;font-size:.72rem;font-weight:700;}
.sdot{width:6px;height:6px;border-radius:50%;}
/* Edit mode */
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.field{margin-bottom:1rem;}
.field__label{display:block;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.field__input,.field__select{width:100%;padding:.575rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.field__input:focus,.field__select:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.field__input::placeholder{color:var(--csv);}
.divider{height:1px;background:rgba(168,200,180,.2);margin:.5rem 0 1.25rem;}
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.575rem 1.375rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.3);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
@media(max-width:640px){.form-row{grid-template-columns:1fr;}.page-header{flex-direction:column;padding:1.25rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}.ik{min-width:120px;}}
</style>