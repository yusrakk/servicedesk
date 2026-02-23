<template>
  <div class="faq-item" @click="toggle">
    <div class="faq-question">
      <span>{{ question }}</span>
      <span class="faq-icon">{{ isOpen ? '−' : '+' }}</span>
    </div>
    <transition name="slide">
      <div v-if="isOpen" class="faq-answer">
        {{ answer }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  question: String,
  answer: String
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.faq-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.faq-question {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
}

.faq-icon {
  font-size: 20px;
  font-weight: 300;
}

.faq-answer {
  padding: 0 20px 16px 20px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  line-height: 1.6;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>