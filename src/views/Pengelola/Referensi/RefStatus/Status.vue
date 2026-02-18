<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const isLoading = ref(true)

// === Data Referensi Status ===
const referensiStatus = ref([])

function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID');
}

//===BACKEND=== 
onBeforeMount(() => {
  fetchDataStatus();
});


const fetchDataStatus = () => {
const token = localStorage.getItem('Token');
  axios.get('/api/status', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    referensiStatus.value = response.data.map(item => ({
      id: item.ID_Status,
      nama: item.Nama_Status,
      tglPembuatan: item.created_at || '-'
    }))
  })
  .catch(error => {
    console.error(error); 
  })
  .finally(() => {
    isLoading.value = false;
  });
}

// === Search, Sort & Pagination ===
const search = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10

// === Filter & Sort Data ===
const filteredItems = computed(() => {
  let items = referensiStatus.value.filter(item =>
    item.nama.toLowerCase().includes(search.value.toLowerCase()) ||
    item.tglPembuatan.toLowerCase().includes(search.value.toLowerCase())
  )

  if (sortKey.value) {
    items.sort((a, b) => {
      const valA = a[sortKey.value]?.toString().toLowerCase()
      const valB = b[sortKey.value]?.toString().toLowerCase()
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return items
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goToPage(page) {
  currentPage.value = page
}

watch(search, () => {
  currentPage.value = 1
})

function editStatus(status) {
  router.push({
    path: '/ubahStatus',
    query: {
      nama_status: status.nama,
      statusId: status.id
    }
  })
}
</script>


<template>
    <div class="page-bg">
      <div class="user-card">
        <h1 class="title">Referensi Status</h1>
        <input type="text" v-model="search" placeholder="Cari Status" class="search-bar" />
  
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortKey = 'id'">ID</th>
              <th @click="sortKey = 'nama'">Nama Status</th>
              <th @click="sortKey = 'tglPembuatan'">Tanggal Pembuatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- <tr v-if="isLoading">
              <td colspan="4" style="text-align: center; padding: 1rem;">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredItems.length === 0">
              <td colspan="4" style="text-align: center; padding: 1rem;">Tidak ada data jabatan</td>
            </tr> -->
            <tr v-for="(status, index) in paginatedItems" :key="index">
              <td>{{ status.id }}</td>
              <td>
                <span :class="['status', status.nama.toLowerCase()]">{{ status.nama }}</span>
              </td>
              <td>{{ formatDate(status.tglPembuatan) }}</td>
              <td>
                <div class="wrapper-aksiBtn">
                    <button class="aksiEdit-btn" title="Edit" @click="editStatus(status)">Ubah</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="pagination">
          <button :disabled="currentPage === 1" @click="prevPage">&#60;</button>
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >{{ page }}</button>
          <button :disabled="currentPage === totalPages" @click="nextPage">&#62;</button>
        </div>
      </div>
    </div>

      <!-- Modal Delete -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-box">
      <h3>Konfirmasi Hapus</h3>
      <p>
        Apakah Anda yakin ingin menghapus Status <strong>{{ jabatanToDelete }}</strong>?
      </p>
      <p v-if="isCounting">Mohon tunggu {{ countdown }} detik</p>
      <div class="modal-actions">
        <button v-if="!isCounting" class="btn danger" @click="confirmDelete()">Ya, hapus</button>
        <button class="btn" @click="cancelDelete()">Batal</button>
      </div>
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
.user-card {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}
.file-label {
  margin: 0 0.5rem;
  color: #333;
}
.btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  border-radius: 13px;
  background-color: #e0e0e0;
  color: black;
  font-size: 14px;
  outline: none;
}
.search-bar-color {
  color: black;
}
.search-bar i {
  margin-right: 0.7rem;
  color: #888;
}
.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 1.1rem;
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
  font-size: 14px;
}
.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  font-size: 0.9rem;
  border-bottom: 1px solid #ddd;
}
.data-table tr:nth-child(even){
  background-color: #f9f9f9;
}

.data-table th {
  background-color: #f1f1f1;
}
.data-table tr {
  border-bottom: 1px solid #eee;
}
/* Tombol aksi */
.wrapper-aksiBtn{
  display: flex;
  gap: 3px;
}
/* Pengganti Halaman */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 20px;
}
.pagination button {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: black;
  transition: background 0.2s, color 0.2s;
}
.pagination button.active, .pagination button:focus {
  background: #2196f3;
  color: #fff;
  border: none;
}
.pagination button:disabled {
  opacity: 30%;
  color: black;
  cursor: not-allowed;
}

/* === Modal=== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* === Warna Status === */
.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  text-transform: capitalize;
}
.status.aktif {
  background-color: #e6dcf5;
  color: #6a1b9a;
}
.status.nonaktif {
  background-color: #fff9c4;
  color: #e53935;
}
</style>