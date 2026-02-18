<script setup>
  import { ref, computed, onBeforeMount, onMounted } from 'vue';
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  // biar tombolnya bisa berfungsi
   function handleOK(){
    selectMenu('Permintaan Baru')
  }

const nama_user = [localStorage.getItem('nama_depan'), localStorage.getItem('nama_belakang')].join(' ')
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
    // localStorage.setItem('id_role', response.data.ID_Role)
    localStorage.setItem('nip_user', response.data.NIP)
    localStorage.setItem('nama_jabatan', response.data.user_jabatan.Nama_Jabatan)
    localStorage.setItem('nama_organisasi', response.data.user_organisasi.Nama_OPD)
  })
  .catch(error => {
    console.error(error); 
  });
});

// onBeforeMount(() => {
// const role = localStorage.getItem('id_role');
// if (role !== 1) {
//   router.back();
// }})
</script>
  
  <template>
      <div class="container" >
        <div class="greet">
        <h1>Selamat datang, {{ nama_user }}</h1>
        <p>
          Ada yang bisa kami bantu?
        </p>
      </div>
      <div class="boxHolder">
        <div class="box" @click="router.push('/permintaanBaru')">
          <img src="../../../../public/Beranda_Baru.svg" alt="Permintaan Baru">
          <h3>Permintaan Baru</h3>
          <p>Mulai permintaan pelayanan pada Diskominfo Jabar</p>
          <button class="tambah" @click="router.push('/permintaanBaru')">Baru</button>
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
      /* background-color: #FAF4FF; */
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
      max-width: 30rem;
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
      margin: 0 1rem;
      color: #333;
      font-size: 0.9rem;
      text-align: left;
      font-weight: lighter;
      text-align: center;
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
    
      /*teks*/
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
    </style>