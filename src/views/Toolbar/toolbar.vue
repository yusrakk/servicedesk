<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router      = useRouter()
const nama_depan  = ref(localStorage.getItem('nama_depan'))
const nama_belakang = ref(localStorage.getItem('nama_belakang'))
const gambar      = ref(localStorage.getItem('src_gambar'))
const roleId      = ref(parseInt(localStorage.getItem('id_role')))
const showDropdown = ref(false)
const profileRef  = ref(null)

const roleLabel = computed(() => {
  const r = roleId.value
  if (r === 1) return 'User'
  if (r === 2) return 'Pengelola'
  if (r === 3) return 'Unit Pelaksana'
  if (r === 4) return 'Pelaksana Teknis'
  if (r === 5) return 'Kepala Dinas'
  if (r === 6) return 'Superadmin'
  return ''
})

const imageSrc = computed(() => {
  if (gambar.value && gambar.value !== 'null') return `/images/${gambar.value}`
  return null
})

const initials = computed(() => {
  const f = (nama_depan.value || '')[0] || ''
  const l = (nama_belakang.value || '')[0] || ''
  return (f + l).toUpperCase()
})

const fullName = computed(() =>
  [nama_depan.value, nama_belakang.value].filter(Boolean).join(' ')
)

function updateGambar() { gambar.value = localStorage.getItem('src_gambar') }
function updateLogin() {
  nama_depan.value  = localStorage.getItem('nama_depan')
  nama_belakang.value = localStorage.getItem('nama_belakang')
  gambar.value      = localStorage.getItem('src_gambar')
}
function updateProfileData() {
  nama_depan.value  = localStorage.getItem('nama_depan')
  nama_belakang.value = localStorage.getItem('nama_belakang')
}

function handleClickOutside(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('gambar-changed', updateGambar)
  window.addEventListener('sudahLogin', updateLogin)
  window.addEventListener('profile-data-changed', updateProfileData)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('gambar-changed', updateGambar)
  window.removeEventListener('sudahLogin', updateLogin)
  window.removeEventListener('profile-data-changed', updateProfileData)
  document.removeEventListener('click', handleClickOutside)
})

function toggleDropdown() { showDropdown.value = !showDropdown.value }
function toProfile() { showDropdown.value = false; router.push('/profileSaya') }
function logout()    { showDropdown.value = false; localStorage.clear(); router.push('/login') }
</script>

<template>
  <header class="toolbar">
    <!-- Left: Brand -->
    <div class="toolbar__left">
      <div class="toolbar__brand">
        <img src="/LogoServiceDesk.svg" alt="Logo ServiceDesk" class="toolbar__logo" />
        <div class="brand__text">
          <span class="brand__name">ServiceDesk</span>
          <span class="brand__sub">Diskominfo Jawa Barat</span>
        </div>
      </div>
    </div>

    <!-- Right: Profile -->
    <div class="toolbar__right">

      <!-- Notification bell (kosong, bisa diisi nanti) -->
      <button class="toolbar__icon-btn" title="Notifikasi">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M7.5 15.5a1.5 1.5 0 003 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Profile button -->
      <div class="toolbar__profile" ref="profileRef" @click="toggleDropdown">
        <div class="profile__avatar">
          <img v-if="imageSrc" :src="imageSrc" alt="Foto Profil" class="profile__img"/>
          <span v-else class="profile__initials">{{ initials }}</span>
        </div>
        <div class="profile__info">
          <span class="profile__name">{{ fullName || 'Pengguna' }}</span>
          <span class="profile__role">{{ roleLabel }}</span>
        </div>
        <svg class="profile__chevron" :class="{ 'rotated': showDropdown }"
          width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Dropdown -->
      <transition name="dropdown">
        <div v-if="showDropdown" class="toolbar__dropdown" @click.stop>
          <!-- User info header -->
          <div class="dropdown__header">
            <div class="dropdown__avatar">
              <img v-if="imageSrc" :src="imageSrc" alt="Foto Profil" class="profile__img"/>
              <span v-else class="profile__initials">{{ initials }}</span>
            </div>
            <div>
              <p class="dropdown__name">{{ fullName }}</p>
              <p class="dropdown__role">{{ roleLabel }}</p>
            </div>
          </div>
          <div class="dropdown__divider"></div>
          <!-- Menu items -->
          <button class="dropdown__item" @click="toProfile">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Profil Saya
          </button>
          <div class="dropdown__divider"></div>
          <button class="dropdown__item dropdown__item--danger" @click="logout">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2h2.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M6 10l3-3-3-3M9 7H2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Keluar
          </button>
        </div>
      </transition>

    </div>
  </header>
</template>

<style scoped>
.toolbar {
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
  top: 0; left: 0; right: 0;
  height: 64px;
  background: linear-gradient(90deg, var(--color-forest) 0%, var(--color-emerald) 100%);
  border-bottom: 1px solid rgba(255,255,255,.06);
  box-shadow: 0 2px 12px rgba(13,26,18,.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem 0 1rem;
  z-index: 200;
  font-family: var(--font);
}

/* Left */
.toolbar__left {}
.toolbar__brand {
  display: flex;
  align-items: center;
  gap: .625rem;
}
.toolbar__logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}
.brand__text { display: flex; flex-direction: column; gap: 1px; }
.brand__name {
  font-size: .9375rem;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -.01em;
  line-height: 1;
}
.brand__sub {
  font-size: .65rem;
  color: rgba(255,255,255,.55);
  font-weight: 500;
}

/* Right */
.toolbar__right {
  display: flex;
  align-items: center;
  gap: .5rem;
  position: relative;
}

.toolbar__icon-btn {
  width: 36px; height: 36px;
  background: none;
  border: none;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,.65);
  transition: background .15s, color .15s;
}
.toolbar__icon-btn:hover { background: rgba(255,255,255,.1); color: var(--color-white); }

/* Profile button */
.toolbar__profile {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .375rem .625rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background .15s;
  user-select: none;
}
.toolbar__profile:hover { background: rgba(255,255,255,.1); }

.profile__avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.profile__img    { width: 100%; height: 100%; object-fit: cover; }
.profile__initials {
  font-size: .6875rem;
  font-weight: 800;
  color: white;
  letter-spacing: .02em;
}
.profile__info { display: flex; flex-direction: column; gap: 1px; }
.profile__name {
  font-size: .8125rem;
  font-weight: 700;
  color: var(--color-white);
  white-space: nowrap;
  line-height: 1;
}
.profile__role {
  font-size: .6875rem;
  color: rgba(255,255,255,.55);
  white-space: nowrap;
}
.profile__chevron {
  color: rgba(255,255,255,.4);
  transition: transform .25s var(--ease-out);
  flex-shrink: 0;
}
.profile__chevron.rotated { transform: rotate(180deg); }

/* Dropdown */
.toolbar__dropdown {
  position: absolute;
  top: calc(100% + .5rem);
  right: 0;
  width: 220px;
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(168,200,180,.2);
  box-shadow: 0 12px 40px rgba(13,26,18,.12), 0 4px 12px rgba(13,26,18,.06);
  overflow: hidden;
  z-index: 300;
}

.dropdown__header {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .875rem 1rem;
}
.dropdown__avatar {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.dropdown__name {
  font-size: .875rem;
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1;
  margin-bottom: 2px;
}
.dropdown__role {
  font-size: .7rem;
  color: var(--color-stone);
}

.dropdown__divider {
  height: 1px;
  background: var(--color-foam);
  margin: 0;
}

.dropdown__item {
  display: flex;
  align-items: center;
  gap: .625rem;
  width: 100%;
  padding: .75rem 1rem;
  background: none;
  border: none;
  font-family: var(--font);
  font-size: .8125rem;
  font-weight: 600;
  color: var(--color-charcoal);
  cursor: pointer;
  transition: background .15s, color .15s;
  text-align: left;
}
.dropdown__item:hover { background: var(--color-foam); color: var(--color-emerald); }
.dropdown__item--danger { color: #ef4444; }
.dropdown__item--danger:hover { background: #fef2f2; color: #dc2626; }

/* Transition */
.dropdown-enter-active { transition: all .22s var(--ease-out); }
.dropdown-leave-active { transition: all .18s ease-in; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.97); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.98); }

/* Responsive */
@media (max-width: 640px) {
  .profile__info { display: none; }
  .profile__chevron { display: none; }
  .toolbar__profile { padding: .375rem; }
  .brand__sub { display: none; }
}
</style>