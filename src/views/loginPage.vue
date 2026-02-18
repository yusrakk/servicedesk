<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReCaptcha } from "vue-recaptcha-v3";
import axios from "axios";
import HelpdeskButton from "../components/HelpdeskButton.vue";

const router = useRouter();
const recaptcha = useReCaptcha();

const NIP = ref("");
const Password = ref("");
const isLoading = ref(false);
const passwordError = ref(false);
const NIPerror = ref(false);
const isEmpty = ref(false);
const isNonaktif = ref(false);

async function login() {
  isEmpty.value = false;
  NIPerror.value = false;
  passwordError.value = false;
  isNonaktif.value = false;
  isLoading.value = true;

  try {
    // Get reCAPTCHA token
    let recaptchaToken = null;
    try {
      recaptchaToken = await recaptcha?.executeRecaptcha("login");
    } catch (error) {
      console.warn("reCAPTCHA failed, continuing anyway:", error);
    }

    axios
      .post(
        "/api/user/login",
        {
          NIP: NIP.value,
          Password: Password.value,
          recaptcha_token: recaptchaToken,
        },
        {
          timeout: 10000, // 10 detik timeout
        },
      )
      .then((response) => {
        const token = response.data.token;
        const user = response.data.data_user;

        localStorage.setItem("Token", token);
        localStorage.setItem("user_id", user.ID_User);
        localStorage.setItem("nama_depan", user.Nama_Depan);
        localStorage.setItem("nama_belakang", user.Nama_Belakang);
        localStorage.setItem("src_gambar", user.Gambar_Path);
        localStorage.setItem("id_role", user.ID_Role);
        localStorage.setItem("nama_role", user.user_role.Nama_Role);

        const role = user.ID_Role;
        if (role === 1) router.push("/beranda");
        else if (role === 2) router.push("/beranda-Pengelola");
        else if (role === 3) router.push("/berandaUnit");
        else if (role === 4) router.push("/berandaTeknis");
        else if (role === 5) router.push("/berandaKD");
        else if (role === 6) router.push("/beranda-Pengelola");
      })
      .catch((error) => {
        isLoading.value = false;
        if (error.code === "ECONNABORTED") {
          alert("Timeout! Server terlalu lama merespon. Silakan coba lagi.");
          return;
        }
        if (error.response && error.response.status === 401) {
          passwordError.value = true;
        } else if (error.response && error.response.status === 404) {
          NIPerror.value = true;
        } else if (error.response && error.response.status === 422) {
          isEmpty.value = true;
        } else if (error.response && error.response.status === 403) {
          isNonaktif.value = true;
        } else if (error.response && error.response.status === 400) {
          alert("reCAPTCHA verification failed. Silakan coba lagi.");
        }
      });
  } catch (error) {
    isLoading.value = false;
    console.error("Login error:", error);
    alert("Terjadi kesalahan saat login. Silakan coba lagi.");
  }
}

onMounted(() => {
  const token = localStorage.getItem("Token");
  const role = parseInt(localStorage.getItem("id_role"));

  if (token) {
    if (role === 1) router.push("/beranda");
    else if (role === 2) router.push("/beranda-Pengelola");
    else if (role === 3) router.push("/BerandaUnit");
    else if (role === 4) router.push("/berandaTeknis");
    else if (role === 5) router.push("/berandaKD");
    else if (role === 6) router.push("/beranda-Pengelola");
  }
});
</script>

<template>
  
  <div class="container">
    <div class="flex-wrapper">
      <div class="buatLogo">
        <img src="/logo.svg" alt="Logo" class="logo-image" />
        <h2 class="title">SERVICE<br />DESK V3.0</h2>
      </div>

      <div class="login-box">
        <h2 class="loginTitle">Login</h2>
        <input
          class="placeholderLgn"
          v-model="NIP"
          type="text"
          placeholder="NIP"
        />
        <input
          class="placeholderLgn"
          v-model="Password"
          @keyup.enter="login"
          type="password"
          placeholder="Password"
        />
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container-login">
          <div class="loading-spinner-login"></div>
          <p>Mohon tunggu, sedang masuk...</p>
        </div>
        <button v-if="!isLoading" class="login" @click="login">Login</button>
        <div v-if="isEmpty" class="isEmpty">Harap isi NIP dan Password!</div>
        <div v-if="NIPerror" class="NotFound">NIP tidak ditemukan!</div>
        <div v-if="passwordError" class="NotFound">Password salah!</div>
        <div v-if="isNonaktif" class="NotFound">
          Akun Anda nonaktif, silahkan hubungi Pengelola!
        </div>

        <!-- Tombol Lacak Tiket -->
        <div class="lacak-section">
          <div class="lacak-divider"></div>
          <p class="lacak-text">Atau lacak tiket tanpa login</p>
          <button class="lacak-btn" @click="router.push('/lacak')">
            🔍 Lacak Tiket
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.isEmpty {
  background-color: #fff3cd; /* kuning lembut */
  color: #856404; /* teks kuning tua */
  border: 1px solid #ffeeba;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.NotFound {
  background-color: #f2babfa6; /* kuning lembut */
  color: #dc3545; /* teks kuning tua */
  border: 1px solid #ffeeba;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("/BG-login.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.flex-wrapper {
  display: flex;
  gap: 0rem;
}

.buatLogo {
  width: 200px;
  height: 355px;
  background-color: rgba(183, 197, 255, 0.7);
  padding: 5rem;
  border-top-left-radius: 40px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 40px;
  box-shadow: 0 10px 250px rgba(0, 0, 0, 0.1);
  color: black;
  backdrop-filter: blur(10px);
  align-items: center;
}

.logo-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-left: 2rem;
  margin-top: 5rem;
}

.title {
  margin-left: 3rem;
  margin-top: 0rem;
  line-height: 1.2;
}

.loginTitle {
  color: black;
  text-align: center;
  margin-bottom: 45px;
  margin-top: 100px;
  font-size: 48px;
  font-weight: bold;
}

.login-box {
  width: 300px;
  background-color: white;
  padding: 2rem;
  border-top-left-radius: 0px;
  border-top-right-radius: 40px;
  border-bottom-right-radius: 40px;
  border-bottom-left-radius: 0px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

input {
  display: block;
  align-items: center;
  width: 80%;
  margin: 1rem auto;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: left;
}

.login {
  background-color: #099d49;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  width: 40%;
  font-family: "Poppins";
  margin-bottom: 5%;
}

.placeholderLgn {
  background-color: white;
  color: black;
}

button:hover {
  background-color: #0dc95e;
}

p.error {
  margin-top: 1rem;
  font-weight: bold;
  color: #ef4444;
}

/* Loading */
.loading-container-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  width: 100%;
}

.loading-spinner-login {
  width: 30px;
  height: 30px;
  border: 4px solid #0d47a1;
  border-top: 4px solid #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Lacak Section */
/* .lacak-section {
  margin-top: 1rem;
  padding-top: 1.5rem;
} */

.lacak-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin-bottom: 1rem;
}

.lacak-text {
  color: #6b6b6b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.lacak-btn {
  background-color: #099d49;
  color: white;
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 75px;
  cursor: pointer;
  width: 100%;
  font-family: "Poppins";
  font-size: 0.9rem;
  transition: all 0.1s ease;
}

.lacak-btn:hover {
  background-color: #52ae6e;
  transform: scale(1.02);
}
</style>
