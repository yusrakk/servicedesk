<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()

const UbahPassword = reactive({
  PasswordBaru: '',
  KonfirmasiPassword: '',
  KecocokanPassword: '',
})

const PasswordLama = reactive({
  passwordLama: '',
})

const DataDiri = reactive({
  namaDepan: '',
  namaBelakang: '',
  nip: '',
})

const showOverlay = ref(false)
const selectedImage = ref(null) // for preview
const fileInput = ref(null)
const newImageFile = ref(null) // for upload

const gambar = ref(localStorage.getItem('src_gambar'));
const imageSrc = computed(() => {
  if (gambar.value && gambar.value !== 'null') {
    return `/images/${gambar.value}?t=${Date.now()}`;
  }
  return '/images/default.jpeg'; 
});
const previewSrc = computed(() => selectedImage.value || imageSrc.value);

const userID = localStorage.getItem("ID_User");

onMounted(() => {
  // Load data diri dari localStorage
  DataDiri.namaDepan = localStorage.getItem('nama_depan') || ''
  DataDiri.namaBelakang = localStorage.getItem('nama_belakang') || ''
  DataDiri.nip = localStorage.getItem('nip_user') || ''
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
    selectedImage.value = URL.createObjectURL(file);
    newImageFile.value = file;
  } else {
    alert('Hanya mendukung gambar PNG atau JPEG')
    selectedImage.value = null;
    newImageFile.value = null;
  }
}

function uploadSelectedImage() {
  if (!newImageFile.value) return;
  const token = localStorage.getItem('Token');
  const formData = new FormData();
  formData.append('Gambar_Path', newImageFile.value);
  formData.append('ID_User', userID);
  axios.post('/api/user/profilepict', formData, {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(function(response){
    gambar.value = response.data.nama_file;
    localStorage.setItem('src_gambar', response.data.nama_file);
    window.dispatchEvent(new Event('gambar-changed'));
    selectedImage.value = null;
    newImageFile.value = null;
    showOverlay.value = false;
    router.push('/profileSaya')
  })
  .catch(function(error) {
    console.log(error);
    alert(error.response?.data?.message || 'Terjadi kesalahan saat mengupload foto profil.');
  });
}

function cancelImageChange() {
  selectedImage.value = null;
  newImageFile.value = null;
  showOverlay.value = false;
}

function removeImage() {
  const token = localStorage.getItem('Token');
  axios.delete('/api/user/profilepict', {
    data: {
      ID_User: userID
    },
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    gambar.value = response.data.nama_file;
    localStorage.setItem('src_gambar', response.data.nama_file);
    window.dispatchEvent(new Event('gambar-changed'));
    selectedImage.value = null;
    newImageFile.value = null;
    showOverlay.value = false;
    alert('Foto profil berhasil dihapus!');
    router.push('/profileSaya')
  })
  .catch(error => {
    console.error(error);
    alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus foto profil.');
  });
}

function saveChanges() {
  if (UbahPassword.PasswordBaru !== UbahPassword.KonfirmasiPassword) {
    alert('Konfirmasi password baru tidak cocok!');
    return;
  }
  const token = localStorage.getItem('Token');
  axios.put('/api/user/profile', {
    ID_User: userID,
    PasswordLama: PasswordLama.passwordLama,
    PasswordBaru: UbahPassword.PasswordBaru
  },{
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    alert(response.data.message);
    router.push('/profileSaya')
    cancelChanges();
  })
  .catch(error => {
    console.error(error);
    alert(error.response?.data?.message || "Terjadi kesalahan saat mengubah password.");
  });
}

function saveProfileData() {
  const token = localStorage.getItem('Token');
  axios.put('/api/user/profiledata', {
    ID_User: userID,
    Nama_Depan: DataDiri.namaDepan,
    Nama_Belakang: DataDiri.namaBelakang,
    NIP: DataDiri.nip
  }, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    alert(response.data.message);
    // Update localStorage dengan data baru
    localStorage.setItem('nama_depan', DataDiri.namaDepan)
    localStorage.setItem('nama_belakang', DataDiri.namaBelakang)
    localStorage.setItem('nip_user', DataDiri.nip)
    // Dispatch event untuk update nama di toolbar
    window.dispatchEvent(new Event('profile-data-changed'))
    router.push('/profileSaya')
  })
  .catch(error => {
    console.error(error);
    alert(error.response?.data?.message || "Terjadi kesalahan saat mengubah data diri.");
  });
}

function cancelChanges() {
  UbahPassword.PasswordBaru = ''
  UbahPassword.KonfirmasiPassword = ''
  UbahPassword.KecocokanPassword = ''
  PasswordLama.passwordLama = ''
  router.push('/profileSaya');
}
</script>

<template>
  <div class="edit-profile-container">
    <div class="edit-profile-card">
      <!-- KIRI: FOTO PROFIL -->
      <div class="profile-left">
        <img
          class="profile-image-large"
          :src="imageSrc"
          alt="Foto Profil"
          @click="showOverlay = true"
        />
        <div class="profile-btn-group">
          <button class="btn edit" @click="showOverlay = true">
            <i class="fas fa-pen"></i> Ubah Foto
          </button>
          <button class="btn delete" @click="removeImage">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>

      <!-- TENGAH: FORM DATA DIRI -->
      <div class="profile-middle">
        <h2 class="form-title">Ubah Data Diri</h2>
        <div class="form-group">
          <label>Nama Depan</label>
          <input type="text" v-model="DataDiri.namaDepan" />
        </div>
        <div class="form-group">
          <label>Nama Belakang</label>
          <input type="text" v-model="DataDiri.namaBelakang" />
        </div>
        <div class="form-group">
          <label>NIP</label>
          <input type="text" v-model="DataDiri.nip" />
        </div>
        <div class="button-group">
          <button class="btn save" @click="saveProfileData">Simpan</button>
          <button class="btn cancel" @click="cancelChanges">Batal</button>
        </div>
      </div>

      <!-- KANAN: FORM PASSWORD -->
      <div class="profile-right">
        <h2 class="form-title">Ubah Password</h2>
        <div class="form-group">
          <label>Password Lama</label>
          <input type="password" v-model="PasswordLama.passwordLama" />
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <input type="password" v-model="UbahPassword.PasswordBaru" />
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <input type="password" v-model="UbahPassword.KonfirmasiPassword" />
        </div>
        <div class="button-group">
          <button class="btn save" @click="saveChanges">Simpan</button>
          <button class="btn cancel" @click="cancelChanges">Batal</button>
        </div>
      </div>
      <!-- Overlay Ubah Foto -->
      <div v-if="showOverlay" class="overlay">
        <div class="overlay-content photo-overlay">
          <button class="close-btn" @click="cancelImageChange">×</button>
          <h2 class="overlay-title">Ubah Foto Profil</h2>
          <img
            class="photo-preview"
            :src="previewSrc"
            alt="Preview Foto Profil"
          />
          <input
            type="file"
            ref="fileInput"
            @change="handleImageSelect($event)"
            accept="image/png, image/jpeg"
            style="display: none"
          />
          <div class="wrapper-btn-edit">
            <button class="btn edit" @click="triggerFileInput()">
              <i class="fas fa-pen"></i> Pilih Foto
            </button>
          </div>
          <div class="action-buttons">
            <button class="btn save" :disabled="!newImageFile" @click="uploadSelectedImage">
              <i class="fas fa-save"></i> Simpan
            </button>
            <button class="btn cancel" @click="cancelImageChange">
              <i class="fas fa-times"></i> Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-profile-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f7f7f7;
}
.edit-profile-card {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 260px;
  max-width: 320px;
  flex: 1;
}
.profile-middle {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  min-width: 280px;
  max-width: 350px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.profile-image-large {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  background: #d3d3d3;
  margin-bottom: 1.5rem;
  border: 4px solid #989898;
}
.profile-btn-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  align-items: center;
}
.btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn.edit {
  font-family: 'Poppins';
  background: #2BA9E4;
  align-items: center;
  font-size: 0.9rem;
  color: #fff;
}
.btn.edit:hover {
  background: #48B7ED;
}
.btn.delete {
  font-family: 'Poppins';
  background: #e73030;
  font-size: 0.9rem;
  color: #fff;
}
.btn.delete:hover {
  background: #ff4444;
}
.profile-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem 2rem 1.5rem 2rem;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.form-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #222;
  text-align: left;
}
.form-group {
  margin-bottom: 1.1rem;
  text-align: left;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #222;
  background: #fff;
}
.form-group input:disabled {
  background: #f0f0f0;
  color: #888;
}
.button-group {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}
.btn.save {
  font-family: 'Poppins';
  background: #4CAF50;
  font-size: 0.9rem;
  color: #fff;
}
.btn.save:hover {
  background: #66BB6A;
}
.btn.cancel {
  font-family: 'Poppins';
  background: #e73030;
  font-size: 0.9rem;
  color: #fff;
}
.btn.cancel:hover {
  background: #ff4444;
}
/* Overlay (tetap gunakan style lama) */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.overlay-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  position: relative;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
.photo-overlay {
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  width: 100%;
  border-radius: 20px;
}
.overlay-title {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}
.photo-preview {
  width: 160px;
  height: 160px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 0 auto 1.5rem auto;
  background-size: cover;
  background-position: center;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #f44336;
}
.close-btn:hover {
  color: #d32f2f;
  transform: scale(1.1);
}
.wrapper-btn-edit{
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}

@media (max-width: 900px) {
  .edit-profile-card {
    flex-direction: column;
    align-items: center;
    padding: 2rem 0.5rem;
    gap: 1.5rem;
  }
  .profile-right {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 1.5rem 1rem;
  }
  .profile-middle {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 1.5rem 1rem;
  }
  .profile-left {
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}
</style>
