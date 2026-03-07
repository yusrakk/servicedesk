<template>
  <div class="lacak-page">
    <div class="lacak-hero">
      <div class="container">
        <span class="section-label" style="color: rgba(255,255,255,0.7)">
          Layanan Tiket
        </span>
        <h1 class="lacak-hero__title">Lacak Tiket Anda</h1>
        <p class="lacak-hero__sub">Masukkan nomor tiket untuk melihat status terkini pengaduan atau permintaan Anda.</p>
      </div>
    </div>

    <div class="container lacak-content">
      <!-- Search Card -->
      <div class="lacak-search card">
        <div class="lacak-search__inner">
          <div class="form-group">
            <label class="form-label">Nomor Tiket</label>
            <div class="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                v-model="ticketId"
                class="input input--with-icon"
                placeholder="Contoh: TKT-2025-001234"
                @keyup.enter="search"
              />
            </div>
          </div>
          <button class="btn btn-primary btn--lg" @click="search" :disabled="loading || !ticketId.trim()">
            <span v-if="loading" class="spinner"></span>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ loading ? 'Mencari...' : 'Lacak Tiket' }}
          </button>
        </div>

        <div v-if="error" class="lacak-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#ef4444" stroke-width="1.5"/><path d="M8 5v3.5M8 10.5v.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/></svg>
          {{ error }}
        </div>
      </div>

      <!-- Result -->
      <transition name="result-slide">
        <div v-if="result" class="lacak-result">
          <!-- Status Header -->
          <div class="result-header" :class="`result-header--${result.statusKey}`">
            <div class="result-header__status">
              <div class="result-status-icon">
                <component :is="statusIcon(result.statusKey)" />
              </div>
              <div>
                <p class="result-status-label">Status Tiket</p>
                <p class="result-status-value">{{ result.status }}</p>
              </div>
            </div>
            <div class="result-header__id">{{ result.id }}</div>
          </div>

          <!-- Details Grid -->
          <div class="result-details card">
            <div class="result-grid">
              <div v-for="field in result.fields" :key="field.key" class="result-field">
                <span class="result-field__label">{{ field.label }}</span>
                <span class="result-field__value">{{ field.value }}</span>
              </div>
            </div>

            <!-- Timeline -->
            <div class="result-timeline" v-if="result.timeline?.length">
              <h4 class="result-timeline__heading">Riwayat</h4>
              <div class="timeline">
                <div v-for="(item, i) in result.timeline" :key="i" class="timeline-item"
                  :class="{ 'timeline-item--active': i === 0 }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-body">
                    <p class="timeline-text">{{ item.text }}</p>
                    <p class="timeline-time">{{ item.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Empty State -->
      <div v-if="!result && !loading && searched" class="lacak-empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="18" cy="18" r="13" stroke="var(--color-silver)" stroke-width="2"/>
            <path d="M28 28l8 8" stroke="var(--color-silver)" stroke-width="2" stroke-linecap="round"/>
            <path d="M13 18h10M18 13v10" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <h3>Tiket tidak ditemukan</h3>
        <p>Pastikan nomor tiket yang Anda masukkan sudah benar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'

const ticketId = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const searched = ref(false)

const IconPending = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
  h('circle', { cx: '10', cy: '10', r: '8', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M10 6v4l3 3', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' })
])
const IconDone = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
  h('circle', { cx: '10', cy: '10', r: '8', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M6.5 10l2.5 2.5 5-5', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])
const IconProcess = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
  h('circle', { cx: '10', cy: '10', r: '8', stroke: 'currentColor', 'stroke-width': '1.75' }),
  h('path', { d: 'M10 6v4', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round' }),
  h('circle', { cx: '10', cy: '13.5', r: '1', fill: 'currentColor' })
])

const statusIcon = (key) => {
  if (key === 'done') return IconDone
  if (key === 'process') return IconProcess
  return IconPending
}

const search = async () => {
  if (!ticketId.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  searched.value = true

  await new Promise(r => setTimeout(r, 900))

  // Mock data
  if (ticketId.value.trim().toUpperCase().startsWith('TKT')) {
    result.value = {
      id: ticketId.value.trim().toUpperCase(),
      status: 'Sedang Diproses',
      statusKey: 'process',
      fields: [
        { key: 'category', label: 'Kategori', value: 'Permintaan Layanan' },
        { key: 'subject', label: 'Subjek', value: 'Pengajuan akun email dinas baru' },
        { key: 'created', label: 'Dibuat', value: '20 Feb 2025, 09:14 WIB' },
        { key: 'updated', label: 'Diperbarui', value: '22 Feb 2025, 14:32 WIB' },
        { key: 'assignee', label: 'Ditangani oleh', value: 'Tim Layanan TIK' },
        { key: 'priority', label: 'Prioritas', value: 'Normal' },
      ],
      timeline: [
        { text: 'Tiket diterima tim teknis dan sedang dalam proses penanganan.', time: '22 Feb 2025, 14:32' },
        { text: 'Tiket telah diverifikasi dan diteruskan ke tim terkait.', time: '21 Feb 2025, 10:05' },
        { text: 'Tiket berhasil dibuat.', time: '20 Feb 2025, 09:14' },
      ]
    }
  } else {
    error.value = 'Nomor tiket tidak ditemukan. Periksa kembali penulisan nomor tiket Anda.'
  }

  loading.value = false
}
</script>

<style scoped>
.lacak-page { min-height: 100vh; }

.lacak-hero {
  background: linear-gradient(135deg, var(--color-forest), var(--color-emerald));
  padding: calc(68px + var(--space-12)) 0 var(--space-12);
  color: white;
}
.lacak-hero__title {
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
  font-weight: 800;
  letter-spacing: -0.03em;
  color: white;
  margin: var(--space-3) 0 var(--space-4);
}
.lacak-hero__sub {
  font-size: var(--text-lg);
  color: rgba(255,255,255,0.65);
  max-width: 520px;
  line-height: 1.6;
}

.lacak-content {
  padding-top: var(--space-10);
  padding-bottom: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.lacak-search {
  padding: var(--space-6);
}
.lacak-search__inner {
  display: flex;
  gap: var(--space-4);
  align-items: flex-end;
}
.form-group { flex: 1; }
.form-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-charcoal);
  letter-spacing: 0.03em;
  margin-bottom: var(--space-2);
}
.input-with-icon { position: relative; }
.input-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-silver);
  pointer-events: none;
}
.input--with-icon { padding-left: calc(var(--space-3) + 16px + var(--space-2)); }

.lacak-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: #ef4444;
  background: #fef2f2;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid #fecaca;
}

/* Result */
.result-header {
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.result-header--process { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; }
.result-header--done    { background: linear-gradient(135deg, var(--color-foam), #d1fae5); border: 1px solid #a7f3d0; }
.result-header--pending { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; }

.result-header__status { display: flex; align-items: center; gap: var(--space-4); }
.result-status-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.result-header--process .result-status-icon { background: #fde68a; color: #92400e; }
.result-header--done    .result-status-icon { background: #a7f3d0; color: #065f46; }
.result-header--pending .result-status-icon { background: #bfdbfe; color: #1e40af; }

.result-status-label { font-size: var(--text-xs); color: var(--color-stone); font-weight: 500; }
.result-status-value { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--color-ink); }

.result-header__id {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-stone);
  background: rgba(255,255,255,0.7);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
}

.result-details { padding: var(--space-6); }
.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-foam);
  margin-bottom: var(--space-6);
}
.result-field__label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-stone);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: var(--space-1);
}
.result-field__value {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-ink);
  font-weight: 500;
}

/* Timeline */
.result-timeline__heading {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-5);
}
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item {
  display: flex;
  gap: var(--space-4);
  position: relative;
  padding-bottom: var(--space-5);
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: 0;
  width: 1px;
  background: var(--color-foam);
}
.timeline-item:last-child::before { display: none; }
.timeline-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid var(--color-silver);
  background: white;
  flex-shrink: 0;
  margin-top: 4px;
  transition: border-color var(--duration-normal), background var(--duration-normal);
}
.timeline-item--active .timeline-dot {
  border-color: var(--color-mint);
  background: var(--color-mint);
}
.timeline-text { font-size: var(--text-sm); color: var(--color-charcoal); line-height: 1.5; }
.timeline-time { font-size: var(--text-xs); color: var(--color-stone); margin-top: 4px; }

/* Empty State */
.lacak-empty {
  text-align: center;
  padding: var(--space-16) 0;
}
.empty-icon {
  width: 72px;
  height: 72px;
  background: var(--color-foam);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-5);
}
.lacak-empty h3 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-2);
}
.lacak-empty p { font-size: var(--text-sm); color: var(--color-stone); }

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transition */
.result-slide-enter-active { animation: fadeUp 0.4s var(--ease-out) both; }
.result-slide-leave-active { animation: fadeUp 0.3s var(--ease-in-out) reverse both; }

@media (max-width: 768px) {
  .lacak-search__inner { flex-direction: column; }
  .btn--lg { width: 100%; justify-content: center; }
  .result-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .result-grid { grid-template-columns: 1fr; }
}
</style>
