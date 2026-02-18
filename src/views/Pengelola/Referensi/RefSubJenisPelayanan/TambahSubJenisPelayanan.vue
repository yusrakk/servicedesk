<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// State untuk form
const namaSubJenisPelayanan = ref('')
const persyaratan = ref('')
const daftarInputPelayanan = ref([])
const daftarLangkahPelayanan = ref([])
const semuaLangkah = ref([])
const daftarJenisPelayanan = ref([])

const jenisPelayananNama = ref('')
const jenisPelayananId = ref('')

const dropdownTerbukaJenisPelayanan = ref(false)

onMounted(() => {
  const defaultLangkahQuery = route.query.defaultLangkah
  let defaultLangkah = []

  try {
    if (defaultLangkahQuery) {
      defaultLangkah = JSON.parse(defaultLangkahQuery)
    }
  } catch (e) {
    console.error('Gagal parse defaultLangkah dari query:', e)
  }

  // Inisialisasi daftarInputPelayanan hanya dari query
  const langkahDefault = defaultLangkah.map(nama => ({
    namaYangDipilih: nama,
    dropdownTerbuka: false,
    default: true
  }))
  daftarInputPelayanan.value = langkahDefault

  // Ambil semua langkah (hanya untuk dropdown)
  const token = localStorage.getItem('Token')
  axios.get('/api/isi_alur', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => {
    semuaLangkah.value = res.data.data
    daftarLangkahPelayanan.value = res.data.data
      .filter(item => ![1, 2, 3, 4].includes(item.ID_Isi_Alur))
      .map(item => item.Nama_Alur)
  })
  .catch(err => {
      console.error('Gagal mengambil isi_alur:', err)
  })

  axios.get('/api/jenispelayanan', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => {
      daftarJenisPelayanan.value = res.data
      console.log(daftarJenisPelayanan.value)
    })
  .catch(err => {
    console.error('Gagal mengambil jenis pelayanan:', err)
  })
})

// Fungsi hapus jenis pelayanan
function hapuskontakInput(urutanInput) {
  if (daftarInputPelayanan.value[urutanInput].default || daftarInputPelayanan.value[urutanInput].isLast) return
  daftarInputPelayanan.value.splice(urutanInput, 1)
}

// Fungsi untuk menambah input baru
function tambahKotakInputBaru() {
  const langkahSelesai = daftarInputPelayanan.value.pop()

  daftarInputPelayanan.value.push({
    namaYangDipilih: '',
    id: null,
    dropdownTerbuka: false
  })

  daftarInputPelayanan.value.push(langkahSelesai)
}

// Mencari langkah pelayanan yang sesuai dengan teks yang diketik
function cariLangkahYangCocok(teksYangDiketik) {
  if (!teksYangDiketik || teksYangDiketik.trim() === '') {
    return daftarLangkahPelayanan.value
  }

  return daftarLangkahPelayanan.value.filter(namaLangkah =>
    namaLangkah.toLowerCase().includes(teksYangDiketik.toLowerCase())
  )
}

function pilihJenisPelayanan(pelayanan) {
  jenisPelayananNama.value = pelayanan.Nama_Jenis_Pelayanan
  jenisPelayananId.value = pelayanan.ID_Jenis_Pelayanan
}

// Ketika langkah pelayanan dipilih dari dropdown
function pilihLangkahDariDropdown(urutanInput, namaLangkahYangDipilih) {
  daftarInputPelayanan.value[urutanInput].namaYangDipilih = namaLangkahYangDipilih
  daftarInputPelayanan.value[urutanInput].dropdownTerbuka = false
}

// Menutup dropdown setelah input kehilangan fokus
function tutupDropdownSetelahFokusHilang(urutanInput) {
  setTimeout(() => {
    daftarInputPelayanan.value[urutanInput].dropdownTerbuka = false
  }, 100)
}

// Submit handler
function handleSubmit() {
  const langkahValid = daftarInputPelayanan.value
    .filter(i => !i.default && !i.isLast)
    .map(i => i.namaYangDipilih)
    .filter(Boolean)
  if (!namaSubJenisPelayanan.value || !persyaratan.value || langkahValid.length === 0) {
    alert('Harap isi semua keperluan *');
    return;
  }

  const payload = {
    Nama_Sub_Jenis_Pelayanan: namaSubJenisPelayanan.value,
    Persyaratan: persyaratan.value,
    ID_Jenis_Pelayanan: jenisPelayananId.value,
    Langkah_Pelayanan: daftarInputPelayanan.value.map(i => i.namaYangDipilih)
  }

  const token = localStorage.getItem('Token')
  axios.post('/api/sub_jenis_pelayanan/tambah/full', payload,{
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => {
      alert(res.data.message)
      handleReset()
      router.push('/referensi/sub-jenis-pelayanan')
    })
    .catch(err => {
      const errorMessage = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      alert('Gagal menyimpan: ' + errorMessage)
    })
}

// Reset form
function handleReset() {
  namaSubJenisPelayanan.value = ''
  persyaratan.value = ''
  const defaultID = [1, 2, 3, 4]
  const defaultLangkah = semuaLangkah.value
    .filter(item => defaultID.includes(item.ID_Isi_Alur))
    .map(item => ({
      namaYangDipilih: item.Nama_Alur,
      dropdownTerbuka: false,
      default: true
    }))
  daftarInputPelayanan.value = defaultLangkah
}
</script>

<template>
  <div class="page-bg">
    <h1 class="main-title">Tambah Sub Jenis Pelayanan</h1>
    <div class="form-card">
      <div class="form-card-header">
        Formulir Tambah Sub Jenis Pelayanan
      </div>

      <form class="form-content" @keydown.enter.prevent @submit.prevent="handleSubmit">
        <div class="form-note">
          <span class="required-text">Keterangan <span class="red">*</span> Harus Diisi</span>
        </div>

        <div class="form-group">
          <label>Nama Sub Jenis Pelayanan<span class="red">*</span></label>
          <input type="text" placeholder="Nama Sub Jenis Pelayanan" v-model="namaSubJenisPelayanan" />
        </div>

        <div class="form-group">
          <label>Persyaratan<span class="red">*</span></label>
          <textarea placeholder="Persyaratan untuk Sub Jenis Pelayanan" v-model="persyaratan" />
        </div>

        <div class="form-group dropdown-container">
          <label>Jenis Pelayanan<span class="red">*</span></label>
          <select
            v-model="jenisPelayananId"
            @change="event => {
              const id = event.target.value;
              const pelayanan = daftarJenisPelayanan.find(p => p.ID_Jenis_Pelayanan == id);
              pilihJenisPelayanan(pelayanan);
            }"
          >
            <option value="" disabled>Pilih Jenis Pelayanan</option>
            <option
              v-for="pelayanan in daftarJenisPelayanan"
              :key="pelayanan.ID_Jenis_Pelayanan"
              :value="pelayanan.ID_Jenis_Pelayanan"
            >
              {{ pelayanan.Nama_Jenis_Pelayanan }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Langkah Pelayanan<span class="red">*</span></label>

          <div
            v-for="(inputPelayanan, index) in daftarInputPelayanan"
            :key="'langkah-' + index"
            class="form-Layanan"
            style="position: relative; margin-bottom: 12px"
          >
            <input
              v-model="inputPelayanan.namaYangDipilih"
              :readonly="inputPelayanan.default || inputPelayanan.isLast"
              @focus="!inputPelayanan.default && !inputPelayanan.isLast && (inputPelayanan.dropdownTerbuka = true)"
              @input="!inputPelayanan.default && !inputPelayanan.isLast && (inputPelayanan.dropdownTerbuka = true)"
              @blur="tutupDropdownSetelahFokusHilang(index)"
              placeholder="Ketik atau pilih langkah pelayanan spesifik..."
              class="input-langkah"
            />

            <button
              v-if="!inputPelayanan.default && !inputPelayanan.isLast"
              type="button"
              class="hapus-btn"
              @click="hapuskontakInput(index)"
            >
              -
            </button>

            <ul
              v-if="inputPelayanan.dropdownTerbuka"
              class="dropdown"
            >
              <li
                v-for="(langkah, i) in cariLangkahYangCocok(inputPelayanan.namaYangDipilih)"
                :key="'pilihan-' + i"
                @mousedown="pilihLangkahDariDropdown(index, langkah)"
              >
                {{ langkah }}
              </li>
            </ul>
          </div>

          <button type="button" class="btn tambah" @click="tambahKotakInputBaru">
            Tambah Langkah
          </button>
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
.form-group label, .form-Layanan label {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: #222;
}
.form-group input, .form-group select, 
.form-Layanan input, .form-Layanan select {
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fafafa;
  transition: border 0.2s;
  color: black;
  flex: 1;
}
.form-group input:focus, .form-group select:focus,
.form-Layanan input:focus, .form-Layanan select:focus {
  border: 1.5px solid #2196f3;
  outline: none;
}
/* buat layanan */
.form-Layanan {
  display: flex;
  align-items: center;
  flex-direction: row;
}
.langkah-tetap {
  margin-bottom: 1rem;
}
textarea {
  resize: vertical;
  background-color: white;
  color: black;
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  height: 5rem;
  font-family: poppins, sans-serif;
}
.dropdown-container {
  position: relative;
}
.dropdown {
  position: absolute;
  top: 100%; /* di bawah input */
  left: 0;
  width: 100%; /* samakan dengan input */
  max-height: 200px; /* batas ketinggian */
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  z-index: 1000;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 0;
}
.dropdown li {
  padding: 8px 12px;
  cursor: pointer;
}
.dropdown li:hover {
  background-color: #f0f0f0;
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 1rem;
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
.btn.tambah {
  background: #009e3c;
  margin: 1rem auto 0 auto;
  display: block;
}
.btn.tambah:hover {
  background: #00cc4e;
}
.input-langkah {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  box-sizing: border-box;
  font-size: 14px;
}
.hapus-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  font-size: 2rem;
  width: 2.5rem;
  height: 2.5rem;
}
.hapus-btn:hover {
  background-color: #dc2626;
  transform: scale(1.1);
}
</style>