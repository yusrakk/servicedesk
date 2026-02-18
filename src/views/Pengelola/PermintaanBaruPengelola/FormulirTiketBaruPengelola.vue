<script setup>
import { ref, onMounted, onUnmounted  } from 'vue'
import { useRoute , useRouter } from 'vue-router'
const router = useRouter()
import axios from 'axios'

onUnmounted(() => {
  localStorage.removeItem('ID_Sub_Jenis_Pelayanan');
});

// nerima dari pengajuanPermintaan.vue
const route = useRoute()
const layanan = ref(route.query.layanan || '')
const persyaratan = ref(route.query.persyaratan || '')
const namaPelapor = ref('')
const id_user = localStorage.getItem('ID_User')
const id_sub_jenis_pelayanan = localStorage.getItem('ID_Sub_Jenis_Pelayanan')
const id_jenis_pelayanan = ref('')
const id_status = 2

const perihal = ref('')
const deskripsi = ref('')
const notelp = ref('')
const suratDinas = ref('')
const lampiran = ref('')
const idUnitTerpilih = ref('')
const pesan = ref('')
const pelaksana = ref([])
const suratDinasPath = ref(null)
const lampiranPath = ref(null)
const isSubmitted = ref(false)
const isLoading = ref(false)
const stepsID = ref([]) 

const urgensi = ref([])
const idUrgensiTerpilih = ref('')

const token = localStorage.getItem('Token');
axios.get('/api/pelayanan/unit', {
  headers: { Authorization: 'Bearer ' + token }
})
.then (response => { 
  pelaksana.value = response.data.map(item => ({
      id_user: item.ID_User,
      nama_depan: item.Nama_Depan,
      nama_belakang: item.Nama_Belakang
    }))
    idUnitTerpilih.value = ''
})

axios.get('/api/urgensi', {
  headers: { Authorization: 'Bearer ' + token }
})
.then (response => { 
  urgensi.value = response.data.map(item => ({
      id_urgensi: item.ID_Urgensi,
      nama_urgensi: item.Nama_Urgensi
    }))
    idUrgensiTerpilih.value = ''
})

// Fungsi untuk menangani perubahan file
function handleFileChange(e, field) {
  const file = e.target.files[0]
  const maxSize = 8 * 1024 * 1024 // 8MB

  if (!file) return

  // ❌ Cek tipe file bukan PDF
  if (file.type !== 'application/pdf') {
    alert('❌ Hanya file PDF yang diperbolehkan.')
    e.target.value = ''
    return
  }

  // ❌ Cek ukuran file lebih dari 8MB
  if (file.size > maxSize) {
    alert('❌ Ukuran file melebihi 8MB. Silakan pilih file yang lebih kecil.')
    e.target.value = ''
    return
  }

  // ✅ Simpan file
  if (field === 'suratDinas') {
    suratDinas.value = file
  } else if (field === 'lampiran') {
    lampiran.value = file
  }
}

async function uploadFiles() {
  if (!suratDinas.value && !lampiran.value) {
    alert('Harap unggah semua keperluan');
    return false;
  }

  const token = localStorage.getItem('Token');
  const formData = new FormData();
  formData.append('surat_dinas', suratDinas.value);
  formData.append('lampiran', lampiran.value);

  try {
    const response = await axios.post('/api/uploadKeperluan', formData, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'multipart/form-data'
      }
    });

    suratDinasPath.value = response.data.surat_dinas;
    lampiranPath.value = response.data.lampiran;
    return true;

  } catch (error) {
    console.log(error);
    alert('Upload gagal: ' + (error.response?.data?.message || error.message));
    return false;
  }
}

async function handleSubmit(){
  if (isSubmitted.value) {
    alert('Permintaan sudah dikirim sebelumnya.');
    return;
  }

  if (
    !namaPelapor.value ||
    !notelp.value ||
    !perihal.value ||
    !deskripsi.value ||
    !idUnitTerpilih.value ||
    !idUrgensiTerpilih.value) {
      alert('Harap isi semua kolom yang bertanda *')
      return
  }

  if (isLoading.value) {
    return; // Prevent multiple submissions
  }

  const confirmSubmit = window.confirm("Apakah Anda yakin ingin mengirim permintaan ini?");
    if (!confirmSubmit) return;

  isLoading.value = true; // Start loading

  const uploaded = await uploadFiles()

  if (!uploaded) {
    isLoading.value = false; // Stop loading if upload fails
    return;
  }

  const token = localStorage.getItem('Token');
  axios.post('/api/pelayanan/tambah', {
    "ID_User": id_user,
    "Nama_Pelapor": namaPelapor.value,
    "ID_Sub_Jenis_Pelayanan": id_sub_jenis_pelayanan,
    "ID_Jenis_Pelayanan": id_jenis_pelayanan,
    "ID_Status": id_status,
    "Perihal": perihal.value,
    "Deskripsi": deskripsi.value,
    "No_Telp": notelp.value,
    "Surat_Dinas_Path": suratDinasPath.value,
    "Lampiran_Path": lampiranPath.value,
    "ID_Unit": idUnitTerpilih.value,
    "Pesan_Pengelola": pesan.value,
    "ID_Urgensi": idUrgensiTerpilih.value
  },{
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(async response => {
    try {
      isSubmitted.value = true;
      isLoading.value = false;

      const role = parseInt(localStorage.getItem('id_role'));
      if (role === 1){
        router.push('/permintaanDiproses');
      } else if (role === 2){
        router.push('/pelayanan');
      }

      const pelayananIdBaru = response.data.ID_Pelayanan;
      console.log('ID_Pelayanan: ', pelayananIdBaru);
      await new Promise(resolve => setTimeout(resolve, 500));
      const progressResponse = await axios.get(`/api/pelayanan/alur/progress/${pelayananIdBaru}`, {
        headers: { Authorization: 'Bearer ' + token }
      });

      const progressData = progressResponse.data
      stepsID.value = progressData.map(item => item.ID_Progress_Alur)
      const idProgressLangkah3 = stepsID.value[2] // pastikan ini terisi
      if (idProgressLangkah3) {
        const progressUrl = `/api/progress-alur/update-status/${idProgressLangkah3}`

        await axios.put(progressUrl, {
          Is_Done: 1
        }, {
          headers: { Authorization: 'Bearer ' + token }
        })
      } else {
      console.warn('ID Progress langkah ke-3 tidak tersedia.')
      }
    } catch (progressError) {
      console.error('Gagal ambil progress:', progressError.response?.data || progressError.message);
      isLoading.value = false;
    }
  })
  .catch(error => {
    console.error(error.response?.data || error.message);
    isLoading.value = false; // Stop loading on error
  });
}
</script>

<template>
  <div class="form-container">
    <div class="form-card">
      <div class="form-title">Formulir Tiket Baru</div>
      <div class="info-box">
      <strong>Persyaratan Pelayanan:</strong> <br />
      <p class="multiline">{{ persyaratan }}</p>
    </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-note">
          <span class="required-text">Keterangan <span class="red">*</span> Harus Diisi</span>
        </div>
        <label>Pelapor<span class="red">*</span></label>
        <input type="text" v-model="namaPelapor" placeholder="Masukkan nama pelapor" maxlength="50"/>
        <!---bagian ini ditambahkan kolom no Telp-->
        <label>No Telp<span class="red">*</span></label>
        <input type="text" v-model="notelp" placeholder="Masukkan Nomor Telpon" maxlength="50"/>

        <label>Layanan<span class="red">*</span></label>
        <p class="display">{{ layanan }}</p>

        <label>Perihal<span class="red">*</span></label>
        <input type="text" v-model="perihal" placeholder="Masukkan perihal" maxlength="50"/>

        <label>Deskripsi<span class="red">*</span></label>
        <textarea v-model="deskripsi" rows="5" placeholder="Masukkan deskripsi"></textarea>

        <label>Unit Pelaksana<span class="red">*</span></label>
        <select v-model="idUnitTerpilih">
          <option disabled value="">Pilih Unit Pelaksana</option>
          <option
            v-for="item in pelaksana"
            :key="item.id_user"
            :value="item.id_user"
          >
            {{ item.nama_depan }} {{ item.nama_belakang }}
          </option>
        </select>

        <label>Urgensi<span class="red">*</span></label>
        <select v-model="idUrgensiTerpilih">
          <option disabled value="">Pilih Urgensi</option>
          <option
            v-for="item in urgensi"
            :key="item.id_urgensi"
            :value="item.id_urgensi"
          >
            {{ item.nama_urgensi }}
          </option>
        </select>

        <label>Surat Dinas<span class="red">*</span></label>
        <input type="file" accept=".pdf" @change="handleFileChange($event, 'suratDinas')" />
        <p class="note">(Hanya PDF, maksimum 8MB)</p>

        <label>Lampiran<span class="red">*</span></label>
        <input type="file" accept=".pdf" @change="handleFileChange($event, 'lampiran')" />
        <p class="note">(Hanya PDF, maksimum 8MB)</p>


        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Mengirim...' : 'Kirim' }}
        </button>
      </form>
    </div>
  </div>
  
</template>

<style scoped>
.form-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: start;
}
/* disini saya membetulkan bagian card lebih dilebarkan */
.form-card {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  overflow: hidden;
}

.form-title {
  background-color: #419A4C;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  font-family: poppins, sans-serif;
}

form {
  padding: 2rem;
}

.display{
  padding: 0.7rem;
  margin-bottom: 1rem;
  background-color: #f0f0f0;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 95%;
  font-size: 0.9rem;
  font-family: poppins, sans-serif;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

input[type="text"],
select,
textarea,
input[type="file"] {
  cursor:pointer;
  width: 95%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: white;
  color: black;
  font-size: 0.9rem;
  font-family: poppins, sans-serif;
}

textarea {
  resize: vertical;
  border: 2px solid #4285f4;
  height: 7rem;
  font-family: poppins, sans-serif;
}

.form-note {
  margin-bottom: 1.2rem;
}
.required-text {
  color: #e60000;
  font-weight: 600;
  font-size: 1.1rem;
}
.red {
  color: #e60000;
}

.note {
  color: red;
  font-size: 0.75rem;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
}

button {
  background-color: #3ba0f3;
  color: white;
  padding: 0.7rem 3rem;
  border: none;
  border-radius: 999px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  margin: 2rem auto 0;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #53b2ff;
  box-shadow: 0 4px 8px rgba(59, 160, 243, 0.3);
}

button:active {
  box-shadow: 0 2px 4px rgba(51, 141, 214, 0.3);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

button:disabled:hover {
  background-color: #cccccc;
  box-shadow: none;
}

.info-box {
  background-color: #fff8b1;
  border: 1px solid #e6cc00;
  padding: 1rem;
  border-radius: 0px 0px 8px 8px;
  margin-bottom: -0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: poppins, sans-serif;
}

.info-box p {
  font-size: small;
  font-weight: 500;
  margin: 2px;
  font-family: poppins, sans-serif;
}
.multiline {
  white-space: pre-line;
}

</style>