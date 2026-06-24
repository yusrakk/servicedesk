<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const user = {
  id:           route.query.user_id   || '-',
  nama_depan:   route.query.nama_depan  || '-',
  nama_belakang:route.query.nama_belakang || '-',
  NIP:          route.query.NIP       || '-',
  role:         route.query.role      || '-',
  jabatan:      route.query.jabatan   || '-',
  organisasi:   route.query.organisasi|| '-',
  status:       route.query.status    || '-',
}

const statusStyle = user.status === 'Aktif'
  ? { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' }
  : { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' }

const roleColors = {
  'Superadmin': { color: '#7c3aed', bg: '#ede9fe' },
  'Pengelola':  { color: '#1d4ed8', bg: '#dbeafe' },
  'Unit':       { color: '#d97706', bg: '#fef3c7' },
  'Teknis':     { color: '#0891b2', bg: '#e0f2fe' },
  'User':       { color: '#374151', bg: '#f3f4f6' },
}
const roleStyle = roleColors[user.role] || { color: '#374151', bg: '#f3f4f6' }
</script>

<template>
  <div class="detail-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/pengguna')">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3L5 7.5l5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Kembali
      </button>
      <div class="header-info">
        <div class="avatar-lg">{{ user.nama_depan[0] }}{{ user.nama_belakang[0] }}</div>
        <div>
          <span class="page-header__label">Pengelola · Pengguna</span>
          <h1 class="page-header__title">{{ user.nama_depan }} {{ user.nama_belakang }}</h1>
          <div class="header-badges">
            <span class="hbadge" :style="{ color: roleStyle.color, background: roleStyle.bg }">{{ user.role }}</span>
            <span class="hbadge" :style="{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }">
              <span class="sdot" :style="{ background: statusStyle.color }"></span>{{ user.status }}
            </span>
          </div>
        </div>
      </div>
      <div class="page-header__orb"></div>
    </div>

    <div class="body">
      <div class="info-card">
        <div class="info-card__header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3.5" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 14c0-3.59 2.91-6.5 6.5-6.5S14.5 10.41 14.5 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Informasi Pengguna
        </div>
        <div class="info-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="ik">ID Pengguna</span>
              <span class="iv id-text">#{{ user.id }}</span>
            </div>
            <div class="info-item">
              <span class="ik">NIP</span>
              <span class="iv mono">{{ user.NIP }}</span>
            </div>
            <div class="info-item">
              <span class="ik">Nama Depan</span>
              <span class="iv">{{ user.nama_depan }}</span>
            </div>
            <div class="info-item">
              <span class="ik">Nama Belakang</span>
              <span class="iv">{{ user.nama_belakang }}</span>
            </div>
            <div class="info-item">
              <span class="ik">Role</span>
              <span class="iv">
                <span class="badge" :style="{ color: roleStyle.color, background: roleStyle.bg }">{{ user.role }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="ik">Jabatan</span>
              <span class="iv">{{ user.jabatan }}</span>
            </div>
            <div class="info-item full">
              <span class="ik">Perangkat Daerah</span>
              <span class="iv">{{ user.organisasi }}</span>
            </div>
            <div class="info-item">
              <span class="ik">Status Akun</span>
              <span class="iv">
                <span class="badge" :style="{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }">
                  <span class="sdot" :style="{ background: statusStyle.color }"></span>
                  {{ user.status }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="info-footer">
          <button class="fbtn fbtn--ghost" @click="router.push('/pengguna')">Kembali ke Daftar</button>
          <button class="fbtn fbtn--primary" @click="router.push({ path:'/ubahPengguna', query: { user_id:user.id, nama_depan:user.nama_depan, nama_belakang:user.nama_belakang, role:user.role, jabatan:user.jabatan, organisasi:user.organisasi, status:user.status } })">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Ubah Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}
.page-header{background:var(--cf);padding:1.5rem 2rem 2rem;margin:0 0 1.5rem;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;border-radius:20px;}
.page-header::after{content:'';position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.back-btn{display:flex;align-items:center;gap:.375rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.4rem .75rem;color:rgba(255,255,255,.8);font-family:var(--fn);font-size:.75rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.18);color:white;}
.header-info{display:flex;align-items:center;gap:1rem;z-index:1;}
.avatar-lg{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.3);color:white;font-size:.9rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:.03em;}
.page-header__label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.3rem;}
.page-header__title{font-size:clamp(1.125rem,3vw,1.5rem);font-weight:800;color:#ffffff;letter-spacing:-.02em;margin-bottom:.4rem;}
.header-badges{display:flex;gap:.5rem;flex-wrap:wrap;}
.hbadge{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .625rem;border-radius:99px;font-size:.72rem;font-weight:700;border:1px solid transparent;}
.sdot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.page-header__orb{position:absolute;width:250px;height:250px;background:var(--cm);border-radius:50%;filter:blur(80px);opacity:.1;top:-80px;right:-40px;pointer-events:none;}
.body{padding:1.5rem;max-width:700px;margin:0 auto;}
.info-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);overflow:hidden;}
.info-card__header{display:flex;align-items:center;gap:.625rem;padding:1rem 1.5rem;background:var(--cmi);border-bottom:1px solid rgba(168,200,180,.2);font-size:.875rem;font-weight:700;color:var(--ci);}
.info-card__header svg{color:var(--cm);}
.info-body{padding:1.5rem;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;}
.info-item{padding:.875rem 0;border-bottom:1px solid rgba(168,200,180,.12);display:flex;flex-direction:column;gap:.3rem;padding-right:1rem;}
.info-item.full{grid-column:span 2;}
.info-item:last-child,.info-item:nth-last-child(2):not(.full){border-bottom:none;}
.ik{font-size:.7rem;font-weight:700;color:var(--csv);text-transform:uppercase;letter-spacing:.06em;}
.iv{font-size:.9rem;font-weight:600;color:var(--ci);}
.id-text{color:var(--ce);}
.mono{font-family:monospace;font-size:.875rem;}
.badge{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .625rem;border-radius:99px;font-size:.72rem;font-weight:700;border:1.5px solid transparent;}
.info-footer{display:flex;justify-content:flex-end;gap:.75rem;padding:1rem 1.5rem;border-top:1px solid rgba(168,200,180,.15);}
.fbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1.25rem;border-radius:10px;font-family:var(--fn);font-size:.8125rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--primary{background:linear-gradient(135deg,var(--cm),var(--ce));color:white;border:none;box-shadow:0 4px 12px rgba(46,184,106,.25);}
.fbtn--primary:hover{opacity:.9;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}
@media(max-width:640px){.info-grid{grid-template-columns:1fr;}.info-item.full{grid-column:span 1;}.page-header{flex-direction:column;padding:1.25rem;margin:0 0 1.5rem;border-radius:20px;}.body{padding:1rem;}}
</style>