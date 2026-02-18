<script setup>
  import {ref, onMounted, onBeforeMount, computed} from 'vue'
  import axios from 'axios';
  import { Bar, Pie } from 'vue-chartjs';
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

//Ceritanya Backend
const labelPermintaanBerdasarkanPengelolaTeknis = ref([]);
const dataPermintaanBerdasarkanPengelolaTeknis = ref([]);

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token');
    const response = await axios.get('/api/TknsPelayananChart', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
    const data = response.data;
    labelPermintaanBerdasarkanPengelolaTeknis.value = data.map(item => item.Nama);
    dataPermintaanBerdasarkanPengelolaTeknis.value = data.map(item => item.total);
  } catch (error) {
  }
});

//data fixed jadi cmn ada di FrontEnd
const warnaChart = ['#4264C2', '#CA4D2D', '#F3A33C', '#449533', '#CC557D', '#A83A2D', '#9845A1', '#51AC9A', '#ABAB3B', '#6137C7', '#601861']

// data dummy Bar
const permintaanBerdasarkanPengelolaTeknisData = computed(() => ({
  labels: labelPermintaanBerdasarkanPengelolaTeknis.value,
  datasets: [
    {
      label: 'Jumlah Permintaan',
      data: dataPermintaanBerdasarkanPengelolaTeknis.value,
      backgroundColor: warnaChart
    }
  ]
}));
//bar
const configpermintaanBerdasarkanPengelolaTeknis = {
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
      text: "Permintaan Berdasarkan Pengelola Teknis",
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
  <Bar :data="permintaanBerdasarkanPengelolaTeknisData" :options="configpermintaanBerdasarkanPengelolaTeknis" />
</template>