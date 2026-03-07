<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title:       String,
  description: String,
  confirmText: String,
  type:        { type: String, default: 'default' },
  placeholder: { type: String, default: ' ' }
})

const emit = defineEmits(['close', 'submit'])

const inputValue       = ref('')
const selectedLayanan  = ref('')
const selectedTim      = ref('')
const selectedPrioritas = ref('')

const handleClose   = () => emit('close')
const submitHandler = () => {
  emit('submit', inputValue.value)
  inputValue.value = ''
}

const typeConfig = {
  reposisi: { accent: '#2eb86a', btnBg: 'linear-gradient(135deg,#2eb86a,#0f5c38)', icon: 'M4 4l3 8 3-8' },
  disposisi: { accent: '#3b82f6', btnBg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: '' },
  tolak:    { accent: '#ef4444', btnBg: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: '' },
}
const cfg = computed(() => typeConfig[props.type] || { accent: '#6b7280', btnBg: '#6b7280' })
</script>

<template>
  <teleport to="body">
    <div class="overlay" @click.self="handleClose">
      <div class="modal" :style="{ '--accent': cfg.accent }">

        <!-- Header -->
        <div class="modal__header">
          <div class="modal__icon" :style="{ background: cfg.btnBg }">
            <svg v-if="type === 'reposisi'" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M12 5l4 4-4 4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'disposisi'" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M4 8l5-5 5 5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'tolak'" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 5l8 8M13 5l-8 8" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h3 class="modal__title">{{ title }}</h3>
            <p class="modal__desc">{{ description }}</p>
          </div>
          <button class="modal__close" @click="handleClose">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="modal__body">

          <!-- Reposisi -->
          <div v-if="type === 'reposisi'" class="field">
            <label class="field__label">Pilih Layanan</label>
            <select v-model="selectedLayanan" class="field__select">
              <option disabled value="">Pilih layanan...</option>
              <option value="layanan1">Layanan 1</option>
              <option value="layanan2">Layanan 2</option>
            </select>
          </div>

          <!-- Disposisi -->
          <div v-if="type === 'disposisi'">
            <div class="field">
              <label class="field__label">Pilih Tim</label>
              <select v-model="selectedTim" class="field__select">
                <option disabled value="">Pilih tim...</option>
                <option value="tim1">Tim A</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Pilih Prioritas</label>
              <select v-model="selectedPrioritas" class="field__select">
                <option disabled value="">Pilih prioritas...</option>
                <option value="high">Tinggi</option>
                <option value="med">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
          </div>

          <!-- Textarea -->
          <div class="field">
            <label class="field__label">
              {{ type === 'tolak' ? 'Keterangan Penolakan' : 'Pesan / Keterangan' }}
            </label>
            <textarea v-model="inputValue" class="field__textarea"
              :placeholder="placeholder || 'Tuliskan keterangan...'" rows="4"></textarea>
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn-cancel" @click="handleClose">Batal</button>
          <button class="btn-confirm" :style="{ background: cfg.btnBg }" @click="submitHandler">
            {{ confirmText }}
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<style scoped>
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(2px);padding:1rem;}
.modal{--font:'Plus Jakarta Sans',sans-serif;font-family:var(--font);background:white;border-radius:18px;width:100%;max-width:520px;box-shadow:0 24px 60px rgba(0,0,0,.18);overflow:hidden;animation:popIn .2s cubic-bezier(0.16,1,0.3,1);}
@keyframes popIn{from{opacity:0;transform:scale(.94)translateY(8px);}to{opacity:1;transform:scale(1)translateY(0);}}
.modal__header{display:flex;align-items:flex-start;gap:.875rem;padding:1.375rem 1.375rem 0;position:relative;}
.modal__icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.modal__title{font-size:1rem;font-weight:800;color:#0d1a12;letter-spacing:-.01em;margin-bottom:.125rem;}
.modal__desc{font-size:.8125rem;color:#5a7566;margin:0;}
.modal__close{position:absolute;top:0;right:0;width:32px;height:32px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#b8ccc2;border-radius:8px;transition:background .15s,color .15s;}
.modal__close:hover{background:#f0f6f2;color:#0d1a12;}
.modal__body{padding:1.25rem 1.375rem;}
.field{margin-bottom:1rem;}
.field__label{display:block;font-size:.75rem;font-weight:700;color:#5a7566;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem;}
.field__select{width:100%;padding:.5rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--font);font-size:.875rem;color:#0d1a12;background:white;outline:none;transition:border-color .15s,box-shadow .15s;cursor:pointer;}
.field__select:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);}
.field__textarea{width:100%;padding:.625rem .75rem;border:1.5px solid rgba(168,200,180,.35);border-radius:9px;font-family:var(--font);font-size:.875rem;color:#0d1a12;background:white;resize:vertical;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box;}
.field__textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);}
.modal__footer{display:flex;justify-content:flex-end;gap:.625rem;padding:.875rem 1.375rem;border-top:1px solid #f0f6f2;}
.btn-cancel{padding:.5rem 1.125rem;background:#f0f6f2;border:1.5px solid rgba(168,200,180,.3);border-radius:9px;font-family:var(--font);font-size:.8125rem;font-weight:600;color:#5a7566;cursor:pointer;transition:all .15s;}
.btn-cancel:hover{background:#e8f4ee;color:#0f5c38;}
.btn-confirm{padding:.5rem 1.375rem;border:none;border-radius:9px;font-family:var(--font);font-size:.8125rem;font-weight:700;color:white;cursor:pointer;transition:opacity .15s;box-shadow:0 4px 12px rgba(0,0,0,.15);}
.btn-confirm:hover{opacity:.88;}
</style>