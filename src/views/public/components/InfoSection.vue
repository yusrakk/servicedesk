<template>
  <section class="info-section">
    <div class="container">
      <div class="info-section__header">
        <span class="section-label">Statistik Layanan</span>
        <h2 class="section-heading">Kinerja yang<br>bisa diukur</h2>
      </div>

      <div class="stats-grid">
        <StatCard
          v-for="(stat, i) in stats"
          :key="stat.id"
          :value="stat.value"
          :label="stat.label"
          :trend="stat.trend"
          class="animate-fade-up"
          :style="{ animationDelay: `${i * 120}ms` }"
        >
          <template #icon>
            <component :is="stat.icon" />
          </template>
        </StatCard>
      </div>
    </div>
  </section>
</template>

<script setup>
import { h } from 'vue'
import StatCard from './StatCard.vue'

const IconTicket = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('rect', { x: '2', y: '4', width: '18', height: '14', rx: '2', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M2 9h18', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M6 15h3M6 12h3', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])
const IconClock = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('circle', { cx: '11', cy: '11', r: '9', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M11 6v5l3.5 3.5', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])
const IconStar = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M11 2l2.7 5.5L20 8.5l-4.5 4.4 1.1 6.1-5.6-3-5.6 3 1.1-6.1L2 8.5l6.3-.9L11 2z', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])

const stats = [
  {
    id: 'tickets',
    value: '1234',
    label: 'Total Tiket Ditangani',
    trend: '+12% bulan ini',
    icon: IconTicket,
  },
  {
    id: 'response',
    value: '2.5 jam',
    label: 'Waktu Respons Rata-rata',
    trend: 'Lebih cepat 18%',
    icon: IconClock,
  },
  {
    id: 'satisfaction',
    value: '98%',
    label: 'Tingkat Kepuasan Pengguna',
    trend: 'Target 95% tercapai',
    icon: IconStar,
  },
]
</script>

<style scoped>
.info-section {
  padding: var(--space-24) 0;
  background: linear-gradient(180deg, #ffffff 0%, #f5fbf7 100%);
  border-top: 1px solid rgba(46,184,106,0.12);
  border-bottom: 1px solid rgba(46,184,106,0.12);
  position: relative;
  overflow: hidden;
}
.info-section::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(46,184,106,0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.info-section__header {
  text-align: center;
  max-width: 420px;
  margin: 0 auto var(--space-16);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
}

@media (max-width: 768px) {
  .info-section { padding: var(--space-16) 0; }
  .info-section__header { margin-bottom: var(--space-10); }
  .stats-grid { max-width: 100%; }
  .stat-card { padding: var(--space-5); }
}

@media (max-width: 480px) {
  .info-section { padding: var(--space-12) 0; }
  .stat-card__value { font-size: var(--text-2xl); }
}
</style>