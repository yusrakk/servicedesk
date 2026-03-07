<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axios from 'axios'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement)

const labels    = ref([])
const data      = ref([])
const isLoading = ref(true)

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/stsPelayananChartBulanIni', {
      headers: { Authorization: `Bearer ${token}` }
    })
    labels.value = res.data.map(i => i.status)
    data.value   = res.data.map(i => i.total)
  } catch (e) {
    console.error('Error fetching chart data:', e)
    labels.value = ['Baru', 'Disetujui', 'Ditolak', 'Proses', 'Selesai', 'Tutup']
    data.value   = [0, 0, 0, 0, 0, 0]
  } finally {
    isLoading.value = false
  }
})

// Warna semantik per status — sama dengan ChartBar-PermintaanBerdasarkanStatus
const warnaStatus = {
  'Baru':      '#2563eb',
  'Disetujui': '#2eb86a',
  'Ditolak':   '#dc2626',
  'Proses':    '#d97706',
  'Selesai':   '#16a34a',
  'Tutup':     '#6b7280',
}
const defaultColors = ['#2563eb', '#2eb86a', '#dc2626', '#d97706', '#16a34a', '#6b7280']

const warnaChart = computed(() =>
  labels.value.map((l, i) => warnaStatus[l] ?? defaultColors[i % defaultColors.length])
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Persentase Progress',
    data: data.value,
    backgroundColor: warnaChart.value,
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
      text: 'Persentase Progress Bulan Ini',
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
    <div v-else-if="data.length > 0" class="chart-inner">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="state-center">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.5"/><path d="M16 10v8M16 22h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p>Tidak ada data Progress Bulan Ini</p>
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