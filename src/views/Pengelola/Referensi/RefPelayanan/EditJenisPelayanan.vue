<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute() 


// === State untuk form ===
const namaJenisPelayanan = ref(route.query.nama_jenis_pelayanan || '')
const jenisPelayananId = ref(route.query.id || '')

function handleSubmit() {
  // Validasi field wajib
  if (!namaJenisPelayanan.value) {
    alert('Harap isi semua field yang bertanda *')
    return
  }

  const token = localStorage.getItem('Token');
  axios.put(`/api/jenispelayanan/update/${jenisPelayananId.value}`
  ,{
    Nama_Jenis_Pelayanan: namaJenisPelayanan.value
  }, {
    headers: {
      Authorization: 'Bearer ' + token,
    }
  })
  .then(function(response){
    console.log(response)
  }) .catch(function(error){
    console.log(error)
  })
  alert('Jenis Pelayanan sudah diubah')
  router.push('/referensi/jenis-pelayanan')
}

// === Reset form ===
function handleReset() {
  namaJenisPelayanan.value = ''
}


</script>

<template>
  <div class="page-bg">
    <h1 class="main-title">Ubah Jenis Pelayanan</h1>
    <div class="form-card">
      <div class="form-card-header">
        Formulir Ubah Jenis Pelayanan
      </div>

      <form class="form-content" @submit.prevent="handleSubmit">
        <div class="form-note">
          <span class="required-text">Keterangan <span class="red">*</span> Harus Diisi</span>
        </div>

        <div class="form-group">
          <label>Nama Jenis pelayanan<span class="red">*</span></label>
          <input type="text" placeholder="Nama Jenis Pelayanan" v-model="namaJenisPelayanan" />
        </div>

        <div class="form-actions">
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