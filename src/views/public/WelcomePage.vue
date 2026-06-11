<template>
  <div class="welcome-page">
    <PublicHeader />
    <HeroSection />

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container faq-inner">
        <div class="faq-left">
          <span class="section-label">FAQ</span>
          <h2 class="section-heading">Pertanyaan<br>yang Sering Ditanya</h2>
          <p class="faq-desc">
            Tidak menemukan jawaban yang dicari? Hubungi tim helpdesk kami.
          </p>
          <a href="/kontak" class="btn btn-ghost" style="margin-top: var(--space-6)">
            Hubungi Kami
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
        <div class="faq-right">
          <FaqItem
            v-for="(faq, i) in faqs"
            :key="i"
            :question="faq.q"
            :answer="faq.a"
          />
        </div>
      </div>
    </section>

    <PublicFooter />
    <FloatingChat />
  </div>
</template>

<script setup>
import PublicHeader  from './components/PublicHeader.vue'
import HeroSection   from './components/HeroSection.vue'
import FaqItem       from './components/FaqItem.vue'
import PublicFooter  from './components/PublicFooter.vue'
import FloatingChat  from './components/FloatingChat.vue'

const faqs = [
  {
    q: 'Bagaimana cara mengajukan tiket pengaduan?',
    a: 'Login ke sistem menggunakan akun SSO dinas Anda, pilih menu "Pengaduan", isi formulir dengan jelas termasuk kategori masalah, deskripsi, dan lampiran jika diperlukan, lalu klik "Submit". Nomor tiket akan dikirimkan melalui email.',
  },
  {
    q: 'Berapa lama waktu penyelesaian permintaan?',
    a: 'Tergantung jenis dan prioritas permintaan. Secara umum, pengaduan kritis ditangani dalam 1 hari kerja, permintaan normal 3-5 hari kerja. Status dapat dipantau secara real-time melalui fitur Lacak Tiket.',
  },
  {
    q: 'Siapa yang bisa menggunakan layanan ini?',
    a: 'Seluruh pegawai OPD Provinsi Jawa Barat yang terdaftar. Akun dibuat secara otomatis berdasarkan data kepegawaian. Jika belum memiliki akses, hubungi admin Diskominfo melalui email atau telepon yang tertera.',
  },
  {
    q: 'Bisakah saya melacak tiket tanpa login?',
    a: 'Ya, Anda dapat melacak status tiket menggunakan nomor tiket tanpa perlu login. Cukup masukkan nomor tiket di halaman utama atau menu "Lacak Tiket". Untuk detail lebih lengkap dan riwayat komunikasi, login diperlukan.',
  },
]
</script>

<style scoped>
.welcome-page { min-height: 100vh; }

/* FAQ */
.faq-section {
  padding: var(--space-24) 0;
  background: var(--color-mist);
  background-image: radial-gradient(circle, rgba(46,184,106,0.1) 1px, transparent 1px);
  background-size: 28px 28px;
  position: relative;
}
.faq-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(46,184,106,0.3), transparent);
}
.faq-inner {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: var(--space-16);
  align-items: start;
}
.faq-left { position: sticky; top: calc(68px + var(--space-8)); }
.faq-desc {
  font-size: var(--text-sm);
  color: var(--color-stone);
  line-height: 1.7;
  margin-top: var(--space-4);
  max-width: 260px;
}
.faq-right {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(168,200,180,0.2);
}

/* FAQ faq-right strengthened */
.faq-right {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-6);
  box-shadow: 0 4px 24px rgba(13,26,18,0.08);
  border: 1.5px solid rgba(46,184,106,0.15);
}

@media (max-width: 1024px) {
  .faq-inner { grid-template-columns: 1fr; }
  .faq-left { position: static; }
  .faq-desc { max-width: none; }
}

@media (max-width: 768px) {
  .faq-section { padding: var(--space-16) 0; }
}

@media (max-width: 480px) {
  .faq-section { padding: var(--space-12) 0; }
}
</style>