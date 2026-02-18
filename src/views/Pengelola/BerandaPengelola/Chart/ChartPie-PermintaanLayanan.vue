<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import axios from 'axios'
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
const labelPermintaanDiproses = ref([])
const dataPermintaanDiproses = ref([])
const isLoading = ref(true)

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const response = await axios.get('/api/jnsPelayananChart', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const data = response.data
    labelPermintaanDiproses.value = data.map(item => item.Jenis_Pelayanan)
    dataPermintaanDiproses.value = data.map(item => item.total)
  } catch (error) {
    console.error("Gagal memuat data:", error)
  } finally {
    isLoading.value = false
  }
})

// Colors
const warnaChart = ['#4264C2', '#CA4D2D', '#F3A33C', '#449533', '#CC557D', '#A83A2D', '#9845A1', '#51AC9A', '#ABAB3B', '#6137C7', '#601861']

// Computed chart data
const PermintaanLayananData = computed(() => ({
  labels: labelPermintaanLayanan.value,
  datasets: [
    {
      label: 'Presentase Layanan',
      data: dataPermintaanLayanan.value,
      backgroundColor: warnaChart
    }
  ]
}))

// Chart options with tooltip in percentage
const configPermintaanLayanan = {
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
      text: 'Persentase Permintaan Pelayanan',
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
  <div v-else-if="dataPermintaanLayanan.length > 0">
    <Pie :data="PermintaanLayananData" :options="configPermintaanLayanan" />
  </div>
  <!-- Tidak ada data -->
  <div v-else class="no-data">
    <p>Tidak ada data ditampilkan untuk Permintaan Layanan</p>
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
.no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #ff0000; /* Changed to red for better visibility */
  padding: 20px;
}
</style>
