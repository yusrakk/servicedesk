<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const nama_depan  = ref(localStorage.getItem('nama_depan'))
const nama_belakang = ref(localStorage.getItem('nama_belakang'))
const gambar      = ref(localStorage.getItem('src_gambar'))
const role        = ref(localStorage.getItem('id_role'))
const isOpen      = ref(true)
const dropdownRef = ref(false)

const imageSrc = computed(() => {
  if (gambar.value && gambar.value !== 'null') return `/images/${gambar.value}`
  return null
})

const initials = computed(() => {
  const f = (nama_depan.value || '')[0] || ''
  const l = (nama_belakang.value || '')[0] || ''
  return (f + l).toUpperCase()
})

const roleLabel = computed(() => {
  const r = parseInt(localStorage.getItem('id_role'))
  if (r === 1) return 'User'
  if (r === 2) return 'Pengelola'
  if (r === 3) return 'Unit Pelaksana'
  if (r === 4) return 'Pelaksana Teknis'
  if (r === 5) return 'Kepala Dinas'
  if (r === 6) return 'Superadmin'
  return ''
})

onMounted(() => {
  window.addEventListener('gambar-changed', () => {
    gambar.value = localStorage.getItem('src_gambar')
  })
  window.addEventListener('sudahLogin', () => {
    nama_depan.value  = localStorage.getItem('nama_depan')
    nama_belakang.value = localStorage.getItem('nama_belakang')
    gambar.value      = localStorage.getItem('src_gambar')
  })
})

onBeforeUnmount(() => {})

function toggleSidebar() {
  isOpen.value = !isOpen.value
  window.dispatchEvent(new CustomEvent('sidebar-toggle', {
    detail: { isCollapsed: !isOpen.value }
  }))
}

function toggleDropdown() {
  dropdownRef.value = !dropdownRef.value
}

function logout() {
  localStorage.clear()
  router.push('/login')
}

function toProfile() {
  router.push('/profileSaya')
}

const roleId = parseInt(localStorage.getItem('id_role'))

const menuItems = computed(() => {
  if (roleId === 1) return [
    { label: 'Beranda',             to: '/beranda',             icon: 'home' },
    { label: 'Permintaan Layanan',  to: '/permintaanDiproses',  icon: 'inbox' },
  ]
  if (roleId === 2) return [
    { label: 'Beranda',             to: '/Beranda-Pengelola',   icon: 'home' },
    { label: 'Daftar Pelayanan',    to: '/pelayanan',           icon: 'list' },
    { label: 'Akun',                to: '/akun',                icon: 'user' },
  ]
  if (roleId === 3) return [
    { label: 'Beranda',             to: '/berandaUnit',         icon: 'home' },
    { label: 'Permintaan Layanan',  to: '/approval',            icon: 'check' },
  ]
  if (roleId === 4) return [
    { label: 'Beranda',             to: '/berandaTeknis',       icon: 'home' },
    { label: 'Permintaan Layanan',  to: '/permintaanTeknis',    icon: 'inbox' },
  ]
  if (roleId === 5) return [
    { label: 'Beranda',             to: '/berandaKD',           icon: 'home' },
    { label: 'Kepuasan Keseluruhan',to: '/KepuasanUserKeseluruhan', icon: 'chart' },
    { label: 'Kepuasan Bulan Ini',  to: '/KepuasanUserBulanIni',    icon: 'calendar' },
  ]
  if (roleId === 6) return [
    { label: 'Beranda',             to: '/Beranda-Pengelola',   icon: 'home' },
    { label: 'Permintaan Layanan',  to: '/pelayanan',           icon: 'list' },
    { label: 'Pengguna',            to: '/pengguna',            icon: 'users' },
    { label: 'Referensi', icon: 'settings', children: [
      { label: 'Lembaga',           to: '/lembaga',             icon: 'building' },
      { label: 'Jabatan',           to: '/referensi/jabatan',   icon: 'briefcase' },
      { label: 'Status',            to: '/referensi/status',    icon: 'tag' },
      { label: 'Jenis Pelayanan',   to: '/referensi/jenis-pelayanan', icon: 'layers' },
      { label: 'Urgensi',           to: '/referensi/urgensi',   icon: 'alert' },
      { label: 'Sub Jenis Pelayanan', to: '/referensi/sub-jenis-pelayanan', icon: 'sublayers' },
    ]},
  ]
  return []
})

function isActive(item) {
  if (item.to) return route.path === item.to
  if (item.children) return item.children.some(c => route.path === c.to)
  return false
}

const icons = {
  home:       `<path d="M2 7L8 2l6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 16V9h4v7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  inbox:      `<rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 9h3l1.5 2h3L11 9h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  list:       `<path d="M5 4h8M5 8h8M5 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="2.5" cy="4" r="1" fill="currentColor"/><circle cx="2.5" cy="8" r="1" fill="currentColor"/><circle cx="2.5" cy="12" r="1" fill="currentColor"/>`,
  user:       `<circle cx="8" cy="6" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  users:      `<circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M1 14c0-2.8 2.2-5 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="11" cy="6" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M15 14c0-2.8-2.2-5-5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  check:      `<path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  chart:      `<rect x="2" y="8" width="3" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" stroke-width="1.4"/>`,
  calendar:   `<rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 1.5v3M11 1.5v3M2 7h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  settings:   `<circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  building:   `<rect x="3" y="2" width="10" height="13" rx="1" stroke="currentColor" stroke-width="1.4"/><path d="M6 5h1M9 5h1M6 8h1M9 8h1M6 11h1M9 11h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  briefcase:  `<rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 6V4.5A1.5 1.5 0 016.5 3h3A1.5 1.5 0 0111 4.5V6" stroke="currentColor" stroke-width="1.4"/><path d="M2 10h12" stroke="currentColor" stroke-width="1.4"/>`,
  tag:        `<path d="M2 2h5l7 7-5 5-7-7V2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>`,
  layers:     `<path d="M8 2L2 5.5l6 3.5 6-3.5L8 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 9.5L8 13l6-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  alert:      `<path d="M8 2l6 11H2L8 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 7v2.5M8 11v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  sublayers:  `<path d="M8 3L2 6.5l6 3.5 6-3.5L8 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 10.5L8 14l6-3.5M2 7.5L8 11l6-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
}
</script>

<template>
  <aside :class="['sidebar', { 'sidebar--collapsed': !isOpen }]">

    <!-- Profile + toggle -->
    <div class="sidebar__top">
      <div class="sidebar__profile" @click="toProfile" :title="!isOpen ? (nama_depan + ' ' + nama_belakang) : ''">
        <div class="profile__avatar">
          <img v-if="imageSrc" :src="imageSrc" alt="Foto Profil" class="profile__img"/>
          <span v-else class="profile__initials">{{ initials }}</span>
        </div>
        <div class="profile__info" v-if="isOpen">
          <span class="profile__name">{{ nama_depan }} {{ nama_belakang }}</span>
          <span class="profile__role">{{ roleLabel }}</span>
        </div>
      </div>
      <button class="sidebar__toggle" @click.stop="toggleSidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Divider -->
    <div class="sidebar__divider"></div>

    <!-- Nav -->
    <nav class="sidebar__nav">
      <template v-for="item in menuItems" :key="item.label">

        <!-- Item dengan children (dropdown) -->
        <template v-if="item.children">
          <button
            class="nav-item nav-item--dropdown"
            :class="{ 'nav-item--active': isActive(item), 'nav-item--open': dropdownRef }"
            @click="toggleDropdown"
            :title="!isOpen ? item.label : ''"
          >
            <span class="nav-item__icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" v-html="icons[item.icon]"></svg>
            </span>
            <span class="nav-item__label" v-if="isOpen">{{ item.label }}</span>
            <svg v-if="isOpen" class="nav-item__chevron" :class="{ 'rotated': dropdownRef }"
              width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <transition name="dropdown">
            <div v-if="dropdownRef && isOpen" class="nav-dropdown">
              <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="nav-dropdown__item"
                :class="{ 'nav-dropdown__item--active': route.path === child.to }"
              >
                <span class="nav-dropdown__dot"></span>
                {{ child.label }}
              </router-link>
            </div>
          </transition>
        </template>

        <!-- Item biasa -->
        <router-link
          v-else
          :to="item.to"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item) }"
          :title="!isOpen ? item.label : ''"
        >
          <span class="nav-item__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" v-html="icons[item.icon]"></svg>
          </span>
          <span class="nav-item__label" v-if="isOpen">{{ item.label }}</span>
          <span v-if="isOpen && isActive(item)" class="nav-item__pip"></span>
        </router-link>

      </template>
    </nav>

    <!-- Bottom: Logout -->
    <div class="sidebar__footer">
      <div class="sidebar__divider"></div>
      <button class="nav-item nav-item--logout" @click="logout" :title="!isOpen ? 'Keluar' : ''">
        <span class="nav-item__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 2h2.5a.5.5 0 01.5.5v11a.5.5 0 01-.5.5H10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M7 11l3-3-3-3M10 8H3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="nav-item__label" v-if="isOpen">Keluar</span>
      </button>
    </div>

  </aside>
</template>

<style scoped>
.sidebar {
  --color-forest:   #1a3a2a;
  --color-emerald:  #0f5c38;
  --color-mint:     #2eb86a;
  --color-foam:     #e8f4ee;
  --color-ink:      #0d1a12;
  --color-charcoal: #2c3e35;
  --color-stone:    #5a7566;
  --color-silver:   #b8ccc2;
  --color-mist:     #f0f6f2;
  --color-white:    #ffffff;
  --font:           'Plus Jakarta Sans', sans-serif;
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1);

  position: fixed;
  top: 64px;
  left: 0;
  width: 240px;
  height: calc(100vh - 64px);
  background: linear-gradient(180deg, var(--color-forest) 0%, #0f2d1e 100%);
  border-right: 1px solid rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  font-family: var(--font);
  transition: width .28s var(--ease-out);
  overflow: hidden;
  z-index: 100;
  box-shadow: 2px 0 20px rgba(13,26,18,.18);
}
.sidebar--collapsed { width: 60px; }

/* ── TOP ROW (profile + toggle) ── */
.sidebar__top {
  display: flex;
  align-items: center;
  padding: .75rem .5rem .5rem;
  gap: .25rem;
  flex-shrink: 0;
}
.sidebar--collapsed .sidebar__top {
  flex-direction: column;
  align-items: center;
  padding: .75rem .375rem .5rem;
  gap: .5rem;
}

.sidebar__toggle {
  width: 28px; height: 28px;
  background: rgba(255,255,255,.08);
  border: none;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,.6);
  flex-shrink: 0;
  transition: background .15s, color .15s;
}
.sidebar__toggle:hover { background: rgba(255,255,255,.15); color: var(--color-white); }

/* ── PROFILE ── */
.sidebar__profile {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .5rem .625rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background .15s;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}
.sidebar__profile:hover { background: rgba(255,255,255,.08); }
.sidebar--collapsed .sidebar__profile { justify-content: center; gap: 0; flex: none; padding: .5rem; }

.profile__avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
}
.profile__img { width: 100%; height: 100%; object-fit: cover; }
.profile__initials {
  font-size: .75rem;
  font-weight: 800;
  color: white;
  letter-spacing: .02em;
}
.profile__info { overflow: hidden; flex: 1; }
.profile__name {
  display: block;
  font-size: .8125rem;
  font-weight: 700;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile__role {
  display: block;
  font-size: .7rem;
  color: rgba(255,255,255,.5);
  white-space: nowrap;
}

/* ── DIVIDER ── */
.sidebar__divider {
  height: 1px;
  background: rgba(255,255,255,.08);
  margin: .25rem .75rem;
  flex-shrink: 0;
}

/* ── NAV ── */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: .25rem .5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: none;
}
.sidebar__nav::-webkit-scrollbar { display: none; }

.nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .625rem .75rem;
  border-radius: 10px;
  text-decoration: none;
  font-size: .8125rem;
  font-weight: 600;
  color: rgba(255,255,255,.55);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  width: 100%;
  text-align: left;
  transition: background .15s, color .15s;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item:hover { background: rgba(255,255,255,.08); color: var(--color-white); }
.nav-item--active {
  background: rgba(46,184,106,.18) !important;
  color: var(--color-mint) !important;
}
.nav-item--active .nav-item__icon { color: var(--color-mint); }

.sidebar--collapsed .nav-item { justify-content: center; padding: .625rem 0; }

.nav-item__icon {
  width: 16px; height: 16px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: inherit;
}
.nav-item__label { flex: 1; }
.nav-item__pip {
  width: 6px; height: 6px;
  background: var(--color-mint);
  border-radius: 50%;
  flex-shrink: 0;
}
.nav-item__chevron {
  flex-shrink: 0;
  transition: transform .25s var(--ease-out);
  color: rgba(255,255,255,.3);
}
.nav-item__chevron.rotated { transform: rotate(180deg); }

/* Dropdown */
.nav-dropdown {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: .25rem 0 .25rem 2.25rem;
  overflow: hidden;
}
.nav-dropdown__item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .75rem;
  border-radius: 8px;
  font-size: .775rem;
  font-weight: 500;
  color: rgba(255,255,255,.45);
  text-decoration: none;
  transition: background .15s, color .15s;
  white-space: nowrap;
}
.nav-dropdown__item:hover { background: rgba(255,255,255,.08); color: var(--color-white); }
.nav-dropdown__item--active { color: var(--color-mint); font-weight: 700; }
.nav-dropdown__dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,.25);
  flex-shrink: 0;
}
.nav-dropdown__item--active .nav-dropdown__dot { background: var(--color-mint); }

/* Dropdown transition */
.dropdown-enter-active, .dropdown-leave-active { transition: all .25s var(--ease-out); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

/* Logout */
.nav-item--logout { color: rgba(239,68,68,.7) !important; margin-top: 2px; }
.nav-item--logout:hover { background: rgba(239,68,68,.12) !important; color: #ef4444 !important; }

/* Footer */
.sidebar__footer { flex-shrink: 0; padding: .5rem; }
</style>