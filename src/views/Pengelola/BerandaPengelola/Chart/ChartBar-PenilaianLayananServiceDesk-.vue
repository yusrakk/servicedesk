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
const labelPenilaianLayananServiceDesk = ref([]);
const dataPenilaianLayananServiceDesk = ref([]);

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token');
    const response = await axios.get('/api/ratePelayananChart', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
    const data = response.data;
    labelPenilaianLayananServiceDesk.value = data.map(item => item.Rating);
    dataPenilaianLayananServiceDesk.value = data.map(item => item.total);
  } catch (error) {
  }
});
//data fixed jadi cmn ada di FrontEnd
const warnaChart = ['#999999', '#D7263D', '#F46036', '#F3A33C', '#A3C84A', '#449533'];


// data dummy Bar
const penilaianLayananServiceDeskData = computed(() => ({
  labels: labelPenilaianLayananServiceDesk.value,
  datasets: [
    {
      label: 'Jumlah Penilaian',
      data: dataPenilaianLayananServiceDesk.value,
      backgroundColor: warnaChart
    }
  ]
}));
//bar
const configPenilaianLayananServiceDesk = {
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
      text: "Penilaian Service Desk",
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
  <Bar :data="penilaianLayananServiceDeskData" :options="configPenilaianLayananServiceDesk" />
</template>