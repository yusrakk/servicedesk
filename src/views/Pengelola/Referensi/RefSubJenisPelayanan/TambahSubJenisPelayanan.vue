<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const namaSubJenisPelayanan = ref('')
const persyaratan           = ref('')
const jenisPelayananId      = ref('')
const jenisPelayananNama    = ref('')
const daftarInputPelayanan  = ref([])
const daftarLangkahPelayanan = ref([])
const semuaLangkah          = ref([])
const daftarJenisPelayanan  = ref([])
const isSubmitting          = ref(false)

onMounted(() => {
  let defaultLangkah = []
  try { defaultLangkah = JSON.parse(route.query.defaultLangkah || '[]') } catch {}

  daftarInputPelayanan.value = defaultLangkah.map((nama, idx, arr) => ({
    namaYangDipilih: nama, dropdownTerbuka: false,
    default: idx < arr.length - 1, isLast: idx === arr.length - 1
  }))

  const token = localStorage.getItem('Token')
  axios.get('/api/isi_alur', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      semuaLangkah.value = res.data.data
      daftarLangkahPelayanan.value = res.data.data
        .filter(i => ![1,2,3,4].includes(i.ID_Isi_Alur))
        .map(i => i.Nama_Alur)
    }).catch(console.error)

  axios.get('/api/jenispelayanan', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => { daftarJenisPelayanan.value = res.data }).catch(console.error)
})

function hapusLangkah(idx) {
  if (daftarInputPelayanan.value[idx].default || daftarInputPelayanan.value[idx].isLast) return
  daftarInputPelayanan.value.splice(idx, 1)
}

function tambahLangkah() {
  const last = daftarInputPelayanan.value.pop()
  daftarInputPelayanan.value.push({ namaYangDipilih: '', dropdownTerbuka: false, default: false, isLast: false })
  daftarInputPelayanan.value.push(last)
}

function cariCocok(teks) {
  if (!teks?.trim()) return daftarLangkahPelayanan.value
  return daftarLangkahPelayanan.value.filter(n => n.toLowerCase().includes(teks.toLowerCase()))
}

function pilihLangkah(idx, nama) {
  daftarInputPelayanan.value[idx].namaYangDipilih = nama
  daftarInputPelayanan.value[idx].dropdownTerbuka = false
}

function tutupDropdown(idx) {
  setTimeout(() => { daftarInputPelayanan.value[idx].dropdownTerbuka = false }, 150)
}

function handleSubmit() {
  if (!namaSubJenisPelayanan.value.trim() || !persyaratan.value.trim() || !jenisPelayananId.value) {
    alert('Nama, persyaratan, dan jenis pelayanan wajib diisi'); return
  }
  isSubmitting.value = true
  const token = localStorage.getItem('Token')
  axios.post('/api/sub_jenis_pelayanan/tambah/full', {
    Nama_Sub_Jenis_Pelayanan: namaSubJenisPelayanan.value,
    Persyaratan: persyaratan.value,
    ID_Jenis_Pelayanan: jenisPelayananId.value,
    Langkah_Pelayanan: daftarInputPelayanan.value.map(i => i.namaYangDipilih)
  }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => router.push('/referensi/sub-jenis-pelayanan'))
    .catch(e => alert(e.response?.data?.error || e.response?.data?.message || 'Gagal menyimpan.'))
    .finally(() => { isSubmitting.value = false })
}

function handleReset() {
  namaSubJenisPelayanan.value = ''; persyaratan.value = ''; jenisPelayananId.value = ''
  let defaultLangkah = []
  try { defaultLangkah = JSON.parse(route.query.defaultLangkah || '[]') } catch {}
  daftarInputPelayanan.value = defaultLangkah.map((nama, idx, arr) => ({
    namaYangDipilih: nama, dropdownTerbuka: false,
    default: idx < arr.length - 1, isLast: idx === arr.length - 1
  }))
}
</script>

<template>
  <div class="form-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/referensi/sub-jenis-pelayanan')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="label">Referensi · Sub Jenis Pelayanan</span>
        <h1 class="title">Tambah Sub Jenis Pelayanan</h1>
        <p class="sub">Buat entri sub jenis pelayanan baru beserta langkah alurnya</p>
      </div>
      <div class="orb"></div>
    </div>

    <div class="body">
      <div class="form-card">
        <div class="card-header">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 11V5l5-3 5 3v6l-5 3-5-3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          Formulir Tambah Sub Jenis Pelayanan
          <span class="req-note"><span class="req">*</span> Wajib diisi</span>
        </div>

        <div class="card-body" @keydown.enter.prevent>
          <!-- Nama -->
          <div class="field">
            <label class="flabel">Nama Sub Jenis Pelayanan <span class="req">*</span></label>
            <input v-model="namaSubJenisPelayanan" type="text" class="finput" placeholder="Contoh: Permohonan KTP Baru, Izin Usaha..."/>
          </div>

          <!-- Persyaratan -->
          <div class="field">
            <label class="flabel">Persyaratan <span class="req">*</span></label>
            <textarea v-model="persyaratan" class="ftextarea" placeholder="Tuliskan persyaratan yang diperlukan..."></textarea>
          </div>

          <!-- Jenis Pelayanan -->
          <div class="field">
            <label class="flabel">Jenis Pelayanan <span class="req">*</span></label>
            <select v-model="jenisPelayananId" class="fselect">
              <option value="" disabled>Pilih Jenis Pelayanan</option>
              <option v-for="p in daftarJenisPelayanan" :key="p.ID_Jenis_Pelayanan" :value="p.ID_Jenis_Pelayanan">
                {{ p.Nama_Jenis_Pelayanan }}
              </option>
            </select>
          </div>

          <!-- Langkah Pelayanan -->
          <div class="field">
            <label class="flabel">Langkah Pelayanan <span class="req">*</span></label>
            <div class="langkah-list">
              <div v-for="(item, idx) in daftarInputPelayanan" :key="'l'+idx" class="langkah-row">
                <div class="langkah-num">
                  <span v-if="item.default" class="lbadge lbadge--default">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  <span v-else-if="item.isLast" class="lbadge lbadge--last">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v4M5 7.5h.01" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                  </span>
                  <span v-else class="lbadge lbadge--custom">{{ idx }}</span>
                </div>
                <div class="langkah-input-wrap" style="position:relative;flex:1">
                  <input
                    v-model="item.namaYangDipilih"
                    :readonly="item.default || item.isLast"
                    :class="['langkah-input', item.default||item.isLast ? 'langkah-input--fixed' : '']"
                    placeholder="Ketik atau pilih langkah..."
                    @focus="!item.default && !item.isLast && (item.dropdownTerbuka=true)"
                    @input="!item.default && !item.isLast && (item.dropdownTerbuka=true)"
                    @blur="tutupDropdown(idx)"
                  />
                  <ul v-if="item.dropdownTerbuka" class="langkah-dropdown">
                    <li v-if="cariCocok(item.namaYangDipilih).length === 0" class="langkah-dropdown__empty">Tidak ada pilihan</li>
                    <li v-for="(l, li) in cariCocok(item.namaYangDipilih)" :key="li" @mousedown="pilihLangkah(idx, l)">{{ l }}</li>
                  </ul>
                </div>
                <button v-if="!item.default && !item.isLast" class="langkah-del" type="button" @click="hapusLangkah(idx)" title="Hapus langkah">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
            <button type="button" class="btn-tambah-langkah" @click="tambahLangkah">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              Tambah Langkah
            </button>
          </div>

          <div class="form-actions">
            <button class="fbtn fbtn--ghost" type="button" @click="handleReset">Reset</button>
            <button class="fbtn fbtn--primary" type="button" :disabled="isSubmitting" @click="handleSubmit">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Sub Jenis Pelayanan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:linear-gradient(135deg,var(--cf),var(--ce));padding:1.5rem 2rem 2rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;}
.orb{position:absolute;width:240px;height:240px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:white;letter-spacing:-.02em;margin-bottom:.25rem;}
.sub{font-size:.8125rem;color:rgba(255,255,255,.6);}
.body{padding:1.5rem;max-width:680px;margin:0 auto;}
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.card-header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.card-header svg{color:var(--cm);}
.req-note{margin-left:auto;font-size:.72rem;font-weight:500;color:var(--csv);}
.req{color:#ef4444;}
.card-body{padding:1.5rem;}
.field{margin-bottom:1.25rem;}
.flabel{display:block;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem;}
.finput,.fselect{width:100%;padding:.625rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.finput:focus,.fselect:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.finput::placeholder{color:var(--csv);}
.ftextarea{width:100%;padding:.625rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.875rem;color:var(--ci);background:white;outline:none;transition:border-color .15s;box-sizing:border-box;resize:vertical;min-height:100px;}
.ftextarea:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.ftextarea::placeholder{color:var(--csv);}
.langkah-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem;}
.langkah-row{display:flex;align-items:center;gap:.5rem;}
.langkah-num{flex-shrink:0;}
.lbadge{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;}
.lbadge--default{background:var(--cfo);color:var(--cm);}
.lbadge--last{background:#fef3c7;color:#d97706;}
.lbadge--custom{background:rgba(168,200,180,.25);color:var(--cs);}
.langkah-input-wrap{position:relative;flex:1;}
.langkah-input{width:100%;padding:.5rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:8px;font-family:var(--fn);font-size:.8125rem;color:var(--ci);background:white;outline:none;transition:border-color .15s;box-sizing:border-box;}
.langkah-input:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.langkah-input--fixed{background:var(--cmi);color:var(--cs);cursor:default;}
.langkah-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1.5px solid rgba(168,200,180,.3);border-radius:10px;box-shadow:0 8px 24px rgba(13,26,18,.12);z-index:100;list-style:none;margin:0;padding:.25rem;max-height:180px;overflow-y:auto;}
.langkah-dropdown li{padding:.5rem .75rem;border-radius:7px;font-size:.8125rem;color:var(--ci);cursor:pointer;transition:background .1s;}
.langkah-dropdown li:hover{background:var(--cfo);}
.langkah-dropdown__empty{color:var(--csv);cursor:default;font-style:italic;}
.langkah-del{width:26px;height:26px;border-radius:7px;border:1.5px solid #fca5a5;background:#fef2f2;color:#ef4444;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;}
.langkah-del:hover{background:#ef4444;color:white;}
.btn-tambah-langkah{display:flex;align-items:center;gap:.375rem;padding:.45rem .875rem;background:var(--cfo);border:1.5px dashed rgba(46,184,106,.4);border-radius:8px;font-family:var(--fn);font-size:.78rem;font-weight:700;color:var(--ce);cursor:pointer;transition:all .15s;width:fit-content;}
.btn-tambah-langkah:hover{background:var(--cm);color:white;border-color:var(--cm);}
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid rgba(168,200,180,.2);}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.575rem 1.375rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.3);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.25rem;}.body{padding:1rem;}}
</style>