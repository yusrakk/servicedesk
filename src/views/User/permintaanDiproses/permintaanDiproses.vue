<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const isLoading = ref(true)

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID');
}

const router = useRouter()
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

watch(search, () => {
  currentPage.value = 1
})

const items = ref([])

onMounted(() => {
  const token = localStorage.getItem('Token');
  axios.get('/api/pelayananUser', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    items.value = response.data.filter(item =>
      ['Baru', 'Disetujui', 'Proses', 'Selesai', 'Tutup', 'Ditolak'].includes(item.status_pelayanan?.Nama_Status)
    ).map(item => ({
      id: item.ID_Pelayanan,
      ticket: item.ID_Pelayanan,
      jenis: item.ID_Jenis_Pelayanan,
      sub_jenis: item.ID_Sub_Jenis_Pelayanan,
      perihal: item.Perihal,
      teknis: item.teknis_pelayanan?.Nama_Depan || '-',
      date: item.created_at,
      status: item.status_pelayanan?.Nama_Status || '-'
    }))
  })
  .catch(error => {
    console.error('Gagal mengambil data pelayanan:', error);
  })
  .finally(() => {
    isLoading.value = false;
  });
});

function checkProgress(item) {
  router.push({
    name: 'DetailPermintaan', 
    query: {
      layanan: item.ticket,
    },
  }) 
}

// Computed
const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.perihal.toLowerCase().includes(search.value.toLowerCase()) ||
    item.ticket.toLowerCase().includes(search.value.toLowerCase()) ||
    formatDate(item.date).toLowerCase().includes(search.value.toLowerCase()) ||
    item.teknis.toLowerCase().includes(search.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

// Menampilkan hanya ±2 halaman dari current page
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

watch(filteredItems, () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="container">
    <div class="progress-card">
      <h1>Permintaan Layanan</h1>
          <!-- Tombol Tambah -->
    <div class="actions">
      <button class="btn-tambah" @click="router.push('/permintaanBaru' )">
        + Tambah
      </button>
    </div>
      <input type="text" v-model="search" placeholder="Cari" class="search-bar" />
      <table class="rounded-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Perihal</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Detail Proses</th>
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
            <td colspan="6" style="text-align: center; padding: 1rem;">Tidak ada permintaan</td>
          </tr>
          <tr v-for="item in paginatedItems" :key="item.id">
            <td>{{ item.ticket }}</td>
            <td>{{ item.perihal }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>
              <span :class="['status', item.status.toLowerCase()]">{{ item.status }}</span>
            </td>
            <td>
              <a href="#" @click.prevent="checkProgress(item)" style="color: blue; text-decoration: underline;">Cek Progres</a>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
        <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #DCE3DC;
  min-height: 100vh;
  padding: 1rem;
  position: relative;
}

/* Tombol Tambah */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.btn-tambah {
  background-color: #2e7d32;
  color: white;
  font-weight: 600;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-tambah:hover {
  background-color: #256e28;
}

.progress-card {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  width: 95%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  position: relative;
}

.search-bar {
  width: 97%;
  padding: 10px;
  margin-bottom: 40px;
  border: none;
  color: black;
  border-radius: 13px;
  background-color: #e0e0e0;
  font-family: poppins, sans-serif;
}

.rounded-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
}

.rounded-table th, .rounded-table td {
  padding: 10px;
  text-align: left;
  font-size: 0.9rem;
  border-bottom: 1px solid #ddd;
  font-family: poppins, sans-serif;
}

.rounded-table th {
  background-color: #e0e0e0;
}

.rounded-table tr:nth-child(even) {
  background-color: #f2f2f2;
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
