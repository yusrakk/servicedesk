<script setup>
import { ref, computed, watch , onMounted} from 'vue'
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter()
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID');
}

const isLoading = ref(true)
const layananData = ref([]);
const sortKey = ref('') 
const sortOrder = ref(null) 
const steps = ref('')

onMounted(() => {
  const token = localStorage.getItem('Token');
  axios.get('/api/pelayanan/hasil/teknis', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    layananData.value = response.data.map(item => ({
      noTiket: item.ID_Pelayanan,
      jenis: item.ID_Jenis_Pelayanan,
      sub_jenis: item.ID_Sub_Jenis_Pelayanan,
      perihal: item.Perihal,
      pelapor: item.Nama_Pelapor,
      tanggal: item.created_at,
      status: item.status_pelayanan.Nama_Status,
      terkirim: item.Is_Done,
      urgensi: item.urgensi_pelayanan?.Nama_Urgensi || '-'
    }))
  })
  .catch(error => {
    console.error('Gagal mengambil data pelayanan:', error);
  })
  .finally(() => {
    isLoading.value = false;
  });
});

//ke halaman detail 
function lihatDetail(item){
  const pelayananId = ref(item.noTiket)
    router.push({
    name: 'DetailHasilPengerjaan', 
    query: {
      layanan: item.noTiket,
    }
  })
}

function toggleSort(key) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = 'asc'
  } else {
    // urutannya: asc -> desc -> unsorted
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortKey.value = ''
      sortOrder.value = null
    } else {
      sortOrder.value = 'asc'
    }
  }
}

// Buat Searching
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredItems = computed(() => {
  let items = layananData.value.filter(item =>
    item.perihal.toLowerCase().includes(search.value.toLowerCase()) ||
    item.noTiket.toLowerCase().includes(search.value.toLowerCase()) ||
    item.pelapor.toLowerCase().includes(search.value.toLowerCase()) ||
    formatDate(item.tanggal).toLowerCase().includes(search.value.toLowerCase()) ||
    item.status.toLowerCase().includes(search.value.toLowerCase())
  )

  if (sortKey.value && sortOrder.value) {
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

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
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

watch(search, () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="container">
    <div class="card">
      <h1 class="title">Hasil Pengerjaan</h1>
      <input type="text" v-model="search" placeholder="Cari" class="search-bar" />
      
      <table class="rounded-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Perihal</th>
            <th>Tanggal</th>
            <th>Pelapor</th>
            <th>Urgensi</th>
            <th @click="toggleSort('status')" class="cursor-pointer">Status
                <span v-if="sortKey === 'status' || sortOrder === null">
                <span v-if="sortOrder === 'asc'">🔼</span>
                <span v-else-if="sortOrder === 'desc'">🔽</span>
                <span v-else>☰</span>
              </span>
            </th>
            <th>Detail Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="7" style="text-align: center; padding: 1rem;">
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Memuat data...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredItems.length === 0">
            <td colspan="7" style="text-align: center; padding: 1rem;">Tidak ada permintaan pelayanan</td>
          </tr>
          <tr v-for="(item, index) in paginatedItems" :key="index">
            <td>{{ item.noTiket }}</td>
            <td>{{ item.perihal }}</td>
            <td>{{ formatDate(item.tanggal) }}</td>
            <td>{{ item.pelapor }}</td>
            <td>{{ item.urgensi }}</td>
            <td>
              <span :class="['status', item.status.toLowerCase()]">{{ item.status }}</span>
            </td>
            <td>
              <button class="detail-button" @click="lihatDetail(item)">Lihat</button>
              <span :class="['lingkaran', item.terkirim.toString()]"></span>
            </td>
          </tr>
        </tbody>
      </table>

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
  background-color: #faf4ff;
  min-height: 100vh;
  padding: 2rem;
}

.card {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
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
}

.rounded-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
  font-size: 14px;
}

.rounded-table th, .rounded-table td {
  padding: 12px;
  text-align: left;
  font-size: 0.9rem;
  border-bottom: 1px solid #ddd;
}

.rounded-table th {
  background-color: #f1f1f1;
}

.rounded-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.lingkaran {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.lingkaran.false{
  background-color: #E0E0E0;
}

.lingkaran.true{
  background-color: #22ff00;
}

.detail-button {
  background: none;
  border: none;
  color: #1e88e5;
  cursor: pointer;
  text-decoration: underline;
  font-size: 13px;
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

.rounded-table th {
  cursor: default !important; /* Use 'default' for arrow cursor, override any text cursor */
}
</style>