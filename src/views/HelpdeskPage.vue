<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router      = useRouter()
const helpItems   = ref({})
const contacts    = ref({ whatsapp: null, email: null })
const selectedHelp = ref(null)
const isLoading   = ref(true)

const fetchHelpData = async () => {
  try {
    const token = localStorage.getItem('Token')
    if (!token) { router.push('/login'); return }
    const res = await axios.get('/api/helpdesk', { headers: { Authorization: 'Bearer ' + token } })
    if (res.data.status === 'success') {
      helpItems.value = res.data.data_bantuan
      contacts.value  = res.data.kontak_admin
    }
  } catch (e) { console.error('Gagal mengambil data helpdesk:', e) }
  finally { isLoading.value = false }
}

const truncate = (text, len) => text?.length > len ? text.substring(0, len) + '...' : text

onMounted(fetchHelpData)
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <span class="page-header__label">Service Desk</span>
        <h1 class="page-header__title">Pusat Bantuan</h1>
        <p class="page-header__sub">Pilih kategori atau pertanyaan untuk melihat solusi</p>
      </div>
      <div class="orb"></div>
    </div>

    <div class="body">
      <!-- Loading -->
      <div v-if="isLoading" class="state-center">
        <div class="spinner"></div>
        <p>Memuat data bantuan...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="Object.keys(helpItems).length === 0" class="state-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/><path d="M24 14v12M24 32h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <p>Belum ada data bantuan tersedia.</p>
      </div>

      <!-- Content -->
      <template v-else>
        <div v-for="(items, category) in helpItems" :key="category" class="category-section">
          <!-- Category header -->
          <div class="category-header">
            <div class="category-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 6v4M7 5h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </div>
            <h2 class="category-title">{{ category || 'Umum' }}</h2>
            <span class="category-count">{{ items.length }} artikel</span>
          </div>

          <!-- Cards grid -->
          <div class="card-grid">
            <div
              v-for="item in items"
              :key="item.ID_Help"
              class="help-card"
              @click="selectedHelp = item"
            >
              <div class="help-card__body">
                <div class="help-card__icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" stroke="currentColor" stroke-width="1.2"/><path d="M7 6v4M7 5h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </div>
                <h3 class="help-card__title">{{ item.Judul }}</h3>
                <p class="help-card__preview">{{ truncate(item.Konten, 110) }}</p>
              </div>
              <div class="help-card__footer">
                <span class="read-more">
                  Lihat Detail
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M6 3l3 2.5L6 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact footer -->
        <div class="contact-card">
          <div class="contact-card__icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.4"/><path d="M2 6l9 7 9-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <div class="contact-card__text">
            <h3 class="contact-card__title">Tidak menemukan jawaban?</h3>
            <p class="contact-card__sub">Tim kami siap membantu Anda melalui WhatsApp atau email.</p>
          </div>
          <div class="contact-card__actions">
            <a v-if="contacts.whatsapp" :href="contacts.whatsapp" target="_blank" class="cbtn cbtn--wa">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5a6 6 0 016 6c0 3.314-2.686 6-6 6a5.97 5.97 0 01-3.1-.86L1.5 13.5l.92-2.85A5.97 5.97 0 011.5 7.5a6 6 0 016-6z" stroke="white" stroke-width="1.2"/><path d="M5.5 6.5s.5 1 1.5 2 2 1.5 2 1.5l1-1s.3-.3 0-.6L9 7.5c-.3-.3-.6 0-.6 0l-.4.4a3 3 0 01-1.4-1.4l.4-.4s.3-.3 0-.6L5.8 5c-.3-.3-.6 0-.6 0l-.7.7c-.3.3-.3.8 1 1.8z" fill="white"/></svg>
              WhatsApp Admin
            </a>
            <a v-if="contacts.email" :href="contacts.email" class="cbtn cbtn--email">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 3.5h11a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1v-7a1 1 0 011-1z" stroke="white" stroke-width="1.2"/><path d="M1.5 4l6 4.5L13.5 4" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>
              Email Support
            </a>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="selectedHelp" class="modal-overlay" @click.self="selectedHelp=null">
        <div class="modal">
          <div class="modal__header">
            <div class="modal__icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 8v5M9 7h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </div>
            <h2 class="modal__title">{{ selectedHelp.Judul }}</h2>
            <button class="modal__close" @click="selectedHelp=null">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal__divider"></div>
          <div class="modal__body">
            <p>{{ selectedHelp.Konten }}</p>
          </div>
          <div class="modal__footer">
            <button class="fbtn fbtn--ghost" @click="selectedHelp=null">Tutup</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page{--cf:#1a3a2a;--ce:#0f5c38;--cm:#2eb86a;--cfo:#e8f4ee;--ci:#0d1a12;--cs:#5a7566;--csv:#b8ccc2;--cmi:#f0f6f2;--cw:#fff;--fn:'Plus Jakarta Sans',sans-serif;--sh:0 1px 3px rgba(13,26,18,.06);font-family:var(--fn);min-height:100vh;background:var(--cmi);}

/* Header */
.page-header{background:linear-gradient(135deg,var(--cf),var(--ce));padding:2.5rem 2rem 3rem;position:relative;overflow:hidden;}
.orb{position:absolute;width:320px;height:320px;background:var(--cm);border-radius:50%;filter:blur(90px);opacity:.1;top:-100px;right:-60px;pointer-events:none;}
.page-header__label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cm);margin-bottom:.5rem;}
.page-header__title{font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:800;color:white;letter-spacing:-.025em;margin-bottom:.5rem;}
.page-header__sub{font-size:.9375rem;color:rgba(255,255,255,.6);}

/* Body */
.body{padding:2rem;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:2.5rem;}

/* States */
.state-center{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:5rem 2rem;color:var(--csv);font-size:.9375rem;}
.spinner{width:30px;height:30px;border:3px solid var(--cfo);border-top-color:var(--cm);border-radius:50%;animation:spin .65s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* Category */
.category-section{display:flex;flex-direction:column;gap:1rem;}
.category-header{display:flex;align-items:center;gap:.75rem;}
.category-icon{width:30px;height:30px;border-radius:8px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.category-title{font-size:1.125rem;font-weight:800;color:var(--ci);letter-spacing:-.01em;}
.category-count{font-size:.72rem;font-weight:700;color:var(--csv);background:var(--cmi);border:1px solid rgba(168,200,180,.25);padding:.2rem .625rem;border-radius:99px;margin-left:auto;}

/* Cards */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;}
.help-card{background:var(--cw);border-radius:14px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);cursor:pointer;display:flex;flex-direction:column;transition:all .2s;overflow:hidden;}
.help-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(13,26,18,.1);border-color:rgba(46,184,106,.3);}
.help-card__body{padding:1.25rem;flex:1;display:flex;flex-direction:column;gap:.625rem;}
.help-card__icon{width:34px;height:34px;border-radius:9px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.help-card__title{font-size:.9375rem;font-weight:700;color:var(--ci);line-height:1.4;}
.help-card__preview{font-size:.8125rem;color:var(--cs);line-height:1.6;flex:1;}
.help-card__footer{padding:.875rem 1.25rem;border-top:1px solid rgba(168,200,180,.12);background:var(--cmi);}
.read-more{display:inline-flex;align-items:center;gap:.35rem;font-size:.75rem;font-weight:700;color:var(--cm);}

/* Contact card */
.contact-card{background:var(--cw);border-radius:16px;border:1px solid rgba(168,200,180,.2);box-shadow:var(--sh);padding:2rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}
.contact-card__icon{width:48px;height:48px;border-radius:12px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.contact-card__text{flex:1;min-width:200px;}
.contact-card__title{font-size:1rem;font-weight:800;color:var(--ci);margin-bottom:.25rem;}
.contact-card__sub{font-size:.8125rem;color:var(--cs);}
.contact-card__actions{display:flex;gap:.75rem;flex-wrap:wrap;}
.cbtn{display:inline-flex;align-items:center;gap:.5rem;padding:.625rem 1.25rem;border-radius:99px;font-family:var(--fn);font-size:.8125rem;font-weight:700;text-decoration:none;transition:all .15s;}
.cbtn--wa{background:#16a34a;color:white;}
.cbtn--wa:hover{background:#15803d;}
.cbtn--email{background:var(--cs);color:white;}
.cbtn--email:hover{background:var(--ce);}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;}
.modal{background:var(--cw);border-radius:20px;width:100%;max-width:560px;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:pop .2s cubic-bezier(.16,1,.3,1);overflow:hidden;}
@keyframes pop{from{opacity:0;transform:scale(.93) translateY(10px);}to{opacity:1;transform:none;}}
.modal__header{display:flex;align-items:flex-start;gap:.875rem;padding:1.5rem 1.5rem 0;}
.modal__icon{width:36px;height:36px;border-radius:9px;background:var(--cfo);color:var(--cm);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.1rem;}
.modal__title{flex:1;font-size:1.0625rem;font-weight:800;color:var(--ci);line-height:1.4;}
.modal__close{width:28px;height:28px;border-radius:8px;background:var(--cmi);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--cs);flex-shrink:0;transition:all .15s;}
.modal__close:hover{background:#fef2f2;color:#dc2626;}
.modal__divider{height:1px;background:rgba(168,200,180,.2);margin:1.25rem 1.5rem 0;}
.modal__body{padding:1.25rem 1.5rem;max-height:60vh;overflow-y:auto;}
.modal__body p{font-size:.875rem;color:var(--cs);line-height:1.75;white-space:pre-wrap;}
.modal__footer{padding:1rem 1.5rem;border-top:1px solid rgba(168,200,180,.15);display:flex;justify-content:flex-end;}
.fbtn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.125rem;border-radius:9px;font-family:var(--fn);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .15s;}
.fbtn--ghost{background:var(--cmi);color:var(--cs);border:1.5px solid rgba(168,200,180,.3);}
.fbtn--ghost:hover{background:var(--cfo);color:var(--ce);}

@media(max-width:640px){
  .page-header{padding:1.75rem 1.25rem 2.25rem;}
  .body{padding:1rem;gap:1.75rem;}
  .contact-card{flex-direction:column;align-items:flex-start;}
}
</style>