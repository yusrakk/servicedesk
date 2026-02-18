<template>
  <div class="container">
    <div class="greet">
      <h1>Pusat Bantuan</h1>
      <p>Pilih kategori atau pertanyaan untuk melihat solusi.</p>
    </div>

    <div class="help-section">
      <div v-if="Object.keys(helpItems).length === 0" class="loading-state">
        <p>Sedang memuat data bantuan...</p>
      </div>

      <div class="boxHolder">
        <div
          v-for="(items, category) in helpItems"
          :key="category"
          class="category-wrapper"
        >
          <h2 class="category-title">{{ category || "Umum" }}</h2>

          <div class="card-grid">
            <div
              v-for="item in items"
              :key="item.ID_Help"
              class="help-card"
              @click="openDetail(item)"
            >
              <div class="card-content">
                <h3>{{ item.Judul }}</h3>
                <p>{{ truncateText(item.Konten, 100) }}</p>
                <button class="btn-detail">Lihat Detail</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-footer">
        <h3>Tidak menemukan jawaban?</h3>
        <div class="contact-buttons">
          <a
            v-if="contacts.whatsapp"
            :href="contacts.whatsapp"
            target="_blank"
            class="btn-wa"
            >WhatsApp Admin</a
          >
          <a v-if="contacts.email" :href="contacts.email" class="btn-email"
            >Email Support</a
          >
        </div>
      </div>
    </div>

    <div
      v-if="selectedHelp"
      class="modal-overlay"
      @click.self="selectedHelp = null"
    >
      <div class="modal-box">
        <button class="close-btn" @click="selectedHelp = null">✖</button>
        <h2>{{ selectedHelp.Judul }}</h2>
        <hr />
        <div class="modal-content">
          <p>{{ selectedHelp.Konten }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const helpItems = ref({});
const contacts = ref({ whatsapp: null, email: null });
const selectedHelp = ref(null);
const router = useRouter();

const fetchHelpData = async () => {
  try {
    const token = localStorage.getItem("Token");
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await axios.get("/api/helpdesk", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.data.status === "success") {
      helpItems.value = response.data.data_bantuan;
      contacts.value = response.data.kontak_admin;
    }
  } catch (error) {
    console.error("Gagal mengambil data helpdesk:", error);
  }
};

const openDetail = (item) => {
  selectedHelp.value = item;
};

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

onMounted(() => {
  fetchHelpData();
});
</script>

<style scoped>
/* Mengikuti style container utama kamu */
.container {
  background-color: #faf4ff;
  min-height: 100vh;
  padding: 2rem;
}

.category-title {
  margin-top: 2rem;
  color: #2563eb;
  border-left: 5px solid #2563eb;
  padding-left: 1rem;
  font-size: 1.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.help-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.help-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.btn-detail {
  margin-top: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.contact-footer {
  margin-top: 4rem;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
}

.contact-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-wa {
  background: #22c55e;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
}
.btn-email {
  background: #64748b;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
}

/* Modal Style */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-content {
  margin-top: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
