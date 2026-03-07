<template>
  <section class="quick-actions">
    <div class="container">
      <div class="qa-header">
        <span class="section-label">Layanan Utama</span>
        <h2 class="section-heading">Apa yang bisa<br>kami bantu?</h2>
        <p class="qa-header__desc">
          Pilih jenis layanan yang Anda butuhkan untuk memulai.
        </p>
      </div>

      <div class="qa-grid">
        <a
          v-for="(action, i) in actions"
          :key="action.id"
          :href="action.href"
          class="qa-card animate-fade-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="qa-card__icon" :style="{ background: action.iconBg }">
            <component :is="action.icon" />
          </div>
          <div class="qa-card__body">
            <h3 class="qa-card__title">{{ action.title }}</h3>
            <p class="qa-card__desc">{{ action.desc }}</p>
          </div>
          <div class="qa-card__arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="qa-card__accent" :style="{ background: action.accent }"></div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { h } from 'vue'

// Inline SVG icon components
const IconReport = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M13 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7L13 2z', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M13 2v5h5M9 12h4M9 16h4M9 8h2', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])

const IconService = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('circle', { cx: '11', cy: '11', r: '9', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M11 7v4l3 3', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])

const IconSearch = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('circle', { cx: '10', cy: '10', r: '7', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M15.5 15.5l4 4', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])

const actions = [
  {
    id: 'pengaduan',
    title: 'Ajukan Pengaduan',
    desc: 'Laporkan masalah atau kendala IT yang Anda temui.',
    href: '/pengaduan',
    icon: IconReport,
    iconBg: 'rgba(46,184,106,0.1)',
    accent: 'linear-gradient(135deg, var(--color-mint), var(--color-jade))',
  },
  {
    id: 'layanan',
    title: 'Permintaan Layanan',
    desc: 'Request layanan IT & infrastruktur untuk kebutuhan operasional.',
    href: '/layanan',
    icon: IconService,
    iconBg: 'rgba(15,92,56,0.08)',
    accent: 'linear-gradient(135deg, var(--color-emerald), var(--color-forest))',
  },
  {
    id: 'lacak',
    title: 'Lacak Tiket',
    desc: 'Cek status dan progres tiket pengaduan atau permintaan Anda.',
    href: '/lacak',
    icon: IconSearch,
    iconBg: 'rgba(46,184,106,0.06)',
    accent: 'linear-gradient(135deg, var(--color-sage), var(--color-emerald))',
  },
]
</script>

<style scoped>
.quick-actions {
  padding: var(--space-24) 0;
  background: var(--color-mist);
  background-image: radial-gradient(circle, rgba(46,184,106,0.12) 1px, transparent 1px);
  background-size: 28px 28px;
  position: relative;
}
.quick-actions::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-forest), var(--color-mint), var(--color-emerald));
}

.qa-header {
  text-align: center;
  max-width: 520px;
  margin: 0 auto var(--space-16);
}
.qa-header__desc {
  font-size: var(--text-base);
  color: var(--color-stone);
  margin-top: var(--space-4);
  line-height: 1.7;
}

.qa-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.qa-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(168,200,180,0.2);
  text-decoration: none;
  overflow: hidden;
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
.qa-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.qa-card:hover .qa-card__arrow {
  color: var(--color-mint);
  transform: translateX(3px);
}
.qa-card:hover .qa-card__accent {
  opacity: 1;
}

/* Left accent bar */
.qa-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
  opacity: 0.35;
  transition: opacity var(--duration-normal) var(--ease-out);
}
.qa-card:hover .qa-card__accent { opacity: 1; }

.qa-card__icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-emerald);
  transition: transform var(--duration-normal) var(--ease-out);
}
.qa-card:hover .qa-card__icon {
  transform: scale(1.08);
}

.qa-card__body { flex: 1; min-width: 0; }
.qa-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-2);
  letter-spacing: -0.01em;
}
.qa-card__desc {
  font-size: var(--text-sm);
  color: var(--color-stone);
  line-height: 1.5;
}

.qa-card__arrow {
  color: var(--color-silver);
  flex-shrink: 0;
  transition: color var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}

@media (max-width: 1024px) {
  .qa-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .quick-actions { padding: var(--space-16) 0; }
  .qa-header { margin-bottom: var(--space-10); }
  .qa-card { padding: var(--space-5); }
}

@media (max-width: 480px) {
  .quick-actions { padding: var(--space-12) 0; }
  .qa-card__desc { font-size: var(--text-xs); }
}
</style>