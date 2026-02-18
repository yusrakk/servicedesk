<script setup>
import { RouterLink, RouterView } from "vue-router";
import Sidebar from "../src/views/SideBar/sidebar.vue";
//import Toolbar from '../src/views/Toolbar/toolbar.vue' // 🔹 Tambahkan ini
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import Toolbar from "./views/Toolbar/toolbar.vue";
import HelpdeskButton from "./components/HelpdeskButton.vue";

const route = useRoute();
const isSidebarCollapsed = ref(false);
const hiddenFooterPages = ["Login", "ProfileSaya", "EditProfile"];

// Dengarkan event collapse dari sidebar
onMounted(() => {
  window.addEventListener("sidebar-toggle", (event) => {
    isSidebarCollapsed.value = event.detail.isCollapsed;
  });
});
</script>

<template>
  <!-- Sidebar -->
  <div
    v-if="route.path !== '/login' && route.path !== '/lacak'"
    class="sidebar-wrapper"
  >
    <Sidebar />
  </div>
  <!-- Toolbar -->
  <div
    v-if="route.path !== '/login' && route.path !== '/lacak'"
    class="toolbar-wrapper"
  >
    <Toolbar />
  </div>

  <!-- Konten utama -->
  <div
    class="main-content"
    :class="{
      'with-sidebar': route.path !== '/login' && route.path !== '/lacak',
      'sidebar-collapsed':
        isSidebarCollapsed &&
        route.path !== '/login' &&
        route.path !== '/lacak',
      'with-toolbar': route.path !== '/login' && route.path !== '/lacak',
      'toolbar-collapsed':
        isSidebarCollapsed &&
        route.path !== '/login' &&
        route.path !== '/lacak',
    }"
  >
    <!-- 🔹 Isi halaman -->
    <div class="page-content">
      <RouterView />
      <HelpdeskButton />
    </div>

    <!-- 🔹 Footer -->
    <footer v-if="!hiddenFooterPages.includes(route.name)" class="app-footer">
      <p>© 2025 Service Desk V3.0. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background: #faf4ff !important;
}
</style>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  top: 60px; /* Mulai dari BAWAH toolbar */
  left: 0;
  width: 16rem;
  height: calc(100vh - 60px);
  overflow-y: auto;
  z-index: 100;
}

/* Layout konten */
.main-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.with-sidebar {
  margin-left: 16rem; /* Sidebar normal */
  padding: 20px;
  height: 100vh;
  transition: margin-left 0.2s ease;
}

.sidebar-collapsed {
  margin-left: 50px; /* Sidebar collapsed */
}

/* 🔹 Toolbar */
.toolbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.with-toolbar {
  margin-left: 16rem; /* Sidebar normal */
  margin-top: 60px; /* Space dari toolbar */
}

.toolbar-collapsed {
  margin-left: 50px; /* Sidebar collapsed */
  margin-top: 60px; /* Space dari toolbar */
}

/* 🔹 Footer */
.app-footer {
  margin-top: auto;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
}

/* Responsive */
@media (max-width: 768px) {
  .with-sidebar {
    margin-left: 50px;
  }
}
</style>
