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
                Selamat datang di Service Desk! 👋 Silakan pilih kategori
                kendala Anda atau klik tombol chat di bawah untuk bantuan admin.
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
            <div v-if="chatHistory.length === 0" class="empty-chat">
              <p>Belum ada pesan. Mulai obrolan dengan admin...</p>
            </div>
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

          <div v-else class="chat-input-area">
            <button
              @click="step = 'category'"
              class="exit-chat"
              title="Kembali ke FAQ"
            >
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

// Pengaturan Dasar Axios
const api = axios.create({
  baseURL: "http://localhost:8000", // Sesuaikan URL Laravel kamu
});

// States
const isOpen = ref(false);
const step = ref("category");
const apiHelpData = ref({});
const chatBody = ref(null);
const currentCategory = ref(null);
const currentQuestion = ref(null);

// Live Chat States
const newMessage = ref("");
const chatHistory = ref([]);
const guestToken = ref(localStorage.getItem("guest_token"));
let pollingInterval = null;

// Logika Tampilkan/Sembunyikan
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && step.value === "live-chat") {
    fetchChatHistory();
    startPolling();
  } else {
    stopPolling();
  }
};

// Ambil data FAQ (Bot)
const fetchHelpData = async () => {
  try {
    const res = await api.get("/api/helpdesk"); // Sesuaikan endpoint FAQ kamu
    apiHelpData.value = res.data.data_bantuan;
  } catch (e) {
    console.error("FAQ Error", e);
  }
};

// Mulai Live Chat (Handshake)
const startLiveChat = async () => {
  if (!guestToken.value) {
    try {
      const res = await api.post("/api/chat/init");
      // Backend mengembalikan struktur:
      // { success: true, message: 'Session initialized', data: { token: '...', session_id: '...' } }
      guestToken.value = res.data?.data?.token;
      localStorage.setItem("guest_token", guestToken.value);
    } catch (e) {
      return alert("Gagal memulai sesi");
    }
  }
  step.value = "live-chat";
  fetchChatHistory();
  startPolling();
};

// Ambil Riwayat (History)
const fetchChatHistory = async () => {
  if (!guestToken.value) return;
  try {
    const res = await api.get("/api/chat/history", {
      headers: { Authorization: `Bearer ${guestToken.value}` },
    });
    chatHistory.value = res.data.data;
    scrollToBottom();
  } catch (e) {
    console.error("Load History Gagal", e);

    // Jika sesi di backend sudah tidak ada / token tidak valid,
    // bersihkan token lama lalu paksa user memulai sesi baru.
    const msg = e?.response?.data?.message || "";
    if (msg.toLowerCase().includes("sesi chat tidak ditemukan")) {
      localStorage.removeItem("guest_token");
      guestToken.value = null;
      chatHistory.value = [];
      step.value = "category";
      alert("Sesi chat sebelumnya sudah berakhir. Silakan mulai chat baru.");
    }
  }
};

// Kirim Pesan
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
    console.error("Kirim pesan gagal", e);

    const msg = e?.response?.data?.message || "";
    if (msg.toLowerCase().includes("sesi chat tidak ditemukan")) {
      // Token / sesi tidak valid lagi
      localStorage.removeItem("guest_token");
      guestToken.value = null;
      chatHistory.value = [];
      step.value = "category";
      alert("Sesi chat sudah tidak aktif. Silakan mulai sesi baru.");
    } else {
      alert("Pesan gagal terkirim");
    }
  }
};

// Polling (Cek pesan baru dari Admin setiap 5 detik)
const startPolling = () => {
  if (pollingInterval) return;
  pollingInterval = setInterval(fetchChatHistory, 5000);
};
const stopPolling = () => {
  clearInterval(pollingInterval);
  pollingInterval = null;
};

// FAQ Navigation
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

// Helpers
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

/* Trigger FAB */
.fab-trigger {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #10b981;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  transition: 0.3s;
}
.fab-active {
  border-radius: 50%;
  background: #059669;
  transform: rotate(90deg);
}

/* Card Chat */
.chat-card {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 360px;
  height: 550px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.avatar {
  width: 40px;
  height: 40px;
  background: #ecfdf5;
  color: #10b981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
}
.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}
.text-info h3 {
  margin: 0;
  font-size: 16px;
}

.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fcfcfc;
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
  max-width: 80%;
  padding: 12px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
}
.bot .msg-bubble {
  background: #f3f4f6;
  color: #1f2937;
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
  opacity: 0.7;
  text-align: right;
}

/* Input Area */
.chat-footer {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #eee;
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
  padding: 8px 15px;
  border-radius: 25px;
  border: 1px solid #e5e7eb;
}
.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1f2937;
}
.input-wrapper button {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
}
.exit-chat {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

/* FAQ Buttons */
.opt-btn-minimal {
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: 0.2s;
}
.opt-btn-minimal:hover {
  border-color: #10b981;
  background: #f0fdf4;
}
.pill-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
}
.wa {
  background: #10b981;
  color: white;
}
.mail {
  background: #f3f4f6;
  color: #4b5563;
  margin-left: 10px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: 0.3s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
