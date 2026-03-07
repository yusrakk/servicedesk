<template>
  <footer class="footer">
    <div class="footer__top">
      <div class="container footer__top-inner">
        <!-- Brand -->
        <div class="footer__brand">
          <a href="/" class="footer__logo">
            <div class="logo-mark">
              <img src="/LogoServiceDesk.svg" alt="Logo ServiceDesk" class="logo-img" />
            </div>
            <div>
              <span class="logo-title">ServiceDesk</span>
              <span class="logo-sub">Diskominfo Jawa Barat</span>
            </div>
          </a>
          <p class="footer__brand-desc">
            Platform terpadu untuk pengaduan dan permintaan layanan IT seluruh OPD Provinsi Jawa Barat.
          </p>
          <div class="footer__social">
            <a href="#" class="social-link" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M15 2s-1.1.7-1.8.9A2.7 2.7 0 008.4 5.4 7.7 7.7 0 012 2S.6 5 2.7 6.8A2.7 2.7 0 011 6.4c0 1.8 1.2 3.3 2.9 3.6-.5.1-1 .1-1.4 0 .4 1.4 1.7 2.4 3.2 2.4A7.7 7.7 0 011 13.7a10.8 10.8 0 005.7 1.7c6.8 0 10.5-5.6 10.5-10.5V4.3C14 3.7 14.6 3 15 2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3.5" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.4"/><circle cx="11.5" cy="4.5" r=".75" fill="currentColor"/></svg>
            </a>
            <a href="#" class="social-link" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/></svg>
            </a>
          </div>
        </div>

        <!-- Links -->
        <div class="footer__links">
          <div class="footer__col">
            <h4 class="footer__col-heading">Layanan</h4>
            <ul>
              <li><a href="/pengaduan" class="footer__link">Pengaduan</a></li>
              <li><a href="/layanan" class="footer__link">Permintaan Layanan</a></li>
              <li><a href="/lacak" class="footer__link">Lacak Tiket</a></li>
              <li><a href="/panduan" class="footer__link">Panduan</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 class="footer__col-heading">Kontak</h4>
            <ul>
              <li>
                <a href="mailto:servicedesk@jabarprov.go.id" class="footer__link footer__link--icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 4.5l6 4 6-4" stroke="currentColor" stroke-width="1.3"/></svg>
                  servicedesk@jabarprov.go.id
                </a>
              </li>
              <li>
                <a href="tel:02220235678" class="footer__link footer__link--icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 9.5c-.4 1-1.4 1.5-2.5 1C7 9.5 4.5 7 3.5 4.5c-.5-1 0-2.1 1-2.5l.5-.2 1.5 2.5-.5.5C5.5 5 5 5.5 5.3 6.2 5.8 7.2 6.8 8.2 7.8 8.7c.7.3 1.2-.2 1.4-.7l.5-.5 2.5 1.5-.2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  (022) 2023-5678
                </a>
              </li>
              <li>
                <span class="footer__link footer__link--icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 3.5 4.5 6.5 4.5 6.5S11.5 9.5 11.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
                  Jl. Tamansari No. 55, Bandung 40132
                </span>
              </li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 class="footer__col-heading">Jam Layanan</h4>
            <ul>
              <li><span class="footer__link">Senin – Jumat</span></li>
              <li><span class="footer__time">08:00 – 16:00 WIB</span></li>
              <li style="margin-top:0.75rem"><span class="footer__link footer__link--muted">Sabtu & Minggu</span></li>
              <li><span class="footer__time footer__time--off">Libur</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>© {{ year }} Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Hak cipta dilindungi.</p>
        <div class="footer__bottom-links">
          <a href="/privasi" class="footer__bottom-link">Kebijakan Privasi</a>
          <span>·</span>
          <a href="/syarat" class="footer__bottom-link">Syarat & Ketentuan</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--color-forest);
  color: rgba(255,255,255,0.75);
}

.footer__top { padding: var(--space-16) 0 var(--space-12); }
.footer__top-inner {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-16);
}

/* Brand */
.footer__brand {}
.footer__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  margin-bottom: var(--space-5);
}
.logo-img {
  height: 34px; 
  width: auto;
  display: block;
}

.logo-mark {
  display: flex;
  align-items: center;
}
.logo-title {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-white);
  line-height: 1;
}
.logo-sub {
  display: block;
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
}
.footer__brand-desc {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: rgba(255,255,255,0.5);
  margin-bottom: var(--space-6);
}
.footer__social {
  display: flex;
  gap: var(--space-2);
}
.social-link {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: background var(--duration-fast), color var(--duration-fast);
}
.social-link:hover { background: var(--color-mint); color: white; }

/* Links */
.footer__links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}
.footer__col-heading {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-white);
  margin-bottom: var(--space-4);
}
.footer__col ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }
.footer__link {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: color var(--duration-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.footer__link:not(span):hover { color: var(--color-mint); }
.footer__link--muted { color: rgba(255,255,255,0.35) !important; }
.footer__time {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.75);
  font-weight: 500;
}
.footer__time--off { color: rgba(255,255,255,0.35); }

/* Bottom */
.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: var(--space-5) 0;
}
.footer__bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.footer__bottom-inner p {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.35);
}
.footer__bottom-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: rgba(255,255,255,0.25);
  font-size: var(--text-xs);
}
.footer__bottom-link {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  transition: color var(--duration-fast);
}
.footer__bottom-link:hover { color: var(--color-mint); }

@media (max-width: 1024px) {
  .footer__top-inner { grid-template-columns: 1fr; gap: var(--space-10); }
  .footer__brand { max-width: 360px; }
}
@media (max-width: 640px) {
  .footer__links { grid-template-columns: 1fr 1fr; }
  .footer__bottom-inner { flex-direction: column; align-items: flex-start; }
}
</style>
