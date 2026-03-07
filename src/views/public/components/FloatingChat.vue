<template>
  <div class="floating-chat">
    <!-- Chat Window -->
    <transition name="chat-window">
      <div v-if="isOpen" class="chat-window">
        <div class="chat-window__header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="7" r="3" fill="white"/>
                <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="chat-status"></span>
            </div>
            <div>
              <p class="chat-name">Helpdesk Diskominfo</p>
              <p class="chat-online">● Online — Siap membantu</p>
            </div>
          </div>
          <button class="chat-close" @click="isOpen = false" aria-label="Tutup chat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages" ref="messagesEl">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-msg"
            :class="msg.from === 'bot' ? 'chat-msg--bot' : 'chat-msg--user'"
          >
            <p>{{ msg.text }}</p>
            <span class="chat-msg__time">{{ msg.time }}</span>
          </div>
        </div>

        <div class="chat-input-row">
          <input
            v-model="input"
            class="input"
            placeholder="Ketik pesan…"
            @keyup.enter="send"
          />
          <button class="btn btn-primary btn-icon" @click="send" :disabled="!input.trim()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.5 7H1.5M12.5 7L8.5 3M12.5 7L8.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- FAB -->
    <button
      class="chat-fab"
      @click="isOpen = !isOpen"
      :class="{ 'chat-fab--open': isOpen }"
      aria-label="Buka live chat"
    >
      <transition name="icon-swap" mode="out-in">
        <svg v-if="!isOpen" key="chat" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M20 11c0 5-4 9-9 9-1.6 0-3.1-.4-4.4-1.1L2 20l1.1-4.6A9 9 0 112 11h18z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 11h.01M11 11h.01M15 11h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else key="close" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </transition>
      <span v-if="unread > 0 && !isOpen" class="chat-unread">{{ unread }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const input = ref('')
const unread = ref(1)
const messagesEl = ref(null)

const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const messages = ref([
  {
    id: 1,
    from: 'bot',
    text: 'Halo! Selamat datang di Helpdesk Diskominfo Jawa Barat. Ada yang bisa kami bantu? 👋',
    time: now(),
  }
])
let nextId = 2

const send = async () => {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ id: nextId++, from: 'user', text, time: now() })
  input.value = ''
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight

  // Auto reply
  setTimeout(async () => {
    messages.value.push({
      id: nextId++,
      from: 'bot',
      text: 'Terima kasih pesannya. Tim kami akan segera menghubungi Anda. Untuk pengaduan resmi, silakan buat tiket melalui halaman Pengaduan.',
      time: now(),
    })
    await nextTick()
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }, 800)
}

const openChat = () => {
  isOpen.value = true
  unread.value = 0
}
</script>

<style scoped>
.floating-chat {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3);
}

/* FAB */
.chat-fab {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-green), var(--shadow-md);
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}
.chat-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 40px rgba(46,184,106,0.4), var(--shadow-lg);
}
.chat-unread {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Chat Window */
.chat-window {
  width: 340px;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(168,200,180,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(135deg, var(--color-forest), var(--color-emerald));
}
.chat-header-info { display: flex; align-items: center; gap: var(--space-3); }
.chat-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 9px;
  height: 9px;
  background: var(--color-mint);
  border-radius: 50%;
  border: 2px solid var(--color-forest);
}
.chat-name {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  color: white;
}
.chat-online {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
}
.chat-close {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.15);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background var(--duration-fast);
}
.chat-close:hover { background: rgba(255,255,255,0.25); }

.chat-messages {
  flex: 1;
  min-height: 200px;
  max-height: 280px;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: var(--color-silver); border-radius: 4px; }

.chat-msg { max-width: 80%; display: flex; flex-direction: column; gap: 4px; }
.chat-msg p {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.chat-msg__time { font-size: 10px; color: var(--color-silver); }

.chat-msg--bot { align-self: flex-start; }
.chat-msg--bot p {
  background: var(--color-foam);
  color: var(--color-charcoal);
  border-bottom-left-radius: 4px;
}
.chat-msg--bot .chat-msg__time { text-align: left; }

.chat-msg--user { align-self: flex-end; align-items: flex-end; }
.chat-msg--user p {
  background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  color: white;
  border-bottom-right-radius: 4px;
}
.chat-msg--user .chat-msg__time { text-align: right; }

.chat-input-row {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5) var(--space-5);
  border-top: 1px solid var(--color-foam);
}
.chat-input-row .btn-icon { flex-shrink: 0; }
.chat-input-row .btn-icon:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

/* Transitions */
.chat-window-enter-active { transition: all var(--duration-normal) var(--ease-out); }
.chat-window-leave-active { transition: all 220ms var(--ease-in-out); }
.chat-window-enter-from { opacity: 0; transform: translateY(12px) scale(0.96); }
.chat-window-leave-to  { opacity: 0; transform: translateY(8px) scale(0.98); }

.icon-swap-enter-active, .icon-swap-leave-active { transition: all 180ms var(--ease-out); }
.icon-swap-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.8); }
.icon-swap-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.8); }

@media (max-width: 480px) {
  .chat-window { width: calc(100vw - 2rem); }
  .floating-chat { right: var(--space-4); bottom: var(--space-4); }
}
</style>
