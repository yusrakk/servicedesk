<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import axios from 'axios';

const isLoading = ref(true)
// === backend ===
const daftarPengguna = ref([])  

onBeforeMount(() => {
  fetchDataUser();
});

const fetchDataUser = () => {
  const token = localStorage.getItem('Token');
  axios.get('/api/user', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    daftarPengguna.value = response.data.map(item => ({
      id: item.ID_User,
      nama_depan: item.Nama_Depan,
      nama_belakang: item.Nama_Belakang,
      NIP: item.NIP,
      role: item.user_role.Nama_Role,
      jabatan: item.user_jabatan?.Nama_Jabatan || '-',
      organisasi: item.user_organisasi?.Nama_OPD || '-',
      status: item.Status
    }))
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
  isLoading.value = false;
  });
};

// === Buat Search ===
const search = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredItems = computed(() => {
  let items = daftarPengguna.value.filter(item =>
    item.nama_depan.toLowerCase().includes(search.value.toLowerCase()) ||
    item.nama_belakang.toLowerCase().includes(search.value.toLowerCase()) ||
    item.role.toLowerCase().includes(search.value.toLowerCase()) ||
    item.organisasi.toLowerCase().includes(search.value.toLowerCase())
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

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
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

// === Modal Delete ===
const showModal = ref(false)
const namaUserToDelete = ref('')
const idUserToDelete = ref(null)

function Delete(item) {
  idUserToDelete.value = item.id
  namaUserToDelete.value = item.nama_depan + ' ' + item.nama_belakang
  showModal.value = true
}

function cancelDelete() {
  showModal.value = false
  idUserToDelete.value = null
}

function confirmDelete() {
  const token = localStorage.getItem('Token');
  axios.delete(`/api/user/${idUserToDelete.value}`, {
  headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(() => {
  fetchDataUser() 
  showModal.value = false
  idUserToDelete.value = null
})

  .catch(error => {
    console.error(error);
    alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus pengguna.');
  });
}

// === Modal Undo Delete ===
const showModalUndo = ref(false)
const namaUserToUndo = ref('')
const idUserToUndo = ref(null)

function undoDelete(item) {
  idUserToUndo.value = item.id
  namaUserToUndo.value = item.nama_depan + ' ' + item.nama_belakang
  showModalUndo.value = true
}

function cancelUndoDelete() {
  showModalUndo.value = false
  idUserToUndo.value = null
}

function confirmUndoDelete() {
  const token = localStorage.getItem('Token');
  axios.delete(`/api/user/undo/${idUserToUndo.value}`, {
  headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(() => {
  fetchDataUser() 
  showModalUndo.value = false
  idUserToUndo.value = null
})

  .catch(error => {
    console.error(error);
    alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus pengguna.');
  });
}

const penggunaTerpilih = computed(() =>
  daftarPengguna.value.find(item => item.id === idUserToUndo.value)
)

function ubahPengguna(user) {
  router.push({
    path: '/ubahPengguna',
    query: {
      user_id: user.id,
      nama_depan: user.nama_depan,
      nama_belakang: user.nama_belakang,
      role: user.role,
      jabatan: user.jabatan,
      organisasi: user.organisasi,
      status: user.status
    }
  })
}
function lihatPengguna(user) {
  router.push({
    path: '/lihatPengguna',
    query: {
      user_id: user.id,
      nama_depan: user.nama_depan,
      nama_belakang: user.nama_belakang,
      NIP: user.NIP,
      role: user.role,
      jabatan: user.jabatan,
      organisasi: user.organisasi,
      status: user.status,
    }
  })
}
</script>

<template>
  <div class="page-bg">
    <div class="user-card">
      <h1 class="title">Daftar Pengguna</h1>
      <div class="top-actions">
        <button class="btn tambah" @click="router.push('TambahPengguna')">Tambah</button>
      </div>
      <input type="text" v-model="search" placeholder="Cari" class="search-bar" />
      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortKey = 'id'">ID</th>
            <th @click="sortKey = 'nama'">Nama</th>
            <th @click="sortKey = 'role'">Role</th>
            <th @click="sortKey = 'organisasi'">Organisasi</th>
            <th @click="sortKey = 'status'">Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="isLoading">
            <td colspan="6" style="text-align: center; padding: 1rem;">
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Memuat data...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredItems.length === 0">
            <td colspan="6" style="text-align: center; padding: 1rem;">Tidak ada user terdaftar</td>
          </tr>
          <tr v-for="(user, index) in paginatedItems" :key="index">
            <td>{{ user.id }}</td>
            <td>{{ user.nama_depan + ' ' + user.nama_belakang }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.organisasi }}</td>
            <td>
              <span :class="['status', user.status.toLowerCase()]">{{ user.status }}</span>
            </td>
            <td>
              <div class="wrapper-aksiBtn">
                <button class="aksiEdit-btn" title="Edit" @click="ubahPengguna(user)">Ubah</button>
                <button v-if="user.status === 'Aktif'" class="aksiDelete-btn" title="Delete" @click="Delete(user)">Nonaktif</button>
                <button v-else class="aksiUndo-btn" title="Undo" @click="undoDelete(user)">Aktif</button>
                <button class="aksiLihat-btn" @click="lihatPengguna(user)">Detail</button>
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
  <!-- Overlay buat delete -->
   <div v-if="showModal" class="modal-overlay">
    <div class="modal-box">
      <h3>Konfirmasi Nonaktifkan</h3>
      <p>
        Apakah Anda yakin ingin menonaktifkan pengguna <strong>{{ namaUserToDelete }}</strong>?
      </p>
      <div class="modal-actions">
        <button class="btn danger" @click="confirmDelete()">Ya, nonaktifkan</button>
        <button class="btn" @click="cancelDelete()">Batal</button>
      </div>
    </div>
   </div>
  <!-- Overlay buat undo delete -->
   <div v-if="showModalUndo" class="modal-overlay">
    <div class="modal-box">
      <h3>Konfirmasi Aktifkan</h3>
      <p>
        Apakah Anda yakin ingin mengaktifkan pengguna <strong>{{ namaUserToUndo }}</strong>?
      </p>
      <div class="modal-actions">
        <button class="btn green" @click="confirmUndoDelete()">Ya, aktifkan</button>
        <button class="btn" @click="cancelUndoDelete()">Batal</button>
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
  font-size: 0.9rem;
  font-family: 'Poppins';
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
/* tombol aksi */
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
/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #0D47A1;
  border-top: 4px solid #64B5F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>