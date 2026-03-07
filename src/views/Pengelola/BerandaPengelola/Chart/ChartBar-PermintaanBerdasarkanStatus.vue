<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import axios from 'axios'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const labels = ref([])
const data   = ref([])

onBeforeMount(async () => {
  try {
    const token = localStorage.getItem('Token')
    const res = await axios.get('/api/stsPelayananChart', {
      headers: { Authorization: 'Bearer ' + token }
    })
    labels.value = res.data.map(i => i.status)
    data.value   = res.data.map(i => i.total)
  } catch (e) {
    // Fallback jika API gagal
    labels.value = ['Baru', 'Disetujui', 'Ditolak', 'Proses', 'Selesai', 'Tutup']
    data.value   = [0, 0, 0, 0, 0, 0]
  }
})

// Warna semantik per status — konsisten dengan badge di tabel
const warnaStatus = {
  'Baru':      '#2563eb',
  'Disetujui': '#2eb86a',
  'Ditolak':   '#dc2626',
  'Proses':    '#d97706',
  'Selesai':   '#16a34a',
  'Tutup':     '#6b7280',
}
const defaultColors = [
  '#2563eb', '#2eb86a', '#dc2626', '#d97706', '#16a34a', '#6b7280'
]

const warnaChart = computed(() =>
  labels.value.map((l, i) => warnaStatus[l] ?? defaultColors[i % defaultColors.length])
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Jumlah Permintaan',
    data: data.value,
    backgroundColor: warnaChart.value,
    borderRadius: 7,
    borderSkipped: false,
    barThickness: 36,
  }]
}))

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  layout: { padding: { top: 10 } },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#5a7566',
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
      },
      border: { color: 'rgba(168,200,180,.2)' }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(168,200,180,.15)' },
      ticks: {
        color: '#5a7566',
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        stepSize: 1,
      },
      border: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Permintaan Berdasarkan Status',
      color: '#0d1a12',
      font: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: '700' },
      padding: { bottom: 14 }
    },
    tooltip: {
      backgroundColor: '#1a3a2a',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,.8)',
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: ctx => ` ${ctx.parsed.y} permintaan`
      }
    }
  }
}
</script>

<template>
  <div class="chart-wrap">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap{width:100%;height:100%;}
</style>