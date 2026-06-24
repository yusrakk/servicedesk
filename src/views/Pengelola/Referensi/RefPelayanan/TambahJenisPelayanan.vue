<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const namaJenisPelayanan = ref('')
const isSubmitting = ref(false)

function handleSubmit() {
  if (!namaJenisPelayanan.value.trim()) { alert('Nama jenis pelayanan wajib diisi'); return }
  isSubmitting.value = true
  const token = localStorage.getItem('Token')
  axios.post('/api/jenispelayanan/tambah', { Nama_Jenis_Pelayanan: namaJenisPelayanan.value }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => router.push('/referensi/jenis-pelayanan'))
    .catch(e => alert(e.response?.data?.error || e.response?.data?.message || 'Gagal menambah jenis pelayanan.'))
    .finally(() => { isSubmitting.value = false })
}
</script>

<template>
  <div class="form-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/referensi/jenis-pelayanan')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div>
        <span class="page-header__label">Referensi · Jenis Pelayanan</span>
        <h1 class="page-header__title">Tambah Jenis Pelayanan</h1>
        <p class="page-header__sub">Tambahkan jenis pelayanan baru ke dalam sistem</p>
      </div>
      <div class="orb"></div>
    </div>
    <div class="body">
      <div class="form-card">
        <div class="form-card__header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l2 4 4.3.6-3.1 3 .7 4.3-3.9-2-3.9 2 .7-4.3-3.1-3L5.9 5.5 8 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          Formulir Tambah Jenis Pelayanan
          <span class="req-note"><span class="req">*</span> Wajib diisi</span>
        </div>
        <div class="form-body">
          <div class="field">
            <label class="field__label">Nama Jenis Pelayanan <span class="req">*</span></label>
            <input v-model="namaJenisPelayanan" type="text" class="field__input" placeholder="Contoh: Pelayanan Administrasi, Pelayanan Teknis..." @keyup.enter="handleSubmit"/>
          </div>
          <div class="form-actions">
            <button class="fbtn fbtn--ghost" type="button" @click="namaJenisPelayanan=''">Reset</button>
            <button class="fbtn fbtn--primary" type="button" :disabled="isSubmitting" @click="handleSubmit">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Jenis Pelayanan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;border-radius:20px;}
.orb{position:absolute;width:240px;height:240px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.375rem;}
.page-header__title{font-size:clamp(1.25rem,3vw,1.75rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.25rem;}
.page-header__sub{font-size:.8125rem;color:rgba(255,255,255,.74);}
.body{padding:1.5rem;max-width:600px;margin:0 auto;}
.form-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.form-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.form-card__header svg{color:var(--cm);}
.req-note{margin-left:auto;font-size:.72rem;font-weight:500;color:var(--csv);}
.req{color:#ef4444;}
.form-body{padding:1.5rem;}
.field{margin-bottom:1rem;}
.field__label{display:block;font-size:.72rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.field__input{width:100%;padding:.625rem .875rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--fn);font-size:.9rem;color:var(--ci);background:white;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.field__input:focus{border-color:var(--cm);box-shadow:0 0 0 3px rgba(46,184,106,.12);}
.field__input::placeholder{color:var(--csv);}
.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem;}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.575rem 1.375rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.3);}
.fbtn--primary:hover:not(:disabled){opacity:.9;}
.fbtn--primary:disabled{opacity:.5;cursor:not-allowed;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
@media(max-width:640px){.page-header{flex-direction:column;padding:1.25rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>