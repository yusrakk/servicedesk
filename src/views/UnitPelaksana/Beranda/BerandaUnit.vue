<script setup>
  import { ref, computed, onBeforeMount, onMounted } from 'vue';
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  //Chart
  import ChartProgressKeseluruhan from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressKeseluruhan.vue'
  import ChartProgressBulanIni from '../../Pengelola/BerandaPengelola/Chart/ChartPie-ProgressBulanIni.vue'

  // biar tombolnya bisa berfungsi
   function handleOK(){
    selectMenu('ApprovalPermintaan')
  }

const nama_user = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ');
const nip_user = ref('')
const nama_jabatan = ref('')
const nama_organisasi = ref('')
const router = useRouter()

onMounted(()=> {
  const token = localStorage.getItem('Token');
  if(!token) {
    router.push('/login')
  }
})

onBeforeMount(() => {
  const token = localStorage.getItem('Token');
  axios.get('/api/user/profile', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    nip_user.value = response.data.NIP
    nama_jabatan.value = response.data.user_jabatan.Nama_Jabatan
    nama_organisasi.value = response.data.user_organisasi.Nama_OPD
    localStorage.setItem('nip_user', response.data.NIP)
    localStorage.setItem('nama_jabatan', response.data.user_jabatan.Nama_Jabatan)
    localStorage.setItem('nama_organisasi', response.data.user_organisasi.Nama_OPD)
  })
  .catch(error => {
    console.error(error); 
  });
});
</script>
  
  <template>
      <div class="container" >
        <div class="greet">
          <h1>Selamat datang, {{ nama_user }}</h1>
          <p>
            Apa yang ingin dilaksanakan hari ini?
          </p>
        </div>
        <div class="boxHolder">
          <div class="box" @click="router.push('/approval')">
            <img src="../../../../public/Approval.svg" alt="Persetujuan Permintaan">
            <h3>Persetujuan Permintaan</h3>
            <p>Setujui permintaan pelayanan yang diajui kepada Diskominfo Jabar</p>
            <button class="tambah" @click="router.push('/approval')">Persetujuan</button>
          </div>
          <div class="box" @click="router.push('/disposisi')">
            <img src="../../../../public/Disposisi.svg" alt="Disposisi Permintaan">
            <h3>Disposisi Permintaan</h3>
            <p>Disposisikan permintaan pelayanan yang telah disetujui</p>
            <button class="lacak" @click="router.push('/disposisi')">Disposisi</button>
          </div>
            <div class="chart-box">
              <div class="chart-container">
                <ChartProgressKeseluruhan/>
              </div>
            </div>
          <div class="chart-box">
            <div class="chart-container">
              <ChartProgressBulanIni />
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <style>
      html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      /* overflow: hidden; */
    }
    </style>
    
    <style scoped>
    
    .container{
      background-color: #FAF4FF;
      min-height: 100vh;
      padding: 1rem;
      position: relative;

    }
    
    .greet h1{
      color: black;
      margin: 0;
      margin-top: 2rem;
      font-size: 37px;
    }
    
    .greet p{
      color: #6B6B6B;
      margin-top: 1rem;
      font-size: 20px;
    }
    
    .boxHolder {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .box {
      background-color: white;
      width: 100%;
      max-width: 35rem;
      min-width: 250px;
      height: 30rem;
      border-radius: 8px;
      box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .chart-box {
      background-color: white;
      width: 100%;
      max-width: 33rem;
      min-width: 250px;
      height: 19rem;
      border-radius: 8px;
      box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    @media (max-width: 900px) {
      .boxHolder {
        flex-direction: column;
        align-items: center;
        gap: 2rem;
      }
      .box {
        max-width: 90vw;
        height: auto;
        margin-top: 2rem;
      }
    }
    
    .box h3 {
      text-align: left;
      margin: 0;
    }
    .box p {
      margin: 0 1rem; /* supaya gak mepet kiri-kanan */
      color: #333;
      font-size: 0.9rem;
      text-align: left;
      font-weight: lighter;
    }

    .box:hover {
      cursor: pointer;
    }
    
    /*tombol baru & lacak*/
    .tambah, .lacak {
      background-color: #006920;
      border-radius: 100px;
      color: white;
      cursor: pointer;
      margin-top: 1.2rem;
      transition: transform 0.1s ease;
    
      /*text*/
      font-size: 1.25rem;
      font-weight: bold;
      padding: 1rem 3rem;
      border: none;
      min-width: 100px; 
    }
  .tambah:hover, .lacak:hover {
    transform: scale(1.02);
    background-color: #52AE6E;
  }

  
.chart-box {
  flex: 1;
  width: 100px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding-left: 16px;
  padding-right: 16px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  margin: 0;
  width: 100%;
  height: 100%;
}

.bar-chart-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.chart-full {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  box-sizing: border-box;
}

.chart-title {
  color: black;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>