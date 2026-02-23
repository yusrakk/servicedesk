import { ref, onBeforeUnmount, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
// import LogoServiceDesk from "../../../../public/LogoServiceDesk.svg";
import moduleName from "../../public/LogoServiceDesk.svg";
import IconProfile from "../../public/profileicon.svg";
import IconKeluar from "../../public/iconkeluar.svg";
import IconBeranda from "../../public/iconberanda.svg";
import IconPermintaanBaru from "../../public/iconpermintaanbaru.svg";
import IconPermintaanDiproses from "../../public/iconpermintaandiproses.svg";
import IconHasilPemenuhanBASLA from "../../public/iconpemenuhanbasla.svg";
import IconRiwayat from "../../public/iconriwayat.svg";
import IconDaftarPelayanan from "../../public/icondaftarpelayanan.svg";
import IconReferensi from "../../public/iconreferensi.svg";
import IconLembagaOrganisasi from "../../public/iconlembagaorganisasi.svg";
import IconJabatan from "../../public/iconjabatan.svg";
import IconStatus from "../../public/iconstatus.svg";
import IconUrgensi from "../../public/iconurgensi.svg";
import IconPersetujuanPelayanan from "../../public/iconpersetujuanpelayanan.svg";
import IconDisposisiPelayanan from "../../public/icondisposisipelayanan.svg";
import IconHasilPengerjaan from "../../public/iconhasilpengerjaan.svg";
import IconKepuasanUserKeseluruhan from "../../public/iconlaporankepuasanuserkeseluruhan.svg";
import IconKepuasanUserBulanIni from "../../public/iconlaporankepuasanuserbulan.svg";
import IconJenisPelayanan from "../../public/iconjenispelayanan.svg";
import IconSubJenisPelayanan from "../../public/iconsubjenispelayanan.svg";

export const MENU_BY_ROLE = {
  1: [
    // User
    { icon: IconBeranda, label: "Beranda", to: "/beranda" },
    {
      icon: IconPermintaanBaru,
      label: "Permintaan Layanan",
      to: "/permintaanDiproses",
    },
  ],
  2: [
    { icon: IconBeranda, label: "Beranda", to: "/Beranda-Pengelola" },
    { icon: IconPermintaanBaru, label: "Permintaan Layanan", to: "/pelayanan" },
  ],
  3: [
    { icon: IconBeranda, label: "Beranda", to: "/berandaUnit" },
    {
      icon: IconPersetujuanPelayanan,
      label: "Permintaan Layanan",
      to: "/approval",
    },
  ],
  4: [
    { icon: IconBeranda, label: "Beranda", to: "/berandaTeknis" },
    {
      icon: IconPermintaanBaru,
      label: "Permintaan Layanan",
      to: "/permintaanTeknis",
    },
  ],
  5: [
    { icon: IconBeranda, label: "Beranda", to: "/berandaKD" },
    {
      icon: IconKepuasanUserKeseluruhan,
      label: "Laporan dan Hasil Kepuasan Pengguna Keseluruhan",
      to: "/KepuasanUserKeseluruhan",
    },
    {
      icon: IconKepuasanUserBulanIni,
      label: "Laporan dan Hasil Kepuasan Pengguna Bulan ini",
      to: "/KepuasanUserBulanIni",
    },
  ],
  6: [
    { icon: IconBeranda, label: "Beranda", to: "/Beranda-Pengelola" },

    // Permintaan Layanan
    {
      icon: IconDaftarPelayanan,
      label: "Permintaan Layanan",
      to: "/pelayanan",
    },

    // Pengguna
    { icon: IconProfile, label: "Pengguna", to: "/pengguna" },

    // Referensi (Dropdown)
    {
      icon: IconReferensi,
      label: "Referensi",
      children: [
        { icon: IconLembagaOrganisasi, label: "Lembaga", to: "/lembaga" },
        { icon: IconJabatan, label: "Jabatan", to: "/referensi/jabatan" },
        { icon: IconStatus, label: "Status", to: "/referensi/status" },
        {
          icon: IconJenisPelayanan,
          label: "Jenis Pelayanan",
          to: "/referensi/jenis-pelayanan",
        },
        { icon: IconUrgensi, label: "Urgensi", to: "/referensi/urgensi" },
        {
          icon: IconSubJenisPelayanan,
          label: "Sub Jenis Pelayanan",
          to: "/referensi/sub-jenis-pelayanan",
        },
      ],
    },
  ],
};

export const ROLE_NAMES = {
  1: "User",
  2: "Pengelola",
  3: "Unit Pelaksana",
  4: "Pelaksana Teknis",
  5: "Kepala Dinas",
  6: "Superadmin",
};
