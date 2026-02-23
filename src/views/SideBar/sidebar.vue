  <script setup>

  // Imports
  import { ref , onBeforeUnmount, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import LogoServiceDesk from '../../../public/LogoServiceDesk.svg'
  import IconProfile from '../../../public/profileicon.svg'
  import IconKeluar from '../../../public/iconkeluar.svg'
  import IconBeranda from '../../../public/iconberanda.svg'
  import IconPermintaanBaru from '../../../public/iconpermintaanbaru.svg'
  import IconPermintaanDiproses from '../../../public/iconpermintaandiproses.svg'
  import IconHasilPemenuhanBASLA from '../../../public/iconpemenuhanbasla.svg'
  import IconRiwayat from '../../../public/iconriwayat.svg'
  import IconDaftarPelayanan from '../../../public/icondaftarpelayanan.svg'
  import IconReferensi from '../../../public/iconreferensi.svg'
  import IconLembagaOrganisasi from '../../../public/iconlembagaorganisasi.svg'
  import IconJabatan from '../../../public/iconjabatan.svg'
  import IconStatus from '../../../public/iconstatus.svg'
  import IconUrgensi from '../../../public/iconurgensi.svg'
  import IconPersetujuanPelayanan from '../../../public/iconpersetujuanpelayanan.svg'
  import IconDisposisiPelayanan from '../../../public/icondisposisipelayanan.svg'
  import IconHasilPengerjaan from '../../../public/iconhasilpengerjaan.svg'
  import IconKepuasanUserKeseluruhan from '../../../public/iconlaporankepuasanuserkeseluruhan.svg'
  import IconKepuasanUserBulanIni from '../../../public/iconlaporankepuasanuserbulan.svg'
  import IconJenisPelayanan from '../../../public/iconjenispelayanan.svg'
  import IconSubJenisPelayanan from '../../../public/iconsubjenispelayanan.svg'

  const nama_depan = ref(localStorage.getItem('nama_depan'));
  const nama_belakang = ref(localStorage.getItem('nama_belakang'));
  const gambar = ref(localStorage.getItem('src_gambar'));
  const role = ref(localStorage.getItem('id_role'))

  const imageSrc = computed(() => {
    if (gambar.value && gambar.value !== null) {
      return `/images/${gambar.value}`;
    }
    return '/images/default.jpeg'; // Default image
  });
  const profileRef = ref(null)

  // dropdown referensi
  const dropdownref = ref(null)

  // biar auto update
  onMounted(() => {
    window.addEventListener('gambar-changed', () => {
      gambar.value = localStorage.getItem('src_gambar');
    });

    window.addEventListener('sudahLogin', () => {
      nama_depan.value = localStorage.getItem('nama_depan');
      nama_belakang.value = localStorage.getItem('nama_belakang');
      gambar.value = localStorage.getItem('src_gambar');
    });
    //buat close dropdown click di luar
    document.addEventListener('click', handleClickOutside);
  });

  const tampilinOverlay = ref(false)

  function togglereferensi() {
    dropdownref.value = !dropdownref.value;
    tampilinOverlay.value = !tampilinOverlay.value;
  }

  // Refs untuk elemen wrapper
  function toggleOverlay() {
    tampilinOverlay.value = !tampilinOverlay.value
  }

  function handleClickOutside(event) {
    if (
      tampilinOverlay.value &&
      profileRef.value &&
      !profileRef.value.contains(event.target)
    ) {
      tampilinOverlay.value = false
    }
    else if (
      tampilinOverlay.value &&
      dropdownref.value &&
      !dropdownref.value.contains(event.target)
    ) {
      tampilinOverlay.value = false
    }
  }

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  const menuItem = ref([])
  const router = useRouter()
  //logout
  function logout(){
      localStorage.clear();
      router.push('/login')
    }
  //ke profile
  function toProfile(){
      router.push('/profileSaya')
    }

  // biar bisa buka tutup
  const isOpen = ref(true)
  function toggleSidebar() {
    const newState = !isOpen.value
    isOpen.value = newState
    // Dispatch custom event to notify parent components
    window.dispatchEvent(new CustomEvent('sidebar-toggle', {
      detail: { isCollapsed: !newState }
    }))
  }
  //menu items
  if (role.value == 1) {
    role.value = "User"
    menuItem.value = [
    { icon: IconBeranda, label: 'Beranda', to: '/beranda' },
    { icon: IconPermintaanBaru, label: 'Permintaan Layanan', to: '/permintaanDiproses' },
    //{ icon: IconPermintaanDiproses, label: 'Permintaan Diproses', to: '/permintaanDiproses' },
    //{ icon: IconHasilPemenuhanBASLA, label: 'Hasil Pemenuhan BA dan SLA', to: '/hasilPemenuhanBASLA' },
    //{ icon: IconRiwayat, label: 'Riwayat', to: '/riwayat' },
  ];
  } else if (role.value == 2) {
    role.value = "Pengelola"
    menuItem.value = [
    { icon: IconBeranda, label: 'Beranda', to: '/Beranda-Pengelola' },
    { icon: IconPermintaanBaru, label: 'Permintaan Layanan', to: '/pelayanan' },
    { icon: IconPermintaanBaru, label: 'Permintaan Layanan', to: '/akun' },
    { icon: IconDaftarPelayanan, label: 'Daftar Pelayanan', to: '/pelayanan' },
    // { icon: IconDaftarPelayanan, label: 'Daftar Pelayanan', to: '/pelayanan' },
    //{ icon: IconReferensi, label: 'Referensi', children: [ 
    // { icon: IconLembagaOrganisasi, label: 'Lembaga/Organisasi', to: '/lembaga'},
    // { icon: IconJabatan, label: "Jabatan", to: '/referensi/jabatan'},
    // { icon: IconStatus, label: "Status", to: '/referensi/status'},
    // { icon: IconJenisPelayanan, label: "Jenis Pelayanan", to: '/referensi/jenis-pelayanan'},
      //{ icon: IconSubJenisPelayanan, label: "Sub Jenis Pelayanan", to: '/referensi/sub-jenis-pelayanan'},
    // { icon: IconUrgensi, label: "Urgensi", to: '/referensi/urgensi'},
    //] },
    //{ icon: IconProfile, label: 'Pengguna', to: '/pengguna' },
  ];
  } else if (role.value == 3) {
    role.value = "Unit Pelaksana"
    menuItem.value = [
    { icon: IconBeranda, label: 'Beranda', to: '/berandaUnit' },
    { icon: IconPersetujuanPelayanan, label: 'Permintaan Layanan', to: '/approval' },
    //{ icon: IconDisposisiPelayanan, label: 'Disposisi Permintaan Layanan', to: '/disposisi' },
  ];
  } else if (role.value == 4) {
    role.value = "Pelaksana Teknis"
    menuItem.value = [
    { icon: IconBeranda, label: 'Beranda', to: '/berandaTeknis' },
    //{ icon: IconDisposisiPelayanan, label: 'Disposisi Permintaan Layanan', to: '/disposisiTeknis' },
    //{ icon: IconHasilPengerjaan, label: 'Hasil Pengerjaan Permintaan Layanan', to: '/hasilPengerjaan' },
    { icon: IconPermintaanBaru, label: 'Permintaan Layanan', to: '/permintaanTeknis' },
  ];
  } else if (role.value == 5) {
    role.value = "Kepala Dinas"
    menuItem.value = [
    { icon: IconBeranda, label: 'Beranda', to: '/berandaKD' },
    { icon: IconKepuasanUserKeseluruhan, label: 'Laporan dan Hasil Kepuasan Pengguna Keseluruhan', to: '/KepuasanUserKeseluruhan'},
    { icon: IconKepuasanUserBulanIni, label: 'Laporan dan Hasil Kepuasan Pengguna Bulan ini', to: '/KepuasanUserBulanIni'}
  ];
  } else if (role.value == 6) {
    role.value = "Superadmin"
    menuItem.value = [
    // Beranda
    { icon: IconBeranda, label: 'Beranda', to: '/Beranda-Pengelola' },

    // Permintaan Layanan
    { icon: IconDaftarPelayanan, label: 'Permintaan Layanan', to: '/pelayanan' },

    // Pengguna
    { icon: IconProfile, label: 'Pengguna', to: '/pengguna' },

    // Referensi (Dropdown)
    { icon: IconReferensi, label: 'Referensi', children: [
      { icon: IconLembagaOrganisasi, label: "Lembaga", to: '/lembaga'},
      { icon: IconJabatan, label: "Jabatan", to: '/referensi/jabatan'},
      { icon: IconStatus, label: "Status", to: '/referensi/status'},
      { icon: IconJenisPelayanan, label: "Jenis Pelayanan", to: '/referensi/jenis-pelayanan'},
      { icon: IconUrgensi, label: "Urgensi", to: '/referensi/urgensi'},
      { icon: IconSubJenisPelayanan, label: "Sub Jenis Pelayanan", to: '/referensi/sub-jenis-pelayanan'},
    ] },
  ];
  } else {
    role.value = null
    menuItem.value = null
  }

  </script>

  <template>
    <div :class="['sidebar', { collapsed: !isOpen }]">
      <!-- Logo -->
      <div class="logo-wrapper">
        <div :class="['logo', { collapsed: !isOpen }]">
          <template v-if="isOpen">
            <img :src="LogoServiceDesk" alt="Logo" class="sidebar-logo-large" />
            <span class="logo-text">Service<br>Desk V3.0</span>
          </template>
          <template v-else>
            <img :src="LogoServiceDesk" alt="Logo" class="sidebar-logo" />
          </template>
        </div>
      </div>

      <!-- Tombol Toggle -->
      <button class="tombol-toggle" @click="()=> {toggleSidebar(); toggleOverlay();}">
        ☰
      </button>

      <!-- Menu -->
      <template v-for="item in menuItem" :key="item.label">
        <!-- Menu dengan dropdown -->
        <template v-if="item.children">
          <div class="menu-item" @click="togglereferensi">
            <img :src="item.icon" alt="Icon" class="Icon"/>
            <span v-if="isOpen">{{ item.label }}</span>
          </div>
          <!-- Dropdown anak -->
          <ul v-if="dropdownref" class="dropdown-list">
            <li v-for="child in item.children" :key="child.label" class="dropdown-list-child">
              <router-link :to="child.to" class="dropdown-item-ref" active-class="active">
                <img :src="child.icon" alt="Icon" class="Icon"/>
                <span v-if="isOpen" class="text-child-ref">{{ child.label }}</span>
              </router-link>
            </li>
          </ul>
        </template>
        <template v-else>
          <!-- Menu biasa -->
          <router-link
            :to="item.to"
            class="menu-item"
          >
            <img :src="item.icon" alt="Icon" class="Icon"/>
            <span v-if="isOpen" class="font-sidebar">{{ item.label }}</span>
          </router-link>
        </template>
      </template>
    </div>
  </template>

  <style scoped>
  .nama-profile{
    text-align: center;
    /* padding-bottom: 5px;
    padding-top: 5px; */
    color: white;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    padding: 8px 12px;
    transition: all 0.3s ease;
  }


  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .Icon {
    width: 30px;
    height: 30px;
    border-radius: 20%;
    object-fit: cover;
  }

  .Icon-Keluar {
    width: 25px;
    height: 25px;
    object-fit: cover;
    margin-right: 5px;
  }

  .sidebar-logo-large {
    width: 65px;
    height: 65px;
    transition: all 0.3s ease;
  }

  .sidebar-logo {
    width: 32px;
    height: 32px;
    display: block;
    margin: 0 auto;
    transition: all 0.3s ease;
  }


  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: none;
    color: #202020;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-family: 'Poppins';
    font-weight: 500;
  }

  .dropdown-item-ref {
    display: flex;
    align-items: center;
    /* gap: 0.75rem; */
    width: 100%;
    padding: 0.5rem;
    padding-left: 8px;
    border: none;
    background: none;
    color: #202020;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-family: 'Poppins';
    font-weight: 500;
  }

  .dropdown-item:hover {
    background-color: #3694c3;
  }

  .dropdown-item-ref:hover {
    background-color: #c0c0c0;
  }

  .dropdown-icon {
    font-size: 24px;
    min-width: 20px;
  }

  .dropdown-text {
    font-family: 'Poppins';
    font-weight: 500;
  }

  /* Responsive untuk sidebar collapsed */
  .sidebar.collapsed .profile-dropdown {
    position: absolute;
    left: 100%;
    top: 0;
    width: 150px;
    margin-top: 0;
    margin-left: 0.5rem;
    z-index: 1000;
  }

  .sidebar.collapsed .dropdown-text {
    display: block;
  }

  .sidebar.collapsed .text-child-ref {
    display: none;
  }

  .profile{
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #C3EAC5;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .gambar-profile{
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 100%;
    margin-top: 0.5rem;
    border: 3px solid #468db0;
    transition: all 0.3s ease;
  }

  .sidebar.collapsed .profile .gambar-profile {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    transition: all 0.3s ease;
    margin-top: 0;
    margin-bottom: 1rem;
    margin-top: 1rem;
    border: none;
  }

  .sidebar.collapsed .nama-profile {
    display: none;
  }

  .sidebar {
    position: fixed;
    top: 60;
    left: 0;
    height: 100vh;
    background: #f0f0f0;
    color: rgb(50, 50, 50);
    width: 16rem;
    transition: all 0.3s ease;
    font-size: 13px;
    /* overflow: hidden; */
    overflow-y: auto; /* Scrollable if content overflows */
    overflow-x: hidden;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    display: flex;
    flex-direction: column;
    /* gap: 5px; */
    box-shadow: 0 4px 8px rgba(180, 180, 180, 0.5);
    z-index: 100;
  }

  .sidebar.collapsed {
    width: 50px;
  }

  .logo.collapsed {
    padding: 30px 10px;
  }

  /* Tambahan untuk bungkus logo */
  .logo-wrapper {
    width: 100%;
    background-color: #5A9272;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo {
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30px 30px 30px 10px;
    width: 100%;
    box-sizing: border-box;
    color: rgb(50, 50, 50);
    transition: all 0.3s ease;
  }

  .logo-text {
    display: inline-block;
    color: white;
    text-align: left;
    margin-left: 0;
    margin-top: 10px;
    font-size: 20px;
    font-weight: bolder;
    line-height: 1.2;
  }

  .tombol-toggle {
    background: none;
    background-color: #5A9272;
    color: rgb(50, 50, 50);
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 18px;
    transition: all 0.3s ease;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 10px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 8px;
    padding-top: 10px;
    padding-bottom: 10px;
    text-decoration: none;
    color: rgb(50, 50, 50);
    transition: all 0.3s ease;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    border-bottom: 0.7px solid #cacaca;
  }

  .menu-item:hover {
    background: #cecece;
  }

  /* Dropdown referensi */
  .dropdown-list{
    list-style: none;
    margin: 0px;
    padding: 0px;
  }
  .dropdown-list-child {
    background-color: #dddddd;
  }
  .text-child-ref {
    color: rgb(50, 50, 50);
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 0.7rem;
  }
  .tombol-toggle:hover {
    background: #3b8eb8;
  }

  .icon {
    font-size: 25px;
    transition: all 0.3s ease;
  }

  .sidebar.collapsed .menu-item {
    border-bottom: none;
  }

  .font-sidebar {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .label {
    white-space: nowrap;
  }
  </style>