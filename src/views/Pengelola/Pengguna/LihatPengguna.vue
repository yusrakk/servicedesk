<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// === State untuk form ===
const Nama_Depan = ref(route.query.nama_depan || '')
const Nama_Belakang = ref(route.query.nama_belakang || '')
const role = ref(route.query.role || '')
const organisasi = ref(route.query.organisasi || '')
const status = ref(route.query.status || '')
const user_id = ref(route.query.user_id || '')
const NIP = ref(route.query.NIP || '')
const jabatan = ref(route.query.jabatan || '')

const token = localStorage.getItem('Token')
</script>


<template>
  <div class="page-bg">
    <h1 class="main-title">Detail Pengguna</h1>
    <div class="form-card">
      <div class="form-card-header">
        Informasi Pengguna
      </div>

      <!-- Form pakai @submit.prevent supaya tidak reload -->
      <form class="form-content">
            <strong>Nama Depan</strong>
            <p class="display-info">{{ Nama_Depan }}</p>
            <strong>Nama Belakang</strong>
            <p class="display-info">{{ Nama_Belakang }}</p>
            <strong>NIP</strong>
            <p class="display-info">{{ NIP }}</p>
            <strong>Role</strong>
            <p class="display-info">{{ role }}</p>
            <strong>Jabatan</strong>
            <p class="display-info">{{ jabatan }}</p>
            <strong>Organisasi</strong>
            <p class="display-info">{{ organisasi }}</p>
            <strong>Status</strong>
            <p class="display-info">{{ status }}</p>
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

.display-info {
  padding: 0.7rem;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  background-color: #f0f0f0;
  border-radius: 5px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  width: 95%;
  display: inline-block;
}
</style>