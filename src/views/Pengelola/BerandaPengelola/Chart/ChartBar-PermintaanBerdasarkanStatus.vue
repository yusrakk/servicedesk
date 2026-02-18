<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js'

// Registrasi komponen Chart.js
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement)

// API
const labelPermintaanBerdasarkanStatus = ref([]);
const dataPermintaanBerdasarkanStatus = ref([]);

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token');
    const response = await axios.get('/api/stsPelayananChart', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
    const data = response.data;
    labelPermintaanBerdasarkanStatus.value = data.map(item => item.status);
    dataPermintaanBerdasarkanStatus.value = data.map(item => item.total);
  } catch (error) {
    labelPermintaanBerdasarkanStatus.value = ['Baru', 'Disetujui', 'Ditolak', 'Proses', 'Selesai', 'Tutup'];
    dataPermintaanBerdasarkanStatus.value = [0, 0, 0, 0, 0, 0];
  }
});

// data fixed jadi cmn ada di FrontEnd
const warnaChart = ['#4264C2', '#F3D13C', '#E74C3C', '#F39C12', '#27AE60', '#8E44AD'];


// data dummy Bar (computed agar reactive)
const permintaanBerdasarkanStatusData = computed(() => ({
  labels: labelPermintaanBerdasarkanStatus.value,
  datasets: [
    {
      label: 'Jumlah Permintaan',
      data: dataPermintaanBerdasarkanStatus.value,
      backgroundColor: warnaChart
    }
  ]
}))

// bar
const configpermintaanBerdasarkanStatus = {
  maintainAspectRatio: false,
  responsive: true,
  layout: {
    padding: {
      top: 15  // Ganti sesuai kebutuhan, misalnya 0 atau 5
    }
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Permintaan Berdasarkan Status",
      color: '#000000',
      font: {
        size: 16,
        weight: 'bold'
      }
    }
  }
}

</script>

<template>
  <Bar :data="permintaanBerdasarkanStatusData" :options="configpermintaanBerdasarkanStatus" />
</template>