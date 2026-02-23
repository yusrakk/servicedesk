<template>
  <button 
    class="floating-chat" 
    @click="handleChatClick"
    :class="{ 'chat-open': isChatOpen }"
  >
    <transition name="icon-rotate" mode="out-in">
      <svg 
        v-if="!isChatOpen"
        key="chat"
        class="chat-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg
        v-else
        key="close"
        class="chat-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </transition>

    <span v-if="hasUnread" class="chat-badge">{{ unreadCount }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const isChatOpen = ref(false)
const hasUnread = ref(false)
const unreadCount = ref(0)

const handleChatClick = () => {
  isChatOpen.value = !isChatOpen.value
  
  // TODO: Implement chat widget toggle
  console.log('Chat toggled:', isChatOpen.value)
  
  // Reset unread when opened
  if (isChatOpen.value) {
    hasUnread.value = false
    unreadCount.value = 0
  }
}
</script>

<style scoped>
.floating-chat {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  background: #2d5d42;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  z-index: 999;
}

.floating-chat:hover {
  background: #234a34;
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.floating-chat.chat-open {
  background: #dc2626;
}

.floating-chat.chat-open:hover {
  background: #b91c1c;
}

.chat-icon {
  width: 24px;
  height: 24px;
}

.chat-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid #4a7d58;
}

/* Animation */
.icon-rotate-enter-active,
.icon-rotate-leave-active {
  transition: all 0.3s ease;
}

.icon-rotate-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-rotate-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* Responsive */
@media (max-width: 640px) {
  .floating-chat {
    bottom: 20px;
    right: 20px;
    width: 52px;
    height: 52px;
  }

  .chat-icon {
    width: 22px;
    height: 22px;
  }
}
</style>