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
    const res = await axios.get('/api/ratePelayananChart', {
      headers: { Authorization: 'Bearer ' + token }
    })
    labels.value = res.data.map(i => i.Rating)
    data.value   = res.data.map(i => i.total)
  } catch (e) {
    console.error('Gagal memuat data:', e)
  }
})

// Rating colors: 0=abu, 1=merah, 2=oranye, 3=kuning, 4=hijau muda, 5=hijau
const warnaChart = ['#d1d5db', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#2eb86a']

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Jumlah Penilaian',
    data: data.value,
    backgroundColor: warnaChart,
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
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
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
      text: 'Penilaian Service Desk',
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
        label: ctx => ` ${ctx.parsed.y} penilaian`
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