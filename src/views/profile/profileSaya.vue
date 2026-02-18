<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import axios from 'axios'
  // transisi ke edit profile
  import { useRouter } from 'vue-router'
  const router = useRouter()
  function toEdit(){
    router.push('/editProfile')
  }

  const namaDepan = ref(localStorage.getItem('nama_depan'))
  const namaBelakang = ref(localStorage.getItem('nama_belakang'))
  const nip = ref(localStorage.getItem('nip_user'))
  const role = ref(localStorage.getItem('nama_role'))
  const jabatan = ref(localStorage.getItem('nama_jabatan'))
  const organisasi = ref(localStorage.getItem('nama_organisasi'))
  const gambar = ref(localStorage.getItem('src_gambar'))

  function updateProfileData() {
    namaDepan.value = localStorage.getItem('nama_depan')
    namaBelakang.value = localStorage.getItem('nama_belakang')
    nip.value = localStorage.getItem('nip_user')
    gambar.value = localStorage.getItem('src_gambar')
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
  if (gambar.value && gambar.value !== 'null') {
    return `/images/${gambar.value}?t=${Date.now()}`;
  }
  return '/images/default.jpeg'; // Default image
});
</script>


<template>
  <div class="profile-card">
    <h2 class="profile-title">Profil Saya</h2>

    <div class="profile-container">
      <!-- FOTO & NAMA -->
      <div class="left-column">
        <img
          :src="imageSrc"
          alt="Foto Profil"
          class="profile-img"
        />
        <div class="button-wrapper">
          <button class="btn-edit" @click="toEdit()">
            Edit
          </button>
        </div>
      </div>

      <!-- DATA PROFIL -->
      <div class="right-column">
        <div class="info-box blue">
          <div class="info-text">
            <strong>Nama Depan</strong>
            <p class= "display-info">{{namaDepan}}</p>
            <strong>Nama Belakang</strong>
            <p class= "display-info">{{namaBelakang}}</p>
            <strong>NIP</strong>
            <p class= "display-info">{{nip}}</p>
            <strong>Role</strong>
            <p class= "display-info">{{role}}</p>
            <strong>Jabatan</strong>
            <p class= "display-info">{{jabatan}}</p>
            <strong>Organisasi</strong>
            <p class= "display-info">{{organisasi}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


.profile-card {
  max-width: 50rem;
  max-height: 60rem;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
}

.profile-title {
  font-size: 2rem;
  font-weight: 550;
  color: black;
  text-align: center;
}

.profile-container {
  min-height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 320px;
  gap: 1rem;
  flex: 1;
}

.profile-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 100%;
  margin-bottom: 0.5rem;
  border: 3px solid #ddd;
}

.button-wrapper {
  align-items: center;
}

.btn-edit {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.8rem 4rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: large;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  transition: transform 0.2s ease;
}

.btn-edit:hover{
  background-color: #66BB6A;
}

.right-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.5rem 4rem 0.5rem 0.5rem;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.info-box {
  display: flex;
  align-items: flex-start;
  border-radius: 1rem;
  gap: 1rem;
}

.info-box.blue {
  background: #f8fafc;
}

.display-info {
  padding: 0.25rem;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  background-color: #f0f0f0;
  border-radius: 10px;
  border: 1px solid #ccc;
  width: 100%;
  display: inline-block;
  font-size: 0.9rem;
}

.icon-area {
  background: #d8ecf0;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  text-align: center;
  font-size: 1.5rem;
  line-height: 45px;
  color: #333;
}

</style>