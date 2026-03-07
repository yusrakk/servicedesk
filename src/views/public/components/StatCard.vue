<template>
  <div class="stat-card">
    <div class="stat-card__icon">
      <slot name="icon" />
    </div>
    <div class="stat-card__body">
      <div class="stat-card__value">
        <AnimatedNumber :target="numericValue" :suffix="suffix" />
      </div>
      <p class="stat-card__label">{{ label }}</p>
    </div>
    <div class="stat-card__trend" v-if="trend">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 9l3.5-4 2.5 3L11 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ trend }}
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref, watch, onMounted, h, computed } from 'vue'

const props = defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  trend: { type: String, default: '' },
})

// Parse numeric value and suffix
const numericValue = computed(() => parseFloat(String(props.value).replace(/[^0-9.]/g, '')) || 0)
const suffix = computed(() => {
  const match = String(props.value).match(/[^0-9.]+$/)
  return match ? match[0] : ''
})

// Animated number component
const AnimatedNumber = defineComponent({
  props: {
    target: Number,
    suffix: { type: String, default: '' },
  },
  setup(p) {
    const current = ref(0)
    const animate = () => {
      const start = Date.now()
      const duration = 1400
      const easeOut = (t) => 1 - Math.pow(1 - t, 3)
      const frame = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        current.value = p.target * easeOut(progress)
        if (progress < 1) requestAnimationFrame(frame)
        else current.value = p.target
      }
      requestAnimationFrame(frame)
    }
    onMounted(animate)
    watch(() => p.target, animate)
    return () => h('span', [
      p.target >= 100
        ? Math.round(current.value).toLocaleString('id-ID')
        : current.value.toFixed(1).replace('.0', ''),
      p.suffix
    ])
  }
})
</script>

<style scoped>
.stat-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(168,200,180,0.2);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  overflow: hidden;
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-mint), var(--color-emerald));
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}
.stat-card:hover::after { opacity: 1; }

.stat-card__icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--color-foam), rgba(46,184,106,0.08));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-emerald);
  flex-shrink: 0;
}

.stat-card__body { flex: 1; }
.stat-card__value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-ink);
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-1);
}
.stat-card__label {
  font-size: var(--text-sm);
  color: var(--color-stone);
  font-weight: 400;
}

.stat-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-mint);
  background: rgba(46,184,106,0.1);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  align-self: flex-start;
}
</style>
