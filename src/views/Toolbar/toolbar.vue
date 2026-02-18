<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const nama_depan = ref(localStorage.getItem('nama_depan'))
const nama_belakang = ref(localStorage.getItem('nama_belakang'))
const role = ref(localStorage.getItem('id_role'))
const imageSrc = ref('/images/default.jpeg')
const menuItem = ref(null)
const showOverlay = ref(false)
const profileRef = ref(null)
const router = useRouter()

function updateGambar() {
  imageSrc.value = localStorage.getItem('src_gambar') || '/images/default.jpeg'
}

function updateLogin() {
  nama_depan.value = localStorage.getItem('nama_depan')
  nama_belakang.value = localStorage.getItem('nama_belakang')
  imageSrc.value = localStorage.getItem('src_gambar')
}

function updateProfileData() {
  nama_depan.value = localStorage.getItem('nama_depan')
  nama_belakang.value = localStorage.getItem('nama_belakang')
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

function toggleOverlay() {
  showOverlay.value = !showOverlay.value
}

function handleClickOutside(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showOverlay.value = false
  }
}

function toProfile() {
  showOverlay.value = false
  router.push('/profileSaya')
}

function logout() {
  showOverlay.value = false
  localStorage.clear()
  router.push('/login')
}

if (role.value == 1) role.value = "User"
else if (role.value == 2) role.value = "Pengelola"
else if (role.value == 3) role.value = "Unit Pelaksana"
else if (role.value == 4) role.value = "Pelaksana Teknis"
else if (role.value == 5) role.value = "Kepala Dinas"
else {
  role.value = null
  menuItem.value = null
}
</script>


<template>
  <div class="toolbar">
    <!-- 🔹 Kiri: Logo / Judul -->
    <div class="toolbar-left">
      <h3 class="toolbar-title">Service Desk 3.0</h3>
    </div>

    <!-- 🔹 Kanan: Profil -->
    <div class="toolbar-right">
      <div class="profile" ref="profileRef" @click="toggleOverlay">
        <img
          :src="imageSrc"
          alt="Foto Profil"
          class="gambar-profile"
        />
        <div class="nama-wrapper">
          <span class="nama-profile">{{ nama_depan + ' ' + nama_belakang }}</span>
          <small class="role">{{ role }}</small>
        </div>
      </div>

      <!-- 🔹 Dropdown menu -->
      <div v-if="showOverlay" class="overlay-menu" @click.stop>
        <ul>
          <li @click="toProfile">Profil Saya</li>
          <li @click="logout">Keluar</li>
        </ul>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* 🔹 Toolbar Utama */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  padding: 0 1.5rem;
  background-color: #375B47;
  border-bottom: 1px solid #ddd;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
}

/* 🔹 Judul di kiri */
.toolbar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fbfafb;
}

/* 🔹 Area kanan (profil) */
.toolbar-right {
  display: flex;
  align-items: center;
  position: relative;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 30px;
  transition: background 0.2s ease;
}

.profile:hover {
  background: #faf9fc;
}

.gambar-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid #1f89c6;
}

.nama-wrapper {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.nama-profile {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.role {
  font-size: 0.75rem;
  color: #777;
}

/* 🔹 Dropdown overlay */
.overlay-menu {
  position: absolute;
  top: 65px;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 160px;
  animation: fadeIn 0.2s ease;
  overflow: hidden;
}

.overlay-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.overlay-menu li {
  padding: 0.7rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: background 0.2s ease;
}

.overlay-menu li:hover {
  background-color: #C3EAC5;
  color: #5A9272;
}

/* 🔹 Animasi muncul dropdown */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>