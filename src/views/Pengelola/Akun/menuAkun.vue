<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API = "http://localhost:8000/api";

// =====================
// STATE
// =====================
const users = ref([]);
const userCount = ref(0);

const form = ref({
  Nama_Depan: "",
  Nama_Belakang: "",
  NIP: "",
  Password: "",
  ID_Role: "",
  ID_Jabatan: "",
  ID_Organisasi: "",
  Status: "Aktif",
});

// =====================
// FETCH DATA
// =====================
const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API}/user`);
    users.value = res.data;
  } catch (err) {
    console.error("Gagal ambil user:", err);
  }
};

const fetchUserCount = async () => {
  try {
    const res = await axios.get(`${API}/userCount`);
    userCount.value = res.data;
  } catch (err) {
    console.error("Gagal ambil jumlah user:", err);
  }
};

// =====================
// CREATE USER
// =====================
const createUser = async () => {
  try {
    await axios.post(`${API}/user`, form.value);

    resetForm();
    fetchUsers();
    fetchUserCount();
  } catch (err) {
    console.error("Gagal tambah user:", err);
  }
};

const resetForm = () => {
  form.value = {
    Nama_Depan: "",
    Nama_Belakang: "",
    NIP: "",
    Password: "",
    ID_Role: "",
    ID_Jabatan: "",
    ID_Organisasi: "",
    Status: "Aktif",
  };
};

// =====================
// DELETE (Nonaktif)
// =====================
const nonaktifkan = async (id) => {
  try {
    await axios.delete(`${API}/user/${id}`);
    fetchUsers();
    fetchUserCount();
  } catch (err) {
    console.error("Gagal nonaktifkan:", err);
  }
};

// =====================
// UNDO DELETE (Aktif)
// =====================
const aktifkan = async (id) => {
  try {
    await axios.delete(`${API}/user/undo/${id}`);
    fetchUsers();
    fetchUserCount();
  } catch (err) {
    console.error("Gagal aktifkan:", err);
  }
};

onMounted(() => {
  fetchUsers();
  fetchUserCount();
});
</script>

<template>
  <div class="container">
    <!-- DASHBOARD -->
    <section>
      <h2>Dashboard</h2>
      <p>
        Total User Aktif: <strong>{{ userCount }}</strong>
      </p>
    </section>

    <hr />

    <!-- FORM TAMBAH USER -->
    <section>
      <h2>Tambah User</h2>

      <div class="form-grid">
        <input v-model="form.Nama_Depan" placeholder="Nama Depan" />
        <input v-model="form.Nama_Belakang" placeholder="Nama Belakang" />
        <input v-model="form.NIP" placeholder="NIP" />
        <input v-model="form.Password" type="password" placeholder="Password" />
        <input v-model="form.ID_Role" placeholder="ID Role" />
        <input v-model="form.ID_Jabatan" placeholder="ID Jabatan" />
        <input v-model="form.ID_Organisasi" placeholder="ID Organisasi" />
      </div>

      <button @click="createUser">Simpan</button>
    </section>

    <hr />

    <!-- LIST USER -->
    <section>
      <h2>Daftar User</h2>

      <table border="1" cellpadding="8">
        <thead>
          <tr>
            <th>Nama</th>
            <th>NIP</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.ID_User">
            <td>{{ user.Nama_Depan }} {{ user.Nama_Belakang }}</td>
            <td>{{ user.NIP }}</td>
            <td>{{ user.Status }}</td>
            <td>
              <button @click="nonaktifkan(user.ID_User)">Nonaktif</button>
              <button @click="aktifkan(user.ID_User)">Aktif</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style>
.container {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 250px);
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}
</style>
