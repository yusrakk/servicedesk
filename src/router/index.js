import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

//===============USER===============
import profileSaya from "../views/profile/profileSaya.vue";
import editProfile from "../views/profile/editProfile.vue";
import Login from "../views/loginPage.vue";
import LacakTiket from "../views/Lacak/LacakTiket.vue";
import beranda from "../views/User/Beranda/beranda.vue";
// Permintaan baru
import permintaanBaru from "../views/User/pengajuanPermintaan/pengajuanPermintaan.vue";
import HalamanFormulirTiketBaru from "../views/User/pengajuanPermintaan/halaman-formulir-tiket-baru.vue";
// Permintaan Diproses
import permintaanDiproses from "../views/User/permintaanDiproses/permintaanDiproses.vue";
import detailPermintaan from "../views/User/permintaanDiproses/detailPermintaan.vue";
// Hasil Pemenuhan BASLA
import HasilPemenuhanBASLA from "../views/User/HasilPemenuhan/hasilPemenuhanBASLA.vue";
import detailPermintaanHasil from "../views/User/HasilPemenuhan/detailPermintaanHasil.vue";
// Riwayat
import riwayat from "../views/User/Riwayat/riwayat.vue";
import detailPermintaanRiwayat from "../views/User/Riwayat/detailPermintaanRiwayat.vue";

//===============PENGELOLA===============
import berandaPengelola from "../views/Pengelola/BerandaPengelola/berandaPengelola.vue";
import pelayanan from "../views/Pengelola/Pelayanan/Pelayanan.vue";
import detailPelayanan from "../views/Pengelola/Pelayanan/detailPelayanan.vue";
import PenggunaPengelola from "../views/Pengelola/Pengguna/PenggunaPengelola.vue";
import TambahPengguna from "../views/Pengelola/Pengguna/TambahPengguna.vue";
import UbahPengguna from "../views/Pengelola/Pengguna/UbahPengguna.vue";
import lihatPengguna from "../views/Pengelola/Pengguna/LihatPengguna.vue";
import lembagaOrganisasi from "../views/Pengelola/LembagaOrganisasi/Organisasi.vue";
import tambahOrganisasi from "../views/Pengelola/LembagaOrganisasi/TambahOrganisasi.vue";
import ubahOrganisasi from "../views/Pengelola/LembagaOrganisasi/EditOrganisasi.vue";
import referensiJabatan from "../views/Pengelola/Referensi/RefJabatan/jabatan.vue";
import TambahJabatan from "../views/Pengelola/Referensi/RefJabatan/TambahJabatan.vue";
import UbahJabatan from "../views/Pengelola/Referensi/RefJabatan/EditJabatan.vue";
import referensiStatus from "../views/Pengelola/Referensi/RefStatus/Status.vue";
import UbahStatus from "../views/Pengelola/Referensi/RefStatus/EditStatus.vue";
import referensiPelayanan from "../views/Pengelola/Referensi/RefPelayanan/JenisPelayanan.vue";
import TambahPelayanan from "../views/Pengelola/Referensi/RefPelayanan/TambahJenisPelayanan.vue";
import UbahPelayanan from "../views/Pengelola/Referensi/RefPelayanan/EditJenisPelayanan.vue";
import referensiSubJenisPelayanan from "../views/Pengelola/Referensi/RefSubJenisPelayanan/SubJenisPelayanan.vue";
import TambahSubJenisPelayanan from "../views/Pengelola/Referensi/RefSubJenisPelayanan/TambahSubJenisPelayanan.vue";
import UbahSubJenisPelayanan from "../views/Pengelola/Referensi/RefSubJenisPelayanan/EditSubJenisPelayanan.vue";
import referensiUrgensi from "../views/Pengelola/Referensi/RefUrgensi/Urgensi.vue";
import TambahUrgensi from "../views/Pengelola/Referensi/RefUrgensi/TambahUrgensi.vue";
import UbahUrgensi from "../views/Pengelola/Referensi/RefUrgensi/EditUrgensi.vue";
import permintaanBaruPengelola from "../views/Pengelola/PermintaanBaruPengelola/PermintaanBaruPengelola.vue";
import formulirTiketBaruPengelola from "../views/Pengelola/PermintaanBaruPengelola/FormulirTiketBaruPengelola.vue";

//===============UNIT PELAKSANA===============
import berandaUnit from "../views/UnitPelaksana/Beranda/BerandaUnit.vue";
import approval from "../views/UnitPelaksana/ApprovalPermintaan/ApprovalUnit.vue";
import detailPelayananPelaksana from "../views/UnitPelaksana/ApprovalPermintaan/detailPelayananPelaksana.vue";
import disposisi from "../views/UnitPelaksana/DisposisiPermintaan/DisposisiUnit.vue";
import detailPelayananDisposisi from "../views/UnitPelaksana/DisposisiPermintaan/detailPelayananDisposisi.vue";

//===============PELAKSANA TEKNIS===============
import berandaTeknis from "../views/PelaksanaTeknis/BerandaTeknis/BerandaTeknis.vue";
import disposisiTeknis from "../views/PelaksanaTeknis/DisposisiTeknis/disposisiTeknis.vue";
import detailPelayananDisposisiTeknis from "../views/PelaksanaTeknis/DisposisiTeknis/detailPelayananDisposisiTeknis.vue";
import permintaanTeknis from "../views/PelaksanaTeknis/PermintaanTeknis/permintaanTeknis.vue";
import detailPermintaanTeknis from "../views/PelaksanaTeknis/PermintaanTeknis/detailPermintaanTeknis.vue";
import hasilPengerjaan from "../views/PelaksanaTeknis/HasilPengerjaan/hasilPengerjaan.vue";
import detailPelayananHasilPengerjaan from "../views/PelaksanaTeknis/HasilPengerjaan/detailPelayananHasilPengerjaan.vue";

//===============KEPALA DINAS===============
import berandaKD from "../views/KepalaDinas/BerandaKD/BerandaKD.vue";
import KepuasanUserKeseluruhan from "../views/KepalaDinas/KepuasanUser/Keseluruhan/KepuasanUserKeseluruhanKD.vue";
import KepuasanUserBulanIni from "../views/KepalaDinas/KepuasanUser/BulanIni/KepuasanUserBulanKD.vue";
import DetailKepuasanUserKeseluruhan from "../views/KepalaDinas/KepuasanUser/Keseluruhan/detailKepuasanKeseluruhanKD.vue";
import DetailKepuasanUserBulanIni from "../views/KepalaDinas/KepuasanUser/BulanIni/detailKepuasanBulanKD.vue";

//===============MISC===============
import Helpdesk from "../views/HelpdeskPage.vue";
import menuAkun from "../views/Pengelola/Akun/menuAkun.vue";
import WelcomePage from "../views/public/WelcomePage.vue";

// ── Helper: redirect berdasarkan role ──────────────────────────────────────
function redirectByRole(role) {
  if (role === 1) return "/beranda";
  if (role === 2) return "/beranda-Pengelola";
  if (role === 3) return "/berandaUnit";
  if (role === 4) return "/berandaTeknis";
  if (role === 5) return "/berandaKD";
  if (role === 6) return "/beranda-Pengelola";
  return "/beranda";
}

// ── Routes ─────────────────────────────────────────────────────────────────
const routes = [
  // ── Public (root → welcome) ──
  { path: "/", redirect: "/welcome" },

  {
    path: "/welcome",
    name: "Welcome",
    component: WelcomePage,
    meta: { guestOnly: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: "/lacak",
    name: "LacakTiket",
    component: LacakTiket,
  },
  {
    path: "/helpdesk",
    name: "HelpDesk",
    component: Helpdesk,
  },

  // ── Akun (Pengelola) ──
  {
    path: "/akun",
    name: "akun",
    component: menuAkun,
    meta: { allowedRoles: [2] },
  },

  // ── Profile ──
  {
    path: "/profileSaya",
    name: "ProfileSaya",
    component: profileSaya,
    meta: { allowedRoles: [1, 2, 3, 4, 5, 6] },
  },
  {
    path: "/editProfile",
    name: "EditProfile",
    component: editProfile,
    meta: { allowedRoles: [1, 2, 3, 4, 5, 6] },
  },

  //===============USER===============
  {
    path: "/beranda",
    name: "Beranda",
    component: beranda,
    meta: { allowedRoles: [1, 6] },
  },
  {
    path: "/permintaanBaru",
    name: "PermintaanBaru",
    component: permintaanBaru,
    meta: { allowedRoles: [1, 2, 6] },
  },
  {
    path: "/FormulirTiket",
    name: "FormulirTiketBaru",
    component: HalamanFormulirTiketBaru,
    meta: { allowedRoles: [1, 2, 6] },
  },
  {
    path: "/permintaanDiproses",
    name: "PermintaanDiproses",
    component: permintaanDiproses,
    meta: { allowedRoles: [1, 6] },
  },
  {
    path: "/detailPermintaan",
    name: "DetailPermintaan",
    component: detailPermintaan,
    meta: { allowedRoles: [1, 6] },
  },
  {
    path: "/hasilPemenuhanBASLA",
    name: "hasilPemenuhanBASLA",
    component: HasilPemenuhanBASLA,
    meta: { allowedRoles: [1, 6], keepAlive: true },
  },
  {
    path: "/detailPermintaanHasil",
    name: "DetailPermintaanHasil",
    component: detailPermintaanHasil,
    meta: { allowedRoles: [1, 6] },
  },
  {
    path: "/riwayat",
    name: "Riwayat",
    component: riwayat,
    meta: { allowedRoles: [1, 3, 4, 6] },
  },
  {
    path: "/detailPermintaanRiwayat",
    name: "DetailPermintaanRiwayat",
    component: detailPermintaanRiwayat,
    meta: { allowedRoles: [1, 3, 4, 6] },
  },

  //===============PENGELOLA===============
  {
    path: "/Beranda-Pengelola",
    name: "Beranda-Pengelola",
    component: berandaPengelola,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/pelayanan",
    name: "pelayanan",
    component: pelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/DetailPelayanan",
    name: "Detail-Pelayanan",
    component: detailPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/pengguna",
    name: "penggunaPengelola",
    component: PenggunaPengelola,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahPengguna",
    name: "TambahPengguna",
    component: TambahPengguna,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahPengguna",
    name: "UbahPengguna",
    component: UbahPengguna,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/lihatPengguna",
    name: "lihatPengguna",
    component: lihatPengguna,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/lembaga",
    name: "lembaga/Organisasi",
    component: lembagaOrganisasi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahLembaga",
    name: "TambahLembaga",
    component: tambahOrganisasi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahLembaga",
    name: "UbahLembaga",
    component: ubahOrganisasi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/referensi/jabatan",
    name: "referensiJabatan",
    component: referensiJabatan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahJabatan",
    name: "TambahJabatan",
    component: TambahJabatan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahJabatan",
    name: "UbahJabatan",
    component: UbahJabatan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/referensi/jenis-pelayanan",
    name: "referensiPelayanan",
    component: referensiPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahPelayanan",
    name: "TambahPelayanan",
    component: TambahPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahPelayanan",
    name: "UbahPelayanan",
    component: UbahPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/referensi/status",
    name: "referensiStatus",
    component: referensiStatus,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahStatus",
    name: "UbahStatus",
    component: UbahStatus,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/referensi/sub-jenis-pelayanan",
    name: "referensiSubJenisPelayanan",
    component: referensiSubJenisPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahSubJenisPelayanan",
    name: "TambahSubJenisPelayanan",
    component: TambahSubJenisPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahSubJenisPelayanan",
    name: "UbahSubJenisPelayanan",
    component: UbahSubJenisPelayanan,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/referensi/urgensi",
    name: "referensiUrgensi",
    component: referensiUrgensi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/tambahUrgensi",
    name: "TambahUrgensi",
    component: TambahUrgensi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/ubahUrgensi",
    name: "UbahUrgensi",
    component: UbahUrgensi,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/permintaanBaruPengelola",
    name: "PermintaanBaruPengelola",
    component: permintaanBaruPengelola,
    meta: { allowedRoles: [2, 6] },
  },
  {
    path: "/formulirTiketBaruPengelola",
    name: "FormulirTiketBaruPengelola",
    component: formulirTiketBaruPengelola,
    meta: { allowedRoles: [2, 6] },
  },

  //===============UNIT PELAKSANA===============
  {
    path: "/berandaUnit",
    name: "BerandaUnit",
    component: berandaUnit,
    meta: { allowedRoles: [3, 6] },
  },
  {
    path: "/approval",
    name: "Approval",
    component: approval,
    meta: { allowedRoles: [3, 6] },
  },
  {
    path: "/disposisi",
    name: "Disposisi",
    component: disposisi,
    meta: { allowedRoles: [3, 6] },
  },
  {
    path: "/detailPelayananPelaksana",
    name: "DetailPelayananPelaksana",
    component: detailPelayananPelaksana,
    meta: { allowedRoles: [3, 6] },
  },
  {
    path: "/detailPelayananDisposisi",
    name: "DetailPelayananDisposisi",
    component: detailPelayananDisposisi,
    meta: { allowedRoles: [3, 6] },
  },

  //===============PELAKSANA TEKNIS===============
  {
    path: "/berandaTeknis",
    name: "Beranda Teknis",
    component: berandaTeknis,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/disposisiTeknis",
    name: "DisposisiTeknis",
    component: disposisiTeknis,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/detailDisposisiTeknis",
    name: "DetailDisposisiTeknis",
    component: detailPelayananDisposisiTeknis,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/permintaanTeknis",
    name: "PermintaanTeknis",
    component: permintaanTeknis,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/detailPermintaanTeknis",
    name: "DetailPermintaanTeknis",
    component: detailPermintaanTeknis,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/hasilPengerjaan",
    name: "HasilPengerjaan",
    component: hasilPengerjaan,
    meta: { allowedRoles: [4, 6] },
  },
  {
    path: "/detailPelayananHasilPengerjaan",
    name: "DetailHasilPengerjaan",
    component: detailPelayananHasilPengerjaan,
    meta: { allowedRoles: [4, 6] },
  },

  //===============KEPALA DINAS===============
  {
    path: "/berandaKD",
    name: "BerandaKepalaDinas",
    component: berandaKD,
    meta: { allowedRoles: [5, 6] },
  },
  {
    path: "/KepuasanUserKeseluruhan",
    name: "KepuasanUserKeseluruhan",
    component: KepuasanUserKeseluruhan,
    meta: { allowedRoles: [5, 6] },
  },
  {
    path: "/detailKepuasanUserKeseluruhan",
    name: "DetailKepuasanUserKeseluruhan",
    component: DetailKepuasanUserKeseluruhan,
    meta: { allowedRoles: [5, 6] },
  },
  {
    path: "/KepuasanUserBulanIni",
    name: "KepuasanUserBulanIni",
    component: KepuasanUserBulanIni,
    meta: { allowedRoles: [5, 6] },
  },
  {
    path: "/detailKepuasanUserBulanIni",
    name: "DetailKepuasanUserBulanIni",
    component: DetailKepuasanUserBulanIni,
    meta: { allowedRoles: [5, 6] },
  },
];

// ── Router instance ─────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// ── Navigation Guard ────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("Token");
  const role  = parseInt(localStorage.getItem("id_role"));

  // 1. Halaman guestOnly (welcome & login): kalau sudah login → redirect ke dashboard
  if (to.meta.guestOnly && token) {
    return next(redirectByRole(role));
  }

  // 2. Halaman publik tanpa role restriction → langsung lanjut
  if (!to.meta.allowedRoles) return next();

  // 3. Halaman protected: belum login → ke login
  if (!token) {
    localStorage.clear();
    return next({ name: "Login" });
  }

  // 4. Verifikasi token & cek role ke API
  try {
    const response = await axios.get("/api/user/profile", {
      headers: { Authorization: "Bearer " + token },
    });
    const userRole = response.data.ID_Role;

    if (!to.meta.allowedRoles.includes(userRole)) {
      localStorage.clear();
      return next({ name: "Login" });
    }

    return next();
  } catch (error) {
    localStorage.clear();
    return next({ name: "Login" });
  }
});

export default router;