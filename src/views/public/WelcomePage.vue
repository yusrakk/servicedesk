<template>
  <div class="welcome-page">
    <PublicHeader />
    <main class="main-content">
      <HeroSection />
      <QuickActions />
      <InfoSection />
    </main>
    <PublicFooter />
    <FloatingChat />
  </div>
</template>

<script setup>
import PublicHeader from './components/PublicHeader.vue'
import HeroSection from './components/HeroSection.vue'
import QuickActions from './components/QuickActions.vue'
import InfoSection from './components/InfoSection.vue'
import PublicFooter from './components/PublicFooter.vue'
import FloatingChat from './components/FloatingChat.vue'
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(180deg, 
    #7eb88e 0%,
    #6ba87c 30%,
    #5a9669 60%,
    #4a7d58 100%);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>