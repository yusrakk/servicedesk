<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import axios from 'axios'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement)

// FIX: variabel asli salah nama (labelPermintaanDiproses vs labelPermintaanLayanan)
const labelPermintaanLayanan = ref([])
const dataPermintaanLayanan  = ref([])
const isLoading = ref(true)

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/jnsPelayananChart', {
      headers: { Authorization: 'Bearer ' + token }
    })
    labelPermintaanLayanan.value = res.data.map(i => i.Jenis_Pelayanan)
    dataPermintaanLayanan.value  = res.data.map(i => i.total)
  } catch (e) {
    console.error('Gagal memuat data:', e)
  } finally {
    isLoading.value = false
  }
})

// Green design system palette
const warnaChart = [
  '#2eb86a', '#1a3a2a', '#0f5c38', '#4ade80', '#16a34a',
  '#5a7566', '#86efac', '#14532d', '#a3e635', '#84cc16', '#65a30d'
]

const chartData = computed(() => ({
  labels: labelPermintaanLayanan.value,
  datasets: [{
    label: 'Persentase Layanan',
    data: dataPermintaanLayanan.value,
    backgroundColor: warnaChart,
    borderColor: '#fff',
    borderWidth: 2,
    hoverOffset: 6,
  }]
}))

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  layout: { padding: { top: 10 } },
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        color: '#5a7566',
        padding: 14,
        usePointStyle: true,
        pointStyleWidth: 8,
      }
    },
    title: {
      display: true,
      text: 'Persentase Permintaan Pelayanan',
      color: '#0d1a12',
      font: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: '700' },
      padding: { bottom: 12 }
    },
    tooltip: {
      backgroundColor: '#1a3a2a',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,.8)',
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label(ctx) {
          const total = ctx.dataset.data.reduce((s, v) => s + v, 0)
          const pct   = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0
          return ` ${ctx.label}: ${pct}%`
        }
      }
    }
  }
}
</script>

<template>
  <div class="chart-wrap">
    <div v-if="isLoading" class="state-center">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>
    <div v-else-if="dataPermintaanLayanan.length > 0" class="chart-inner">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="state-center">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.5"/><path d="M16 10v8M16 22h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p>Tidak ada data Permintaan Layanan</p>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;}
.chart-inner{width:100%;height:100%;}
.state-center{display:flex;flex-direction:column;align-items:center;gap:.5rem;color:#b8ccc2;font-size:.8rem;padding:1rem;}
.spinner{width:22px;height:22px;border:2.5px solid #e8f4ee;border-top-color:#2eb86a;border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
</style>