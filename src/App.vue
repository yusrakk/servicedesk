<script setup>
import { RouterView, useRoute } from "vue-router";
import Sidebar from "../src/views/SideBar/sidebar.vue";
import Toolbar from "./views/Toolbar/toolbar.vue";
import HelpdeskButton from "./components/HelpdeskButton.vue";
import { ref, onMounted, computed } from "vue";

const route = useRoute();
const isSidebarCollapsed = ref(false);

// Halaman yang TIDAK pakai sidebar/toolbar (public pages)
const publicPages = ["/login", "/lacak", "/welcome", "/helpdesk"];

const isPublicPage = computed(() =>
  publicPages.includes(route.path)
);

const hiddenFooterPages = ["Login", "ProfileSaya", "EditProfile", "Welcome", "LacakTiket", "HelpDesk"];

onMounted(() => {
  window.addEventListener("sidebar-toggle", (event) => {
    isSidebarCollapsed.value = event.detail.isCollapsed;
  });
});
</script>

<template>
  <!-- Sidebar — hanya untuk halaman dalam (bukan public) -->
  <div v-if="!isPublicPage" class="sidebar-wrapper">
    <Sidebar />
  </div>

  <!-- Toolbar — hanya untuk halaman dalam -->
  <div v-if="!isPublicPage" class="toolbar-wrapper">
    <Toolbar />
  </div>

  <!-- Konten utama -->
  <div
    class="main-content"
    :class="{
      'with-sidebar':   !isPublicPage,
      'with-toolbar':   !isPublicPage,
      'sidebar-collapsed': isSidebarCollapsed && !isPublicPage,
      'toolbar-collapsed': isSidebarCollapsed && !isPublicPage,
    }"
  >
    <div class="page-content">
      <RouterView />
      <!-- HelpdeskButton hanya di halaman dalam -->
      <HelpdeskButton v-if="!isPublicPage" />
    </div>

    <footer
      v-if="!isPublicPage && !hiddenFooterPages.includes(route.name)"
      class="app-footer"
    >
      <p>© 2025 Service Desk V3.0. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
html, body, #app {
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
  top: 60px;
  left: 0;
  width: 16rem;
  height: calc(100vh - 60px);
  overflow-y: auto;
  z-index: 100;
}

.main-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.with-sidebar {
  margin-left: 16rem;
  padding: 20px;
  height: 100vh;
  transition: margin-left 0.2s ease;
}

.sidebar-collapsed {
  margin-left: 50px;
}

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
  margin-left: 16rem;
  margin-top: 60px;
}

.toolbar-collapsed {
  margin-left: 50px;
  margin-top: 60px;
}

.app-footer {
  margin-top: auto;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
}

@media (max-width: 768px) {
  .with-sidebar { margin-left: 50px; }
}
</style>