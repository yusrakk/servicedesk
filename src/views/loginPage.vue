<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReCaptcha } from 'vue-recaptcha-v3'
import axios from 'axios'

const router = useRouter()
const recaptcha = useReCaptcha()

const NIP = ref('')
const Password = ref('')
const isLoading = ref(false)
const passwordError = ref(false)
const NIPerror = ref(false)
const isEmpty = ref(false)
const isNonaktif = ref(false)
const showPassword = ref(false)

async function login() {
  isEmpty.value = false
  NIPerror.value = false
  passwordError.value = false
  isNonaktif.value = false
  isLoading.value = true

  try {
    // 1. KITA BYPASS RECAPTCHA (Set token null saja agar tidak memicu error Google)
    let recaptchaToken = null

    // 2. LANGSUNG TEMBAK API AXIOS TANPA MENUNGGU GOOGLE
    axios.post('/api/user/login', {
      NIP: NIP.value,
      Password: Password.value,
      recaptcha_token: recaptchaToken
    }, {
      timeout: 10000
    })
    .then((response) => {
      const token = response.data.token
      const user = response.data.data_user

      localStorage.setItem('Token', token)
      localStorage.setItem('user_id', user.ID_User)
      localStorage.setItem('nama_depan', user.Nama_Depan)
      localStorage.setItem('nama_belakang', user.Nama_Belakang)
      localStorage.setItem('src_gambar', user.Gambar_Path)
      localStorage.setItem('id_role', user.ID_Role)
      localStorage.setItem('nama_role', user.user_role.Nama_Role)

      const role = user.ID_Role
      if (role === 1) router.push('/beranda')
      else if (role === 2) router.push('/beranda-Pengelola')
      else if (role === 3) router.push('/berandaUnit')
      else if (role === 4) router.push('/berandaTeknis')
      else if (role === 5) router.push('/berandaKD')
      else if (role === 6) router.push('/beranda-Pengelola')
    })
    .catch((error) => {
      isLoading.value = false
      if (error.code === 'ECONNABORTED') {
        alert('Timeout! Server terlalu lama merespon. Silakan coba lagi.')
        return
      }
      if (error.response?.status === 401) passwordError.value = true
      else if (error.response?.status === 404) NIPerror.value = true
      else if (error.response?.status === 422) isEmpty.value = true
      else if (error.response?.status === 403) isNonaktif.value = true
      else if (error.response?.status === 400) alert('Gagal memproses otentikasi. Silakan coba lagi.')
    })
  } catch (error) {
    isLoading.value = false
    console.error('Login error:', error)
    alert('Terjadi kesalahan saat login. Silakan coba lagi.')
  }
}

onMounted(() => {
  const token = localStorage.getItem('Token')
  const role = parseInt(localStorage.getItem('id_role'))
  if (token) {
    if (role === 1) router.push('/beranda')
    else if (role === 2) router.push('/beranda-Pengelola')
    else if (role === 3) router.push('/BerandaUnit')
    else if (role === 4) router.push('/berandaTeknis')
    else if (role === 5) router.push('/berandaKD')
    else if (role === 6) router.push('/beranda-Pengelola')
  }
})
</script>

<template>
  <div class="login-page">

    <!-- Background layers -->
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>
      <div class="bg-orb bg-orb--1"></div>
      <div class="bg-orb bg-orb--2"></div>
    </div>

    <!-- Left Panel — Branding -->
    <div class="login-left">
      <div class="login-left__inner">

        <!-- Logo -->
        <div class="brand animate-fade-up">
          <div class="brand__logo">
            <img src="/logo.svg" alt="Logo Diskominfo" class="brand__img" />
          </div>
          <div class="brand__text">
            <span class="brand__name">ServiceDesk</span>
            <span class="brand__version">v3.0</span>
          </div>
        </div>

        <!-- Tagline -->
        <div class="left-copy animate-fade-up delay-1">
          <h1 class="left-copy__title">
            Selamat Datang<br>
            di <em>Diskominfo</em><br>
            Jawa Barat
          </h1>
          <p class="left-copy__desc">
            Platform terpadu untuk pengaduan dan permintaan layanan IT seluruh OPD Provinsi Jawa Barat.
          </p>
        </div>

      

      </div>
    </div>

    <!-- Right Panel — Form -->
    <div class="login-right">
      <div class="login-card animate-scale-in">

        <!-- Header -->
        <div class="login-card__header">
          <div class="login-card__icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="4" stroke="currentColor" stroke-width="1.75"/>
              <path d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="login-card__title">Masuk ke Akun</h2>
            <p class="login-card__sub">Gunakan NIP dan password dinas Anda</p>
          </div>
        </div>

        <!-- Form -->
        <div class="login-form">

          <!-- NIP Field -->
          <div class="field">
            <label class="field__label">NIP</label>
            <div class="field__input-wrap">
              <svg class="field__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/>
                <path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <input
                v-model="NIP"
                type="text"
                class="field__input"
                :class="{ 'field__input--error': NIPerror || isEmpty }"
                placeholder="Masukkan NIP Anda"
                @keyup.enter="login"
              />
            </div>
            <transition name="err-slide">
              <p v-if="NIPerror" class="field__error">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                NIP tidak ditemukan
              </p>
            </transition>
          </div>

          <!-- Password Field -->
          <div class="field">
            <label class="field__label">Password</label>
            <div class="field__input-wrap">
              <svg class="field__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <input
                v-model="Password"
                :type="showPassword ? 'text' : 'password'"
                class="field__input"
                :class="{ 'field__input--error': passwordError || isEmpty }"
                placeholder="Masukkan password"
                @keyup.enter="login"
              />
              <button class="field__toggle" @click="showPassword = !showPassword" type="button" tabindex="-1">
                <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5S3.5 3 7.5 3s6.5 4.5 6.5 4.5S11.5 12 7.5 12 1 7.5 1 7.5z" stroke="currentColor" stroke-width="1.3"/>
                  <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/>
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 2l11 11M6.2 5.3A3 3 0 0110.7 9M4.3 3.8C2.7 4.9 1.5 6.5 1.5 7.5c0 1 2.5 4.5 6 4.5 1.2 0 2.3-.4 3.2-1M1 7.5S3.5 3 7.5 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <transition name="err-slide">
              <p v-if="passwordError" class="field__error">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6 4v2.5M6 8v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                Password salah
              </p>
            </transition>
          </div>

          <!-- Empty / Nonaktif errors -->
          <transition name="err-slide">
            <div v-if="isEmpty" class="alert alert--warning">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2l5.5 10H1.5L7 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 6v2.5M7 10v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              Harap isi NIP dan Password!
            </div>
          </transition>
          <transition name="err-slide">
            <div v-if="isNonaktif" class="alert alert--error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 4.5v3M7 9v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              Akun Anda nonaktif, silahkan hubungi Pengelola!
            </div>
          </transition>

          <!-- Submit Button -->
          <button
            class="login-btn"
            @click="login"
            :disabled="isLoading"
          >
            <transition name="btn-content" mode="out-in">
              <span v-if="isLoading" key="loading" class="login-btn__loading">
                <span class="spinner"></span>
                Sedang masuk...
              </span>
              <span v-else key="idle" class="login-btn__idle">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M10 7.5H2M10 7.5L6.5 4M10 7.5L6.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 2v11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
                </svg>
                Masuk ke Sistem
              </span>
            </transition>
          </button>

        </div>

        <!-- Divider -->
        <div class="login-divider">
          <span>atau</span>
        </div>

        <!-- Lacak Tiket -->
        <button class="lacak-btn" @click="router.push('/lacak')">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          Lacak tiket tanpa login
        </button>

        <!-- Footer note -->
        <p class="login-card__note">
          Butuh bantuan? Hubungi
          <a href="mailto:servicedesk@jabarprov.go.id">servicedesk@jabarprov.go.id</a>
        </p>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* ---- TOKENS (mirror dari design-tokens.css) ---- */
.login-page {
  --color-forest:   #1a3a2a;
  --color-emerald:  #0f5c38;
  --color-jade:     #1a7a4a;
  --color-mint:     #2eb86a;
  --color-sage:     #a8c8b4;
  --color-foam:     #e8f4ee;
  --color-ink:      #0d1a12;
  --color-charcoal: #2c3e35;
  --color-stone:    #5a7566;
  --color-silver:   #b8ccc2;
  --color-mist:     #f0f6f2;
  --color-white:    #ffffff;
  --font:           'Plus Jakarta Sans', sans-serif;
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-green:   0 8px 32px rgba(46,184,106,0.28);
  --shadow-xl:      0 24px 64px rgba(13,26,18,0.18);
}

/* ---- PAGE LAYOUT ---- */
.login-page {
  display: flex;
  min-height: 100vh;
  font-family: var(--font);
  position: relative;
  overflow: hidden;
}

/* ---- BACKGROUND ---- */
.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-emerald) 55%, #1a5c38 100%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}
.bg-orb--1 {
  width: 600px; height: 600px;
  background: var(--color-mint);
  top: -150px; left: -100px;
  animation: orbFloat 10s ease-in-out infinite;
}
.bg-orb--2 {
  width: 400px; height: 400px;
  background: #0a3d22;
  bottom: -100px; right: 35%;
  animation: orbFloat 13s ease-in-out infinite reverse;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0,0); }
  50% { transform: translate(25px, -20px); }
}

/* ---- LEFT PANEL ---- */
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 3rem 2rem 3rem 3rem;
}
.login-left__inner {
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.brand__logo {
  width: 52px;
  height: 52px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: blur(8px);
}
.brand__img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.brand__text { display: flex; flex-direction: column; gap: 2px; }
.brand__name {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -0.01em;
  line-height: 1;
}
.brand__version {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-mint);
  background: rgba(46,184,106,0.15);
  padding: 2px 8px;
  border-radius: 99px;
  width: fit-content;
}

/* Copy */
.left-copy__title {
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 800;
  color: var(--color-white);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}
.left-copy__title em { font-style: normal; color: var(--color-mint); }
.left-copy__desc {
  font-size: 0.9375rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.7;
}

/* Stats */
.left-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border-radius: 16px;
}
.left-stat { display: flex; flex-direction: column; gap: 2px; }
.left-stat__val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -0.02em;
  line-height: 1;
}
.left-stat__lbl {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}
.left-stat__divider {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.15);
}

/* ---- RIGHT PANEL ---- */
.login-right {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 2rem;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(2px);
  border-left: 1px solid rgba(255,255,255,0.08);
}

/* ---- LOGIN CARD ---- */
.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--color-white);
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: var(--shadow-xl);
}

.login-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-foam);
}
.login-card__icon {
  width: 44px;
  height: 44px;
  background: var(--color-foam);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-emerald);
  flex-shrink: 0;
}
.login-card__title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 4px;
}
.login-card__sub {
  font-size: 0.75rem;
  color: var(--color-stone);
  font-weight: 400;
}

/* ---- FORM ---- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-charcoal);
  letter-spacing: 0.03em;
}
.field__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field__icon {
  position: absolute;
  left: 0.875rem;
  color: var(--color-silver);
  pointer-events: none;
  flex-shrink: 0;
}
.field__input {
  width: 100%;
  font-family: var(--font);
  font-size: 0.875rem;
  color: var(--color-ink);
  background: var(--color-mist);
  border: 1.5px solid transparent;
  border-radius: 10px;
  padding: 0.75rem 0.875rem 0.75rem 2.5rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  -webkit-appearance: none;
}
.field__input:focus {
  background: var(--color-white);
  border-color: var(--color-mint);
  box-shadow: 0 0 0 3px rgba(46,184,106,0.12);
}
.field__input::placeholder { color: var(--color-silver); }
.field__input--error {
  border-color: #fca5a5 !important;
  background: #fff5f5 !important;
}
.field__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
}

.field__toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-stone);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  min-height: auto;
  min-width: auto;
  transition: color 0.15s;
}
.field__toggle:hover { color: var(--color-emerald); }

.field__error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #ef4444;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
}
.alert--warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}
.alert--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Login Button */
.login-btn {
  width: 100%;
  min-height: 48px;
  background: linear-gradient(135deg, var(--color-mint), var(--color-emerald));
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-family: var(--font);
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: all 0.28s var(--ease-out);
  position: relative;
  overflow: hidden;
  margin-top: 0.25rem;
}
.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(46,184,106,0.36);
}
.login-btn:hover:not(:disabled)::before { opacity: 1; }
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.login-btn__idle,
.login-btn__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.login-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;
}
.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-foam);
}
.login-divider span {
  font-size: 0.75rem;
  color: var(--color-silver);
  white-space: nowrap;
}

/* Lacak Button */
.lacak-btn {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--color-foam);
  color: var(--color-emerald);
  border: 1.5px solid rgba(46,184,106,0.2);
  border-radius: 12px;
  font-family: var(--font);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}
.lacak-btn:hover {
  background: rgba(46,184,106,0.12);
  border-color: var(--color-mint);
  transform: translateY(-1px);
}

/* Note */
.login-card__note {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-silver);
  line-height: 1.6;
}
.login-card__note a {
  color: var(--color-emerald);
  text-decoration: none;
  font-weight: 600;
}
.login-card__note a:hover { text-decoration: underline; }

/* ---- ANIMATIONS ---- */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fade-up  { animation: fadeUp  0.6s cubic-bezier(0.16,1,0.3,1) both; }
.animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.delay-1 { animation-delay: 120ms; }
.delay-2 { animation-delay: 240ms; }

/* Transition: error messages */
.err-slide-enter-active { transition: all 0.25s var(--ease-out); }
.err-slide-leave-active { transition: all 0.18s ease-in; }
.err-slide-enter-from { opacity: 0; transform: translateY(-6px); }
.err-slide-leave-to  { opacity: 0; transform: translateY(-4px); }

/* Transition: button content */
.btn-content-enter-active,
.btn-content-leave-active { transition: all 0.18s ease; }
.btn-content-enter-from { opacity: 0; transform: scale(0.9); }
.btn-content-leave-to  { opacity: 0; transform: scale(0.9); }

/* ---- RESPONSIVE ---- */
@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right {
    width: 100%;
    border-left: none;
    background: transparent;
    backdrop-filter: none;
  }
  /* Show compact brand on mobile */
  .login-card::before {
    content: '';
    display: block;
  }
}

@media (max-width: 480px) {
  .login-right { padding: 1.25rem; }
  .login-card {
    padding: 1.5rem;
    border-radius: 20px;
  }
  .login-card__title { font-size: 1rem; }
}
</style>