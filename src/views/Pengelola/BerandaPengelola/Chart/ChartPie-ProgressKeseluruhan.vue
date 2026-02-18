<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axios from 'axios'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement)

// API data placeholders
const labelProgressKeseluruhan = ref([])
const dataProgressKeseluruhan = ref([])
const isLoading = ref(true)

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const response = await axios.get('/api/stsPelayananChart', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const data = response.data
    labelProgressKeseluruhan.value = data.map(item => item.status)
    dataProgressKeseluruhan.value = data.map(item => item.total)
  } catch (error) {
    // fallback dummy
    labelProgressKeseluruhan.value = ['Baru', 'Disetujui', 'Ditolak', 'Proses', 'Selesai', 'Tutup']
    dataProgressKeseluruhan.value = [0, 0, 0, 0, 0, 0]
  } finally {
    isLoading.value = false
  }
})

// Pie colors
const warnaChart = ['#4264C2', '#F3D13C', '#E74C3C', '#F39C12', '#27AE60', '#8E44AD']

// Chart data
const progressKeseluruhanData = computed(() => ({
  labels: labelProgressKeseluruhan.value,
  datasets: [
    {
      label: "Persentase Progress",
      data: dataProgressKeseluruhan.value,
      backgroundColor: warnaChart
    }
  ]
}))

// Chart config with tooltip showing percentage
const configKeseluruhanData = {
  maintainAspectRatio: false,
  responsive: true,
  layout: {
    padding: {
      top: 15
    }
  },
  plugins: {
    legend: {
      position: 'right'
    },
    title: {
      display: true,
      text: "Persentase Progress Keseluruhan",
      color: '#000000',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const dataArr = context.chart.data.datasets[0].data
          const total = dataArr.reduce((sum, val) => sum + val, 0)
          const percentage = total ? ((value / total) * 100).toFixed(2) : 0
          return `${label}: ${percentage}%`
        }
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
  <!-- Loading -->
  <div v-if="isLoading">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
    </div>
  </div>
  <!-- Ada data -->
  <div v-else-if="dataProgressKeseluruhan.length > 0">
    <Pie :data="progressKeseluruhanData" :options="configKeseluruhanData" />
  </div>
  <!-- Tidak ada data -->
  <div v-else class="no-data">
    <p>Tidak ada data ditampilkan untuk Progress Keseluruhan</p>
  </div>
</div>
</template>

<style scoped>
.chart-container {
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #ff0000; /* Changed to red for better visibility */
  padding: 20px;
}
</style>
