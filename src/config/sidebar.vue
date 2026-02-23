<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { MENU_BY_ROLE, ROLE_NAMES } from "../../config/menu";
import LogoServiceDesk from "../../../public/logo.svg";

// --- State Management ---
const roleId = ref(localStorage.getItem("id_role"));
const nama_depan = ref(localStorage.getItem("nama_depan"));
const nama_belakang = ref(localStorage.getItem("nama_belakang"));
const gambar = ref(localStorage.getItem("src_gambar"));

const isOpen = ref(true);
const dropdownref = ref(false);
const tampilinOverlay = ref(false);
const router = useRouter();

// --- Computed Properties (Logika Pintar) ---
const menuItem = computed(() => MENU_BY_ROLE[roleId.value] || []);
const currentRoleName = computed(() => ROLE_NAMES[roleId.value] || "Guest");

const imageSrc = computed(() => {
  return gambar.value ? `/images/${gambar.value}` : "/images/default.jpeg";
});

// --- Methods ---
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", {
      detail: { isCollapsed: !isOpen.value },
    }),
  );
};

const togglereferensi = () => {
  dropdownref.value = !dropdownref.value;
};

const logout = () => {
  localStorage.clear();
  router.push("/login");
};

// --- Lifecycle & Listeners ---
const updateData = () => {
  roleId.value = localStorage.getItem("id_role");
  nama_depan.value = localStorage.getItem("nama_depan");
  nama_belakang.value = localStorage.getItem("nama_belakang");
  gambar.value = localStorage.getItem("src_gambar");
};

onMounted(() => {
  window.addEventListener("gambar-changed", updateData);
  window.addEventListener("sudahLogin", updateData);
});

onBeforeUnmount(() => {
  window.removeEventListener("gambar-changed", updateData);
  window.removeEventListener("sudahLogin", updateData);
});
</script>

<template>
  <aside :class="['sidebar', { collapsed: !isOpen }]">
    <div class="logo-wrapper">
      <div class="logo">
        <img
          :src="LogoServiceDesk"
          :class="isOpen ? 'logo-large' : 'logo-small'"
          alt="Logo"
        />
        <span v-if="isOpen" class="logo-text">Service<br />Desk V3.0</span>
      </div>
    </div>

    <button class="tombol-toggle" @click="toggleSidebar">☰</button>

    <nav class="menu-container">
      <div v-for="item in menuItem" :key="item.label">
        <div v-if="item.children" class="menu-group">
          <div class="menu-item" @click="togglereferensi">
            <img :src="item.icon" class="Icon" />
            <span v-if="isOpen">{{ item.label }}</span>
          </div>

          <ul v-if="dropdownref && isOpen" class="dropdown-list">
            <li v-for="child in item.children" :key="child.label">
              <router-link
                :to="child.to"
                class="dropdown-item-ref"
                active-class="active"
              >
                <img :src="child.icon" class="Icon-child" />
                <span>{{ child.label }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <router-link
          v-else
          :to="item.to"
          class="menu-item"
          active-class="active"
        >
          <img :src="item.icon" class="Icon" />
          <span v-if="isOpen">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer" @click="logout">
      <span v-if="isOpen">Keluar ({{ currentRoleName }})</span>
    </div>
  </aside>
</template>

<style scoped>
/* Gunakan Flexbox untuk layouting */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f0f0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 16rem;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 60px;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* Scrollbar hidden tapi tetap bisa scroll */
.menu-container::-webkit-scrollbar {
  display: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  cursor: pointer;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #e0e0e0;
}

.menu-item:hover,
.active {
  background: #e2e2e2;
  border-left: 4px solid #5a9272;
}

.dropdown-list {
  background: #e8e8e8;
  list-style: none;
  padding: 0;
}

.dropdown-item-ref {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 25px;
  text-decoration: none;
  color: #555;
  font-size: 0.85rem;
}

.Icon {
  width: 24px;
  height: 24px;
}
.Icon-child {
  width: 18px;
  height: 18px;
}

.logo-wrapper {
  background: #5a9272;
  padding: 20px 10px;
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.logo-text {
  color: white;
  font-weight: bold;
  line-height: 1.1;
}
.logo-large {
  width: 50px;
}
.logo-small {
  width: 30px;
}

.tombol-toggle {
  background: #5a9272;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
</style>
