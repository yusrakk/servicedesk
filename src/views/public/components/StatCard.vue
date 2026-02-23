<template>
  <div class="stat-card">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: String
})
</script>

<style scoped>
.stat-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}
</style>