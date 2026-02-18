
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  confirmText: String,
  type: { type: String, default: "default" },
  placeholder: { type: String, default: " " }
})

const emit = defineEmits(["close", "submit"])

const inputValue = ref("")

const handleClose = () => {
  console.log("Batal diklik") // Debug
  emit("close")
}

const submitHandler = () => {
  console.log("Submit diklik, value:", inputValue.value) // Debug
  emit("submit", inputValue.value)
  inputValue.value = ""
}

const confirmClass = computed(() => ({
  'green-btn': props.type === 'reposisi',
  'blue-btn': props.type === 'disposisi',
  'red-btn': props.type === 'tolak'
}))

const selectedLayanan = ref('')
const selectedTim = ref('')
const selectedPrioritas = ref('')

</script>




<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      
      <div v-if="type === 'reposisi'">
        <label>Pilih Layanan</label>
          <select v-model="selectedLayanan" class="modal-select">
            <option disabled value="">Pilih layanan</option>
            <option value="layanan1">Layanan 1</option>
            <option value="layanan2">Layanan 2</option>
          </select>
      </div>

      <div v-if="type === 'disposisi'">
        <label>Pilih Tim</label>
        <select v-model="selectedTim" class="modal-select">
          <option disabled value="">Pilih tim</option>
          <option value="tim1">Tim A</option>
        </select>
        <label>Pilih Prioritas</label>
          <select v-model="selectedPrioritas" class="modal-select">
          <option disabled value="">Pilih Prioritas</option>
          <option value="high">tinggi</option>
        </select>
      </div>

      <textarea 
        v-model="inputValue"
        class="modal-input"
        :placeholder="placeholder"
      ></textarea>
      <div class="modal-buttons">
        <button 
          class="btn-cancel" 
          @click="handleClose"
          @mousedown="console.log('mousedown')"
          @mouseup="console.log('mouseup')"
        >
          Batal
        </button>

        <button 
          class="btn-confirm"
          :class="confirmClass"
          @click="submitHandler"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: white;
  width: 530px;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1000;
}

.modal-input {
  width: 95%;
  height: 100px;
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel,
.btn-confirm {
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #ddd;
  color: #333;
}

.btn-cancel:hover {
  background: #ccc;
}

.btn-confirm {
  color: white;
}

.green-btn {
  background: #22c55e;
}

.green-btn:hover {
  background: #16a34a;
}

.blue-btn {
  background: #3b82f6;
}

.blue-btn:hover {
  background: #2563eb;
}

.red-btn {
  background: #ef4444;
}

.red-btn:hover {
  background: #dc2626;
}

label {
  display: block;
}

.modal-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151; /* abu gelap */
}

.modal-select {
  width: 100%;
  height: 42px;
  margin-bottom: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #f9fafb;
  font-size: 14px;
}

</style>