<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axios from 'axios'
import { Pie } from 'vue-chartjs'
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

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement)

// Data for pie chart
const labelProgressBulanIni = ref([])
const dataProgressBulanIni = ref([])
const isLoading = ref(true)

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const response = await axios.get('/api/stsPelayananChartBulanIni', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = response.data
    labelProgressBulanIni.value = data.map(item => item.status)
    dataProgressBulanIni.value = data.map(item => item.total)
    // Check if there is valid data (non-empty and not all zeros)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    labelProgressBulanIni.value = ['Baru', 'Disetujui', 'Ditolak', 'Proses', 'Selesai', 'Tutup']
    dataProgressBulanIni.value = [0, 0, 0, 0, 0, 0]
  } finally {
    isLoading.value = false
  }
})

// Pie chart colors
const warnaChart = ['#4264C2', '#F3D13C', '#E74C3C', '#F39C12', '#27AE60', '#8E44AD']

// Computed chart data
const progressBulanIniData = computed(() => ({
  labels: labelProgressBulanIni.value,
  datasets: [
    {
      label: 'Presentase Progress',
      data: dataProgressBulanIni.value,
      backgroundColor: warnaChart
    }
  ]
}))

// Chart config with percentage tooltip
const configProgressBulanIni = {
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
      text: 'Persentase Progress Bulan Ini',
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
          const data = context.dataset.data
          const total = data.reduce((sum, val) => sum + val, 0)
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
  <div v-else-if="dataProgressBulanIni.length > 0">
    <Pie :data="progressBulanIniData" :options="configProgressBulanIni" />
  </div>
  <!-- Tidak ada data -->
  <div v-else class="no-data">
    <p>Tidak ada data ditampilkan untuk Progress Bulan ini</p>
  </div>
</div>
</template>

<style scoped>
.chart-container {
  width: 300px;
  margin: 0;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
} 

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #ff0000; /* Changed to red for better visibility */
  padding: 20px;
}
</style>