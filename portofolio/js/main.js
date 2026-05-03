/* ============================================================
   Personal Portfolio — main.js
   Handles: profile photo upload (PNG/JPG/WebP), persistence,
   brand-logo loading with graceful fallback, smooth UI extras.
   ============================================================ */

(function () {
  'use strict';

  // ---------- Storage helpers ----------------------------------------------
  // Storage is per-domain on Cloudflare Pages — fully OK to use here.
  const STORAGE_KEYS = {
    PHOTO: 'portfolio.profilePhoto',
    NAME:  'portfolio.profileName'
  };

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (_) { return false; }
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  // ---------- Toast ---------------------------------------------------------
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(message, ms) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, ms || 2200);
  }

  // ---------- Profile photo -------------------------------------------------
  const profileAvatar = document.getElementById('profileAvatar');
  const headerAvatar  = document.getElementById('headerAvatar');
  const editPhotoBtn  = document.getElementById('editPhotoBtn');
  const photoInput    = document.getElementById('photoInput');
  const resetPhotoBtn = document.getElementById('resetPhotoBtn');
  const headerAvatarBtn = document.getElementById('headerAvatarBtn');

  const DEFAULT_AVATAR = 'assets/PP.jpg';
  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

  function setAvatarSrc(src) {
    if (profileAvatar) profileAvatar.src = src;
    if (headerAvatar)  headerAvatar.src  = src;
  }

  function loadStoredPhoto() {
    const saved = safeGet(STORAGE_KEYS.PHOTO);
    if (saved && saved.indexOf('data:image') === 0) {
      setAvatarSrc(saved);
    }
  }

  function handlePhotoFile(file) {
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      toast('Format tidak didukung. Gunakan PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast('Ukuran file melebihi 5 MB. Pilih file yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;

      // Re-encode to JPEG (max 512px) for smaller storage footprint
      const img = new Image();
      img.onload = function () {
        const MAX_DIM = 512;
        let w = img.width, h = img.height;
        if (w > h && w > MAX_DIM) { h = Math.round(h * (MAX_DIM / w)); w = MAX_DIM; }
        else if (h >= w && h > MAX_DIM) { w = Math.round(w * (MAX_DIM / h)); h = MAX_DIM; }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        let optimized;
        try {
          optimized = canvas.toDataURL('image/jpeg', 0.88);
        } catch (_) {
          optimized = dataUrl; // fall back to original
        }

        setAvatarSrc(optimized);
        const ok = safeSet(STORAGE_KEYS.PHOTO, optimized);
        toast(ok ? 'Foto profil tersimpan' : 'Foto diperbarui (tidak tersimpan permanen)');
      };
      img.onerror = function () { toast('Gagal memuat gambar.'); };
      img.src = dataUrl;
    };
    reader.onerror = function () { toast('Gagal membaca file.'); };
    reader.readAsDataURL(file);
  }

  if (editPhotoBtn && photoInput) {
    editPhotoBtn.addEventListener('click', function () { photoInput.click(); });
  }
  if (headerAvatarBtn && photoInput) {
    headerAvatarBtn.addEventListener('click', function () { photoInput.click(); });
  }
  if (photoInput) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      handlePhotoFile(file);
      // Reset so the same file can be re-selected later
      photoInput.value = '';
    });
  }
  if (resetPhotoBtn) {
    resetPhotoBtn.addEventListener('click', function () {
      safeRemove(STORAGE_KEYS.PHOTO);
      setAvatarSrc(DEFAULT_AVATAR);
      toast('Foto direset ke default');
    });
  }

  // Drag & drop on the avatar frame
  const avatarFrame = document.querySelector('.profile__avatar-frame');
  if (avatarFrame) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      avatarFrame.addEventListener(evt, function (e) {
        e.preventDefault(); e.stopPropagation();
        avatarFrame.style.outline = '2px dashed #0a6ed1';
        avatarFrame.style.outlineOffset = '4px';
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      avatarFrame.addEventListener(evt, function (e) {
        e.preventDefault(); e.stopPropagation();
        avatarFrame.style.outline = '';
        avatarFrame.style.outlineOffset = '';
      });
    });
    avatarFrame.addEventListener('drop', function (e) {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handlePhotoFile(file);
    });
  }

  // ---------- Editable name -------------------------------------------------
  const nameEl = document.getElementById('profileName');
  if (nameEl) {
    const saved = safeGet(STORAGE_KEYS.NAME);
    if (saved) nameEl.textContent = saved;
    nameEl.addEventListener('blur', function () {
      const value = (nameEl.textContent || '').trim() || 'Nama Anda';
      nameEl.textContent = value;
      safeSet(STORAGE_KEYS.NAME, value);
    });
    nameEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    });
  }

  // ---------- Brand logos ---------------------------------------------------
  // Strategy: try Clearbit logo CDN (very reliable for tech vendors).
  // If it fails, fall back to a styled text label so the page never looks broken.
  const brandCards = document.querySelectorAll('.brand-card');
  brandCards.forEach(function (card) {
    const localLogo = card.getAttribute('data-logo');
    const domain    = card.getAttribute('data-domain');
    const name      = card.getAttribute('data-name');
    const slot      = card.querySelector('.brand-card__logo');
    if (!slot) return;

    const logoSrc = localLogo || (domain ? 'https://logo.clearbit.com/' + domain : null);

    if (!logoSrc) {
      slot.classList.add('brand-card__logo--text');
      slot.textContent = name || '';
      return;
    }

    const probe = new Image();
    probe.onload  = function () { slot.style.backgroundImage = "url('" + logoSrc + "')"; };
    probe.onerror = function () {
      slot.classList.add('brand-card__logo--text');
      slot.textContent = name || '';
    };
    probe.src = logoSrc;
  });

  // ---------- Tabbar reactive highlight ------------------------------------
  const tabs = document.querySelectorAll('.tabbar__item');
  const sections = ['expertise', 'brands', 'certifications', 'frameworks']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (tabs.length && 'IntersectionObserver' in window && sections.length) {
    const map = {};
    tabs.forEach(function (t) {
      const id = (t.getAttribute('href') || '').replace('#', '');
      map[id] = t;
    });
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          tabs.forEach(function (t) { t.classList.remove('is-active'); });
          map[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
  }

  // Smooth scroll on tab click without changing URL hash visually
  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      const id = (t.getAttribute('href') || '').replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
      }
    });
  });

  // ---------- Year ----------------------------------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Init ----------------------------------------------------------
  loadStoredPhoto();
})();
