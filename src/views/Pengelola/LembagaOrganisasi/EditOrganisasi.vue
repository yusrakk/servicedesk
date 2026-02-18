<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'


const router = useRouter()
const route = useRoute() // untuk ambil params ID 

// ambil dari route organisasi
const id_organisasi = ref(route.query.id_organisasi)
const namaPerangkatDaerah = ref(route.query.nama_PerangkatDaerah)
const indukOrganisasi = ref(route.query.indukOrganisasi)
const email = ref(route.query.email || '')
const status = ref(route.query.status || '')
const nomorHP = ref('')
const namaPengelola = ref('')
const pilihanInduk = ref([])
const idOrganisasiTerpilih = ref(route.query.id_induk_organisasi || '')

// buat lihat doang
const readonlyMode = ref(route.query.viewOnly === 'true')

const token = localStorage.getItem('Token');
  axios.get('/api/organisasi', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
   pilihanInduk.value = response.data.map(item => ({
      id_organisasi: item.ID_Organisasi,
      nama_PerangkatDaerah: item.Nama_OPD
    }))
  })
  .catch(error => {
    console.error(error); 
  });

  axios.get(`/api/organisasi/${id_organisasi.value}` , {
    headers: {
      Authorization: 'Bearer ' + token,
    }
  }) .then(response => {
    namaPengelola.value = response.data.Nama_Pengelola,
    nomorHP.value= response.data.No_HP_Pengelola
  })

// === Submit handler (kirim data edit) ===
function handleSubmit() {
  // Validasi field wajib
  if ( !email.value || !status.value || !namaPerangkatDaerah.value || !namaPengelola.value || !nomorHP.value ) {
    alert('Harap isi semua field yang bertanda *')
    return
  }

  // Payload untuk backend
  const payload = {
    Nama_OPD: namaPerangkatDaerah.value,
    ID_Induk_Organisasi: idOrganisasiTerpilih.value || null,
    Nama_Pengelola: namaPengelola.value,
    No_HP_Pengelola: nomorHP.value,
    Email: email.value,
    Status: status.value,
  }

  const token = localStorage.getItem('Token');
  axios.put(`/api/organisasi/${id_organisasi.value}`, payload, {
    headers: {
      Authorization: 'Bearer ' + token,
    }
  })

  console.log('Data yang akan diupdate ke backend:', payload)

  // === Backend: update organisasi by ID ===
  // backend: axios.put(`/api/organisasi/${route.params.id}`, payload)

  alert('Organisasi berhasil diperbarui')
  router.push('/lembaga') // kembali ke daftar lembaga
}

// === Reset form ===
function handleReset() {
  namaPerangkatDaerah.value = ''
  idOrganisasiTerpilih.value = ''
  namaPengelola.value = ''
  nomorHP.value = ''
  email.value = ''
  status.value = ''
}
</script>

<template>
  <div class="page-bg">
    <h1 v-if="!readonlyMode" class="main-title">Edit Organisasi</h1>
    <h1 v-if="readonlyMode" class="main-title">Detail Organisasi</h1>
    <div class="form-card">
      <div v-if="!readonlyMode" class="form-card-header">
        Formulir Ubah Organisasi
      </div>
      <div v-if="readonlyMode" class="form-card-header">
        Informasi Organisasi
      </div>

      <form class="form-content" @submit.prevent="handleSubmit">
        <div class="form-note">
          <span class="required-text">Keterangan <span class="red">*</span> Harus Diisi</span>
        </div>

        <div class="form-group">
          <label>Nama Perangkat Daerah<span class="red">*</span></label>
          <input type="text" placeholder="Nama PD" v-model="namaPerangkatDaerah" :readonly="readonlyMode" />
        </div>

        <div v-if="readonlyMode" class="form-group">
          <label>Induk Perangkat Daerah<span class="red">*</span></label>
          <input type="text" placeholder="Tidak Ada Induk Perangkat Daerah" v-model="indukOrganisasi" :readonly="readonlyMode" />
        </div>


        <div v-if="!readonlyMode" class="form-group">
          <label>Induk Perangkat Daerah</label>
          <select v-model="idOrganisasiTerpilih">
            <option value="" disabled>Pilih Perangkat Daerah</option>
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
          <label>Nama Pengelola<span class="red">*</span></label>
          <input type="text" v-model="namaPengelola" :readonly="readonlyMode" />
        </div>

        <div class="form-group">
          <label>Nomor HP Pengelola<span class="red">*</span></label>
          <input
            type="text"
            inputmode="numeric"
            v-model="nomorHP"
            @input="nomorHP = $event.target.value.replace(/\D/g, '')"
            :readonly="readonlyMode"
          />
        </div>

        <div class="form-group">
          <label>Email <span class="red">*</span></label>
          <input type="email" v-model="email" :readonly="readonlyMode" />
        </div>

        <div class="form-group">
          <label>Status<span class="red">*</span></label>
          <select v-model="status" :disabled="readonlyMode">
            <option value="" disabled>Pilih Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div class="form-actions" v-if="!readonlyMode">
          <button type="submit" class="btn simpan">Simpan</button>
          <button type="button" class="btn hapus" @click="handleReset">Reset</button>
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