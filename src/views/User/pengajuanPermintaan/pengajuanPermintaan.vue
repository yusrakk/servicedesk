<script setup>
import { ref, computed , onBeforeMount, onMounted , watch} from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router';
const isChecked = ref(false)

// buat push layanan ke halaman formulir tiket baru
const router = useRouter()

const services = ref([])
const isLoading = ref(true)
onBeforeMount(() => {
  const token = localStorage.getItem('Token');
  axios.get('/api/subjenispelayanan', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    services.value = response.data;
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    isLoading.value = false;
  });
});

const searchTerm = ref("")
const showModal = ref(false)
const selectedItem = ref(null)
const currentPage = ref(1)
const itemsPerPage = 10

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return services.value.filter((s) =>
    s.Nama_Sub_Jenis_Pelayanan.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / itemsPerPage)
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

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredServices.value.slice(start, start + itemsPerPage)
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

watch(searchTerm, () => {
  currentPage.value = 1
})


function openModal(item) {
  selectedItem.value = item
  showModal.value = true
}
function handleSetuju() {
  const item = selectedItem.value
  if (!item) return

  showModal.value = false
  router.push({
    name: 'FormulirTiketBaru',
    query: { 
      layanan: item.Nama_Sub_Jenis_Pelayanan,
      persyaratan: item.Persyaratan
    }
  })
  localStorage.setItem('ID_Sub_Jenis_Pelayanan', item.ID_Sub_Jenis_Pelayanan)
}

</script>


<template>
  <div class="container">
    <!-- Info box -->
    <div class="info-box">
      <strong>Petunjuk Pelayanan:</strong> <br />
      <p>Siapkan surat permohonan (khusus untuk layanan infrastruktur), serta gambar atau file pendukung untuk memperjelas pelaporan.</p>
      <p>Klik tombol Plus (+) untuk memulai permintaan layanan.</p>
      <p>Pantau perkembangan permintaan/pengaduan melalui notifikasi email dari tim Service Desk.</p>
    </div>

    <!-- Search -->
    <div class="container-pencarian">
      <input type="text" v-model="searchTerm" placeholder="Cari" />
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
    </div>
    
    <div v-else>
      <!-- List Pelayanan -->
      <div class="container-pelayanan">
        <div
          class="list-wrapper"
          v-for="(item, index) in paginatedServices"
          :key="index"
        >
          <div
            class="list-item"
            :class="index % 2 === 0 ? 'grey-bg' : 'white-bg'"
          >
            {{ item.Nama_Sub_Jenis_Pelayanan }}
          </div>
          <button class="tombol-tambah" @click="openModal(item)">+</button>
        </div>
    </div>
    </div>

    <!-- Paging -->
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

  <!-- Popup Persyaratan -->
<div v-if="showModal" class="overlay">
  <div class="overlay-content">
    <button class="close-btn" @click="showModal = false">×</button>

    <h1>Persyaratan</h1>
    <p>
      *Harap pemohon menyertakan atau melapirkan informasi berikut:
    </p>
    <ul style="text-align:left; margin-left:1rem;">
      <li>Jenis Pengguna Akun (Personal/Grup/Fungsi)</li>
      <li>Jenis Akun</li>
      <li>Nama Pengguna</li>
      <li>Nama Afiliasi (Penanggung Jawab)</li>
      <li>Nama Alias email</li>
      <li>Unit Organisasi</li>
      <li>NIP (apabila PNS dan Afiliasi)</li>
      <li>Nomor Telepon</li>
      <li>Nama Penjamin</li>
      <li>NIP Penjamin</li>
      <li>Alamat Surel Penjamin (@jabarprov.go.id)</li>
      <li>Alamat Surel Alternatif Penjamin</li>
    </ul>

    <div>
      <input type="checkbox" id="persyaratanLengkap" v-model="isChecked" />
      <label for="persyaratanLengkap">Persyaratan sudah lengkap</label>
    </div>

    <button class="tombol-ok" :disabled="!isChecked" @click="handleSetuju">
      Setuju
    </button>
  </div>
</div>

</template>

<style scoped>
input[type="checkbox"]{
  cursor: pointer;
}


.container {
  background-color: #faf4ff;
  min-height: 100vh;
  padding: 1rem;
  position: relative;
}

.info-box {
  background-color: #fff8b1;
  border: 1px solid #e6cc00;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(30, 161, 58, 0.1);
  font-family: poppins, sans-serif;
}

.info-box p {
  font-size: small;
  font-weight: 500;
  font-family: poppins, sans-serif;
  margin: 2px;
}

.container-pencarian input {
  background-color: white;
  color: black;
  width: 96%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: poppins, sans-serif;
  border-radius: 9999px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  outline: none;
}

.container-pelayanan {
  width: 100%;
}

.list-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.list-item {
  flex: 1;
  padding: 1rem;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  font-weight: bold;
  font-family: poppins, sans-serif;
  background-color: #e0f7fa;
}

.grey-bg {
  background-color: #e6e6e6;
}

.white-bg {
  background-color: white;
}

.tombol-tambah {
  background-color: #006920;
  color: white;
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.tombol-tambah:hover {
  transform: scale(1.1);
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

/* Overlay Persyaratan */
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

.overlay h3{
  margin-bottom: 3.5rem;
}

.overlay p{
  margin-bottom: 3rem;
}

.overlay label{
  margin: 1rem;
}

.overlay-content {
  background-color: white;
  padding: 1rem;
  border-radius: 18px;
  position: relative;
  min-width: 200px; /*--*/
  max-width: 100%; /* Menyesuaikan isi overlay */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.close-btn {
  color: black;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  font-family: poppins, sans-serif;
  cursor: pointer;
}

.tombol-ok {
  background-color: #cccccc; /* Disable warna by default */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 2rem;
  transition: background-color 0.3s;
}

.tombol-ok:enabled {
  background-color: #2196f3;
}

.tombol-ok:disabled {
  background-color: #cccccc;
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