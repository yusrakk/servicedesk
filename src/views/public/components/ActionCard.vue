<template>
  <a :href="href" class="action-card">
    <div class="action-card__top">
      <div class="action-card__icon">
        <slot name="icon" />
      </div>
      <div class="action-card__badge" v-if="badge">{{ badge }}</div>
    </div>
    <div class="action-card__body">
      <h3 class="action-card__title">{{ title }}</h3>
      <p class="action-card__desc">{{ description }}</p>
    </div>
    <div class="action-card__footer">
      <span class="action-card__cta">{{ cta }}</span>
      <div class="action-card__arrow">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  href:        { type: String, default: '#' },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  cta:         { type: String, default: 'Selengkapnya' },
  badge:       { type: String, default: '' },
})
</script>

<style scoped>
.action-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(168,200,180,0.2);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  overflow: hidden;
  position: relative;
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
.action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(46,184,106,0.04) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}
.action-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.action-card:hover::before { opacity: 1; }
.action-card:hover .action-card__arrow { transform: translateX(4px); color: var(--color-mint); }

.action-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.action-card__icon {
  width: 48px;
  height: 48px;
  background: var(--color-foam);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-emerald);
  transition: background var(--duration-normal) var(--ease-out), color var(--duration-normal) var(--ease-out);
}
.action-card:hover .action-card__icon {
  background: var(--color-mint);
  color: var(--color-white);
}

.action-card__badge {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-mint);
  background: rgba(46,184,106,0.1);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.action-card__body { flex: 1; }
.action-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-2);
  letter-spacing: -0.01em;
}
.action-card__desc {
  font-size: var(--text-sm);
  color: var(--color-stone);
  line-height: 1.6;
}

.action-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-foam);
}
.action-card__cta {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-emerald);
}
.action-card__arrow {
  color: var(--color-silver);
  transition: transform var(--duration-normal) var(--ease-out),
              color var(--duration-normal) var(--ease-out);
}
</style>
