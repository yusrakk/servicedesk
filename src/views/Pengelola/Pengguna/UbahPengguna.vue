<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// === State untuk form ===
const idUser = ref(route.query.user_id || '')
const Nama_Depan = ref(route.query.nama_depan || '')
const Nama_Belakang = ref(route.query.nama_belakang || '')
const role = ref(route.query.role || '')
const organisasi = ref(route.query.organisasi || '')
const password = ref('')
const konfirmasiPassword = ref('')

const pilihanRole = ref([])
const idRoleTerpilih = ref('')

const pilihanJabatan = ref([])
const idJabatanTerpilih = ref('')

const pilihanInduk = ref([])
const idOrganisasiTerpilih = ref('')

const token = localStorage.getItem('Token')

// === Ambil data Role ===
axios.get('/api/role', {
  headers: { Authorization: 'Bearer ' + token }
})
.then(response => {
  pilihanRole.value = response.data.map(item => ({
    id_role: item.ID_Role,
    nama_role: item.Nama_Role
  }))

  // Set default sesuai route.query.role
  const match = pilihanRole.value.find(r => r.nama_role === role.value)
  if (match) {
    idRoleTerpilih.value = match.id_role
  }
})
.catch(error => console.error(error))

// === Ambil data Jabatan ===
axios.get('/api/jabatan', {
  headers: { Authorization: 'Bearer ' + token }
})
.then(response => {
  pilihanJabatan.value = response.data.map(item => ({
    id_jabatan: item.ID_Jabatan,
    nama_jabatan: item.Nama_Jabatan
  }))

  // Set default sesuai route.query.jabatan
  const match = pilihanJabatan.value.find(j => j.nama_jabatan === route.query.jabatan)
  if (match) {
    idJabatanTerpilih.value = match.id_jabatan
  }
})
.catch(error => console.error(error))

// === Ambil data Organisasi ===
axios.get('/api/organisasi', {
  headers: { Authorization: 'Bearer ' + token }
})
.then(response => {
  pilihanInduk.value = response.data.map(item => ({
    id_organisasi: item.ID_Organisasi,
    nama_PerangkatDaerah: item.Nama_OPD
  }))

  // Set default sesuai route.query.organisasi
  const match = pilihanInduk.value.find(o => o.nama_PerangkatDaerah === organisasi.value)
  if (match) {
    idOrganisasiTerpilih.value = match.id_organisasi
  }
})
.catch(error => console.error(error))

// === Set Status langsung (karena tidak butuh fetch) ===
// Status sudah otomatis terisi dari v-model="status"

// === Submit handler ===
function handleSubmit() {
  if (!Nama_Depan.value || !Nama_Belakang.value || !idRoleTerpilih.value || !password.value || !konfirmasiPassword.value) {
    alert('Harap isi semua kolom yang bertanda *')
    return
  }

  if (password.value.length < 8) {
    alert("Password minimal 8 karakter")
    return
  }

  if (password.value != konfirmasiPassword.value) {
    alert("Konfirmasi password salah!")
    return
  }

  const payload = {
    Nama_Depan: Nama_Depan.value,
    Nama_Belakang: Nama_Belakang.value,
    ID_Role: idRoleTerpilih.value,
    ID_Jabatan: idJabatanTerpilih.value,
    ID_Organisasi: idOrganisasiTerpilih.value,
    Password: password.value,
  }

  axios.put(`/api/user/${idUser.value}`, payload, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(response => {
    alert('Pengguna berhasil diubah')
    router.push('/pengguna')
  })
  .catch(error => console.log(error))
}
</script>


<template>
  <div class="page-bg">
    <h1 class="main-title">Ubah Pengguna</h1>
    <div class="form-card">
      <div class="form-card-header">
        Formulir Ubah Pengguna
      </div>

      <!-- Form pakai @submit.prevent supaya tidak reload -->
      <form class="form-content" @submit.prevent="handleSubmit">
        <div class="form-note">
          <span class="required-text">Keterangan <span class="red">*</span> Harus Diisi</span>
        </div>

        <div class="form-group">
          <label>Nama Depan<span class="red">*</span></label>
          <input type="text" placeholder= "Nama_Depan" v-model="Nama_Depan" />
        </div>

        <div class="form-group">
          <label>Nama Belakang<span class="red">*</span></label>
          <input type="text" placeholder="Nama Belakang" v-model="Nama_Belakang" />
        </div>

        <div class="form-group">
          <label>Role<span class="red">*</span></label>
          <select v-model="idRoleTerpilih">
            <option disabled value="">Pilih Role</option>
            <option
              v-for="item in pilihanRole"
              :key="item.id_role"
              :value="item.id_role"
            >
              {{ item.nama_role }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Jabatan</label>
          <select v-model="idJabatanTerpilih">
            <option value="">Pilih Jabatan</option>
            <option
              v-for="item in pilihanJabatan"
              :key="item.id_jabatan"
              :value="item.id_jabatan"
            >
              {{ item.nama_jabatan }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Organisasi</label>
          <select v-model="idOrganisasiTerpilih">
            <option value="">Pilih Perangkat Daerah</option>
            <option
              v-for="item in pilihanInduk"
              :key="item.id_organisasi"
              :value="item.id_organisasi"
            >
              {{ item.nama_PerangkatDaerah }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Password <span class="red">*</span></label>
          <input type="password" v-model="password" placeholder="Masukkan Password"/>
        </div>

        <div class="form-group">
          <label>Konfirmasi Password <span class="red">*</span></label>
          <input type="password" v-model="konfirmasiPassword" placeholder="Masukkan Ulang Password"/>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn simpan">Simpan</button>
          <button type="button" class="btn hapus" @click="handleReset">Hapus</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-bg {
  min-height: 100vh;
  background: #f6f0fa;
}
.main-title {
  font-size: 2.4rem;
  font-weight: bold;
  margin: 0 0 1.5rem 2.5rem;
  color: #111;
  letter-spacing: -1px;
}
.form-card {
  background: #fff;
  border-radius: 16px;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  border: 3px solid #bdbdbd;
  overflow: hidden;
}
.form-card-header {
  background-color: #419A4C;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
  padding: 1.2rem 0;
  letter-spacing: 1px;
}
.form-content {
  padding: 2rem 2rem 2.5rem 2rem;
  background: #fff;
}
.form-note {
  margin-bottom: 1.2rem;
}
.required-text {
  color: #e60000;
  font-weight: 600;
  font-size: 1rem;
}
.red {
  color: #e60000;
}
.form-group {
  margin-bottom: 1.1rem;
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: #222;
}
.form-group input,
.form-group select {
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fafafa;
  transition: border 0.2s;
  color: black;
}
.form-group input:focus,
.form-group select:focus {
  border: 1.5px solid #2196f3;
  outline: none;
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 2.2rem;
}
.btn {
  padding: 0.7rem 2.2rem;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
}
.btn.simpan {
  font-family: 'Poppins';
  background: #2BA9E4;
}
.btn.simpan:hover {
  background: #48B7ED;
}
.btn.hapus {
  font-family: 'Poppins';
  background: #e73030;
}
.btn.hapus:hover {
  background: #ff4444;
}
</style>