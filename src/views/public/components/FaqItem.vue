<template>
  <div class="faq-item" :class="{ 'faq-item--open': isOpen }">
    <button class="faq-item__trigger" @click="isOpen = !isOpen" :aria-expanded="isOpen">
      <span class="faq-item__question">{{ question }}</span>
      <div class="faq-item__icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </button>
    <transition name="faq-expand" @enter="enter" @leave="leave">
      <div v-if="isOpen" class="faq-item__answer-wrap">
        <div class="faq-item__answer">
          <p>{{ answer }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  question: { type: String, required: true },
  answer: { type: String, required: true },
})

const isOpen = ref(false)

// Height animation helpers
const enter = (el) => {
  el.style.maxHeight = '0'
  el.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    el.style.transition = 'max-height 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease'
    el.style.opacity = '0'
    requestAnimationFrame(() => {
      el.style.maxHeight = el.scrollHeight + 'px'
      el.style.opacity = '1'
    })
  })
}
const leave = (el) => {
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    el.style.transition = 'max-height 280ms cubic-bezier(0.45, 0, 0.55, 1), opacity 220ms ease'
    el.style.maxHeight = '0'
    el.style.opacity = '0'
  })
}
</script>

<style scoped>
.faq-item {
  border-bottom: 1px solid var(--color-foam);
}
.faq-item:last-child { border-bottom: none; }

.faq-item__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-5) 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.faq-item__question {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
  transition: color var(--duration-fast);
  line-height: 1.4;
}
.faq-item__trigger:hover .faq-item__question { color: var(--color-emerald); }

.faq-item__icon {
  width: 32px;
  height: 32px;
  background: var(--color-foam);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-stone);
  transition: background var(--duration-normal) var(--ease-out),
              color var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
.faq-item--open .faq-item__icon {
  background: var(--color-mint);
  color: var(--color-white);
  transform: rotate(180deg);
}

.faq-item__answer {
  padding: 0 0 var(--space-5);
}
.faq-item__answer p {
  font-size: var(--text-sm);
  color: var(--color-stone);
  line-height: 1.75;
}
</style>
