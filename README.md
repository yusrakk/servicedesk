# Servicedesk - Frontend (Antarmuka Pengguna)

Servicedesk adalah aplikasi portal layanan teknologi informasi milik Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Aplikasi ini dirancang untuk memfasilitasi instansi dan organisasi di bawah naungan Pemerintah Provinsi Jawa Barat dalam mengajukan serta memantau berbagai permintaan layanan teknologi informasi secara terintegrasi dan efisien.


## Teknologi Utama

* **Bahasa Pemrograman**: JavaScript
* **Framework Utama**: Vue 3 (Composition API)
* **Build Tool & Dev Server**: Vite

## Panduan Instalasi dan Menjalankan Aplikasi

### Menjalankan Secara Lokal (Development)

Pastikan Node.js (versi 22 ke atas direkomendasikan) telah terpasang di komputer Anda.

1. Buka direktori frontend:
   ```bash
   cd frontend
   ```

2. Pasang semua dependensi proyek:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

4. Akses aplikasi melalui peramban di alamat:
   ```text
   http://localhost:1234
   ```

### Menjalankan Menggunakan Docker

Pastikan Docker Desktop dan Docker Compose sudah terpasang dan berjalan di sistem Anda.

1. Buka direktori frontend:
   ```bash
   cd frontend
   ```

2. Jalankan container Docker:
   ```bash
   docker compose up -d
   ```

3. Anda dapat mengakses aplikasi melalui port berikut:
   * **Mode Development (Hot Reload)**: `http://localhost:1234`
   * **Mode Production (Served by Nginx)**: `http://localhost:3000`
# servicedesk-be
