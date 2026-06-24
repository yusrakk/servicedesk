<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const namaDepan  = ref(localStorage.getItem('nama_depan') || '')
const namaBelakang = ref(localStorage.getItem('nama_belakang') || '')
const nip        = ref(localStorage.getItem('nip_user') || '')
const role       = ref(localStorage.getItem('nama_role') || '')
const jabatan    = ref(localStorage.getItem('nama_jabatan') || '')
const organisasi = ref(localStorage.getItem('nama_organisasi') || '')
const gambar     = ref(localStorage.getItem('src_gambar') || '')

function updateProfileData() {
  namaDepan.value    = localStorage.getItem('nama_depan') || ''
  namaBelakang.value = localStorage.getItem('nama_belakang') || ''
  nip.value          = localStorage.getItem('nip_user') || ''
  gambar.value       = localStorage.getItem('src_gambar') || ''
}

onMounted(() => {
  window.addEventListener('profile-data-changed', updateProfileData)
  window.addEventListener('gambar-changed', updateProfileData)
})
onBeforeUnmount(() => {
  window.removeEventListener('profile-data-changed', updateProfileData)
  window.removeEventListener('gambar-changed', updateProfileData)
})

const imageSrc = computed(() => {
  if (gambar.value && gambar.value !== 'null') return `/images/${gambar.value}?t=${Date.now()}`
  return null
})

const initials = computed(() =>
  ((namaDepan.value?.[0] || '') + (namaBelakang.value?.[0] || '')).toUpperCase()
)

const roleConfig = {
  'Superadmin': { color: '#7c3aed', bg: '#f3e8ff' },
  'Pengelola':  { color: '#1d4ed8', bg: '#dbeafe' },
  'Unit':       { color: '#d97706', bg: '#fef3c7' },
  'Teknis':     { color: '#0891b2', bg: '#e0f2fe' },
  'User':       { color: '#374151', bg: '#f3f4f6' },
}
const roleStyle = computed(() => roleConfig[role.value] || roleConfig['User'])

const infoItems = computed(() => [
  { label: 'Nama Depan',   value: namaDepan.value,    icon: 'user' },
  { label: 'Nama Belakang',value: namaBelakang.value, icon: 'user' },
  { label: 'NIP',          value: nip.value,           icon: 'id'   },
  { label: 'Role',         value: role.value,          icon: 'role' },
  { label: 'Jabatan',      value: jabatan.value,       icon: 'job'  },
  { label: 'Organisasi',   value: organisasi.value,    icon: 'org'  },
])
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <span class="page-header__label">Akun Saya</span>
        <h1 class="page-header__title">Profil Saya</h1>
        <p class="page-header__sub">Informasi akun dan data diri Anda</p>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="profile-card">
        <!-- Kiri: foto + nama + tombol edit -->
        <div class="left-col">
          <div class="avatar-wrap">
            <img v-if="imageSrc" :src="imageSrc" alt="Foto Profil" class="avatar-img"/>
            <div v-else class="avatar-initials">{{ initials }}</div>
            <div class="avatar-ring"></div>
          </div>

          <div class="left-info">
            <h2 class="left-name">{{ namaDepan }} {{ namaBelakang }}</h2>
            <span class="role-badge" :style="{ color: roleStyle.color, background: roleStyle.bg }">
              {{ role || '-' }}
            </span>
            <p class="left-org">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4 3V2a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.2"/></svg>
              {{ organisasi || '-' }}
            </p>
          </div>

          <button class="btn-edit" @click="router.push('/editProfile')">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Edit Profil
          </button>
        </div>

        <!-- Divider -->
        <div class="divider-v"></div>

        <!-- Kanan: info detail -->
        <div class="right-col">
          <div class="section-title">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Informasi Akun
          </div>
          <div class="info-grid">
            <div v-for="item in infoItems" :key="item.label" class="info-item">
              <span class="info-label">{{ item.label }}</span>
              <span :class="['info-value', item.label==='NIP' ? 'info-value--mono' : '']">
                {{ item.value || '-' }}
              </span>
            </div>
          </div>
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
.body{padding:1.5rem;max-width:860px;margin:0 auto;}

.profile-card{background:var(--cw);border-radius:20px;border:1px solid rgba(168,200,180,.2);box-shadow:0 4px 24px rgba(13,26,18,.08);display:flex;gap:0;overflow:hidden;}

/* Left col */
.left-col{display:flex;flex-direction:column;align-items:center;padding:2.5rem 2rem;gap:1rem;min-width:220px;background:linear-gradient(180deg,var(--cmi) 0%,var(--cw) 100%);}
.avatar-wrap{position:relative;width:120px;height:120px;flex-shrink:0;}
.avatar-img{width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 16px rgba(13,26,18,.15);}
.avatar-initials{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--cm),var(--ce));color:white;font-size:2.25rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(13,26,18,.15);}
.avatar-ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--cm);opacity:.25;pointer-events:none;}
.left-info{text-align:center;}
.left-name{font-size:1.0625rem;font-weight:800;color:var(--ci);margin-bottom:.5rem;line-height:1.3;}
.role-badge{display:inline-block;padding:.25rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;margin-bottom:.5rem;}
.left-org{display:flex;align-items:center;gap:.375rem;font-size:.78rem;color:var(--csv);justify-content:center;}
.btn-edit{display:flex;align-items:center;gap:.5rem;padding:.6rem 1.5rem;background:linear-gradient(135deg,var(--cm),var(--ce));border:none;border-radius:12px;font-family:var(--fn);font-size:.8125rem;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(46,184,106,.3);transition:opacity .15s;margin-top:.5rem;}
.btn-edit:hover{opacity:.88;}

/* Divider */
.divider-v{width:1px;background:rgba(168,200,180,.2);flex-shrink:0;}

/* Right col */
.right-col{flex:1;padding:2rem 2rem 2rem 2rem;}
.section-title{display:flex;align-items:center;gap:.5rem;font-size:.8125rem;font-weight:700;color:var(--cs);text-transform:uppercase;letter-spacing:.06em;margin-bottom:1.25rem;}
.section-title svg{color:var(--cm);}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.875rem;}
.info-item{display:flex;flex-direction:column;gap:.3rem;padding:.875rem 1rem;background:var(--cmi);border-radius:12px;border:1px solid rgba(168,200,180,.15);}
.info-label{font-size:.68rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.05em;}
.info-value{font-size:.9rem;font-weight:700;color:var(--ci);}
.info-value--mono{font-family:monospace;font-size:.85rem;letter-spacing:.03em;}

@media(max-width:640px){
  .profile-card{flex-direction:column;}
  .divider-v{width:100%;height:1px;}
  .left-col{padding:2rem 1.5rem 1.5rem;}
  .right-col{padding:1.5rem;}
  .info-grid{grid-template-columns:1fr;}
  .body{padding:1rem;}
  .page-header{padding:1.5rem 1.25rem 2rem;margin:0 0 1.5rem;border-radius:20px;}
}
</style>