<template>
  <footer class="public-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4 class="footer-heading">Tentang Kami</h4>
          <p class="footer-text">
            Dinas Komunikasi dan Informatika Provinsi Jawa Barat
          </p>
          <p class="footer-text">
            Melayani kebutuhan IT seluruh OPD di Jawa Barat
          </p>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Layanan</h4>
          <ul class="footer-links">
            <li><a href="#">Pengaduan</a></li>
            <li><a href="#">Permintaan Layanan</a></li>
            <li><a href="#">Lacak Tiket</a></li>
            <li><a href="#">Panduan</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Kontak</h4>
          <ul class="footer-contact">
            <li>📧 servicedesk@diskominfo.jabarprov.go.id</li>
            <li>📞 (022) 2502898</li>
            <li>📍 Jl. Tamansari No.55, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132</li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Jam Layanan</h4>
          <p class="footer-text">Senin - Jumat</p>
          <p class="footer-text">08:00 - 16:00 WIB</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Diskominfo Provinsi Jawa Barat. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.public-footer {
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.9);
  padding: 48px 0 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-heading {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.footer-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #ffffff;
}

.footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-contact li {
  font-size: 14px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive */
@media (max-width: 968px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .footer-container {
    padding: 0 20px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>