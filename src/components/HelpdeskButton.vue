<template>
  <div class="chatbot-container">
    <button
      @click="toggleChat"
      class="fab-trigger"
      :class="{ 'fab-active': isOpen }"
    >
      <svg
        v-if="!isOpen"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        ></path>
      </svg>
      <svg
        v-else
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="chat-card">
        <header class="chat-header">
          <div class="header-info">
            <div class="avatar-status">
              <div class="avatar">SD</div>
              <span class="status-indicator"></span>
            </div>
            <div class="text-info">
              <h3>Service Desk</h3>
            </div>
          </div>
        </header>

        <div class="chat-body" ref="chatBody">
          <template v-if="step !== 'live-chat'">
            <div class="msg-group bot">
              <div class="msg-bubble shadow-subtle">
                Selamat datang! 👋 Ada yang bisa kami bantu? Silakan pilih
                kategori atau chat langsung dengan admin.
              </div>
            </div>

            <div v-if="step === 'category'" class="options-wrapper">
              <button
                v-for="(items, categoryName) in apiHelpData"
                :key="categoryName"
                @click="selectCategory(categoryName)"
                class="opt-btn-minimal"
              >
                <span>{{ categoryName || "Lainnya" }}</span>
                <span class="chevron">→</span>
              </button>
            </div>

            <div v-if="step === 'questions'" class="interaction-flow">
              <div class="msg-group user">
                <div class="msg-bubble primary">{{ currentCategory }}</div>
              </div>
              <div class="options-wrapper">
                <button
                  v-for="item in apiHelpData[currentCategory]"
                  :key="item.id"
                  @click="selectQuestion(item)"
                  class="opt-btn-minimal secondary"
                >
                  {{ item.title }}
                </button>
                <button @click="resetToCategory" class="back-link">
                  ← Ganti Kategori
                </button>
              </div>
            </div>

            <div v-if="step === 'answer'" class="interaction-flow">
              <div class="msg-group user">
                <div class="msg-bubble primary">
                  {{ currentQuestion.title }}
                </div>
              </div>
              <div class="msg-group bot">
                <div class="msg-bubble shadow-subtle rich-text">
                  {{ currentQuestion.content }}
                </div>
              </div>
              <div class="options-wrapper center">
                <button @click="step = 'questions'" class="back-link">
                  ← Pertanyaan lain
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="!guestToken" class="auth-form">
              <div class="msg-group bot">
                <div class="msg-bubble shadow-subtle">
                  Sebelum memulai, mohon isi identitas Anda:
                </div>
              </div>
              <div class="form-wrapper">
                <input
                  v-model="formInit.guest_name"
                  placeholder="Nama Lengkap"
                  class="input-field"
                />
                <input
                  v-model="formInit.instansi"
                  placeholder="Asal Instansi"
                  class="input-field"
                />
                <button
                  @click="handleStartSession"
                  :disabled="!formInit.guest_name || !formInit.instansi"
                  class="submit-btn"
                >
                  Mulai Chat
                </button>
              </div>
            </div>

            <div v-else class="chat-messages-area">
              <div
                v-for="chat in chatHistory"
                :key="chat.id"
                class="msg-group"
                :class="chat.sender_type === 'guest' ? 'user' : 'bot'"
              >
                <div
                  class="msg-bubble"
                  :class="
                    chat.sender_type === 'guest' ? 'primary' : 'shadow-subtle'
                  "
                >
                  {{ chat.message }}
                  <small class="chat-time">{{
                    formatTime(chat.created_at)
                  }}</small>
                </div>
              </div>
              <div v-if="chatHistory.length === 0" class="empty-notif">
                Menghubungkan ke admin...
              </div>
            </div>
          </template>
        </div>

        <footer class="chat-footer">
          <div v-if="step !== 'live-chat'">
            <div class="contact-row">
              <button @click="startLiveChat" class="pill-btn wa">
                Chat Admin Live
              </button>
              <button
                v-if="step !== 'category'"
                @click="resetToCategory"
                class="pill-btn mail"
              >
                Awal
              </button>
            </div>
          </div>

          <div v-else-if="guestToken" class="chat-input-area">
            <button @click="exitLiveChat" class="exit-chat" title="Keluar Chat">
              ×
            </button>
            <div class="input-wrapper">
              <input
                v-model="newMessage"
                @keyup.enter="sendLiveMessage"
                placeholder="Tulis pesan..."
              />
              <button @click="sendLiveMessage" :disabled="!newMessage.trim()">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import axios from "axios";

// API Config
const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Navigation States
const isOpen = ref(false);
const step = ref("category"); // category, questions, answer, live-chat
const apiHelpData = ref({});
const chatBody = ref(null);
const currentCategory = ref(null);
const currentQuestion = ref(null);

// Live Chat States
const newMessage = ref("");
const chatHistory = ref([]);
const guestToken = ref(localStorage.getItem("guest_token"));
const formInit = ref({ guest_name: "", instansi: "" });
let pollingInterval = null;

// Core Logic
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && guestToken.value && step.value === "live-chat") {
    fetchChatHistory();
    startPolling();
  } else {
    stopPolling();
  }
};

const fetchHelpData = async () => {
  try {
    const res = await api.get("/api/helpdesk");
    apiHelpData.value = res.data.data_bantuan;
  } catch (e) {
    console.error("Gagal load FAQ", e);
  }
};

const startLiveChat = () => {
  step.value = "live-chat";
  if (guestToken.value) {
    fetchChatHistory();
    startPolling();
  }
};

const handleStartSession = async () => {
  try {
    const res = await api.post("/api/chat/init", {
      guest_name: formInit.value.guest_name,
      instansi: formInit.value.instansi,
    });
    // Menyesuaikan struktur JSON Controller: { data: { token: '...' } }
    const token = res.data.data.token;
    guestToken.value = token;
    localStorage.setItem("guest_token", token);

    fetchChatHistory();
    startPolling();
  } catch (e) {
    alert(e.response?.data?.message || "Gagal memulai sesi");
  }
};

const fetchChatHistory = async () => {
  if (!guestToken.value) return;
  try {
    const res = await api.get("/api/chat/history", {
      headers: { Authorization: `Bearer ${guestToken.value}` },
    });
    chatHistory.value = res.data.data;
    scrollToBottom();
  } catch (e) {
    if (e.response?.status === 401) {
      localStorage.removeItem("guest_token");
      guestToken.value = null;
      stopPolling();
    }
  }
};

const sendLiveMessage = async () => {
  if (!newMessage.value.trim()) return;
  const msgText = newMessage.value;
  newMessage.value = ""; // Optimistic UI

  try {
    const res = await api.post(
      "/api/chat/send",
      { message: msgText },
      { headers: { Authorization: `Bearer ${guestToken.value}` } },
    );
    chatHistory.value.push(res.data.data);
    scrollToBottom();
  } catch (e) {
    alert("Pesan gagal terkirim");
  }
};

// Utilities
const startPolling = () => {
  if (pollingInterval) return;
  pollingInterval = setInterval(fetchChatHistory, 5000);
};
const stopPolling = () => {
  clearInterval(pollingInterval);
  pollingInterval = null;
};
const exitLiveChat = () => {
  step.value = "category";
  stopPolling();
};
const selectCategory = (cat) => {
  currentCategory.value = cat;
  step.value = "questions";
  scrollToBottom();
};
const selectQuestion = (item) => {
  currentQuestion.value = item;
  step.value = "answer";
  scrollToBottom();
};
const resetToCategory = () => {
  step.value = "category";
  currentCategory.value = null;
};
const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
};
const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return (
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0")
  );
};

onMounted(fetchHelpData);
onUnmounted(stopPolling);
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  font-family: "Inter", sans-serif;
}

/* FAB Style */
.fab-trigger {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: rgb(11, 97, 69);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-active {
  border-radius: 50%;
  background: #059669;
  transform: rotate(90deg);
}

/* Card Style */
.chat-card {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 360px;
  height: 580px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.chat-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f3f4f6;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  background: #ecfdf5;
  color: #10b981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  position: relative;
}
.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}
.text-info h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}
.status-text {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.msg-group {
  display: flex;
  width: 100%;
}
.bot {
  justify-content: flex-start;
}
.user {
  justify-content: flex-end;
}
.msg-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
}
.bot .msg-bubble {
  background: #f3f4f6;
  color: #374151;
  border-bottom-left-radius: 4px;
}
.user .msg-bubble {
  background: #10b981;
  color: white;
  border-bottom-right-radius: 4px;
}
.chat-time {
  display: block;
  font-size: 10px;
  margin-top: 5px;
  opacity: 0.8;
  text-align: right;
}

/* Form Style */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input-field {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
}
.input-field:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.submit-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
.submit-btn:disabled {
  background: #d1d5db;
}

/* Input Area Style */
.chat-footer {
  padding: 15px;
  background: white;
  border-top: 1px solid #f3f4f6;
}
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.input-wrapper {
  flex: 1;
  display: flex;
  background: #f9fafb;
  padding: 10px 16px;
  border-radius: 25px;
  border: 1px solid #e5e7eb;
  color: #1f2937;
}
.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1f2937;
}
.exit-chat {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

/* FAQ Buttons */
.opt-btn-minimal {
  width: 100%;
  padding: 14px;
  margin-bottom: 8px;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  background: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: 0.2s;
  color: #374151;
  font-weight: 500;
}
.opt-btn-minimal:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #059669;
}
.pill-btn {
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: 0.2s;
}
.wa {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.mail {
  background: #f3f4f6;
  color: #4b5563;
  margin-left: 10px;
}

/* Transitions */ 
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
