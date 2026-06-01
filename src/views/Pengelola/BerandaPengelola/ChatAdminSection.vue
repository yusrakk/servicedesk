<template>
  <div class="chat-admin-section">
    <h2 class="section-title">Chat Layanan (Live)</h2>

    <div class="chat-layout">
      <div class="chat-session-list">
        <div v-if="loading" class="loading-data">Memuat daftar chat...</div>
        <div v-else>
          <p v-if="error" class="chat-error">{{ error }}</p>
          <p v-if="!error && sessions.length === 0" class="no-data">Belum ada sesi chat aktif.</p>
          
          <ul v-else class="session-items">
            <li
              v-for="session in sessions"
              :key="session.id"
              class="session-item"
              :class="{ active: selectedSession && selectedSession.id === session.id }"
              @click="pilihSession(session)"
            >
              <div class="session-header">
                <span class="guest-name">{{ session.guest_name || 'Guest User' }}</span>
                <span v-if="session.unread_count > 0" class="badge">{{ session.unread_count }}</span>
              </div>
              <div class="session-instansi">{{ session.instansi || 'Umum' }}</div>
              <div class="session-meta">
              </div>
              <div class="session-time">Aktif: {{ formatTime(session.last_active_at) }}</div>
            </li>
          </ul>
        </div>
      </div>

      <div class="chat-conversation" v-if="selectedSession">
        <div class="convo-header">
          <h3>{{ selectedSession.guest_name }} <small>({{ selectedSession.instansi }})</small></h3>
        </div>
        
        <div class="messages" ref="msgContainer">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="msg-row"
            :class="msg.sender_type === 'guest' ? 'guest' : 'admin'"
          >
            <div class="msg-bubble">
              <p class="msg-text">{{ msg.message }}</p>
              <span class="msg-time-inner">{{ formatTime(msg.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="reply-box">
          <textarea
            v-model="replyText"
            placeholder="Tulis balasan..."
            class="reply-input"
            rows="2"
            @keyup.enter.exact.prevent="kirimBalasan"
          ></textarea>
          <button class="reply-button" :disabled="!replyText.trim()" @click="kirimBalasan">
            Kirim
          </button>
        </div>
      </div>

      <div class="chat-conversation empty" v-else>
        <p>Pilih salah satu pesan untuk membalas</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'

const sessions = ref([])
const selectedSession = ref(null)
const messages = ref([])
const loading = ref(false)
const error = ref('')
const replyText = ref('')
const msgContainer = ref(null)

const getHeaders = () => ({
  headers: { Authorization: 'Bearer ' + localStorage.getItem('Token') }
})

const loadChatSessions = async () => {
  try {
    loading.value = true
    const res = await axios.get('/api/admin/chat/list', getHeaders())
    sessions.value = res.data.data || []
  } catch (err) {
    error.value = 'Gagal memuat list chat'
  } finally {
    loading.value = false
  }
}

const pilihSession = async (session) => {
  selectedSession.value = session
  try {
    const res = await axios.get(`/api/admin/chat/detail/${session.id}`, getHeaders())
    messages.value = res.data.data.messages || []
    scrollToBottom()
  } catch (err) {
    error.value = 'Gagal memuat pesan'
  }
}

const kirimBalasan = async () => {
  if (!replyText.value.trim()) return
  const text = replyText.value
  replyText.value = ''

  try {
    const res = await axios.post(`/api/admin/chat/reply/${selectedSession.value.id}`, {
      message: text
    }, getHeaders())
    messages.value.push(res.data.data)
    scrollToBottom()
  } catch (err) {
    alert('Gagal mengirim')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

onMounted(loadChatSessions)
</script>

<style scoped>
/* Styling emerald & clean */
.chat-admin-section { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.chat-layout { display: flex; gap: 20px; height: 450px; }
.chat-session-list { width: 300px; border-right: 1px solid #f3f4f6; overflow-y: auto; padding-right: 10px; }
.session-item { padding: 12px; border-radius: 10px; cursor: pointer; background: #f9fafb; margin-bottom: 8px; border: 1px solid transparent; }
.session-item.active { background: #ecfdf5; border-color: #10b981; }
.guest-name { font-weight: 700; color: #111827; display: block; }
.session-instansi { font-size: 12px; color: #059669; font-weight: 600; margin-bottom: 4px; }
.session-time { font-size: 10px; color: #9ca3af; }
.badge { background: #ef4444; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; float: right; }

.chat-conversation { flex: 1; display: flex; flex-direction: column; }
.messages { flex: 1; overflow-y: auto; padding: 15px; background: #f8fafc; border-radius: 12px; }
.msg-row { display: flex; margin-bottom: 10px; }
.guest { justify-content: flex-start; }
.admin { justify-content: flex-end; }
.msg-bubble { max-width: 70%; padding: 10px 14px; border-radius: 12px; position: relative; }
.guest .msg-bubble { background: #e5e7eb; color: #1f2937; }
.admin .msg-bubble { background: #10b981; color: white; }
.msg-time-inner { font-size: 9px; opacity: 0.7; display: block; margin-top: 4px; }

.reply-box { display: flex; gap: 10px; margin-top: 15px; }
.reply-input { flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; resize: none; }
.reply-button { background: #10b981; color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>