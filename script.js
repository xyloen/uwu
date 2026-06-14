'use strict';

/* ============================================================
   UTILIDADES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   AÑO EN FOOTER
   ============================================================ */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   NAVBAR — SCROLL STATE + HAMBURGER
   ============================================================ */
(function initNavbar() {
  const navbar = $('.navbar');
  const hamburger = $('.navbar__hamburger');
  const mobileMenu = $('.mobile-menu');
  const mobileLinks = $$('.mobile-menu nav a');

  if (!navbar) return;

  // Scroll state
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (!hamburger || !mobileMenu) return;

  const toggle = (open) => {
    hamburger.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => {
    toggle(!mobileMenu.classList.contains('open'));
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle(false);
  });

  // Cerrar click fuera
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggle(false);
  });
})();

/* ============================================================
   SMOOTH SCROLL — Navbar links
   ============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  if (!window.IntersectionObserver) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   NAVBAR — ACTIVE LINK POR SECCIÓN (SCROLLSPY)
   ============================================================ */
(function initScrollSpy() {
  const navLinks = $$('.navbar__nav a[href^="#"]');
  if (!navLinks.length) return;

  const sections = navLinks.map(link => {
    const id = link.getAttribute('href');
    return { link, section: $(id) };
  }).filter(({ section }) => !!section);

  const onScroll = () => {
    const scrollY = window.scrollY;
    const navH = 80;

    sections.forEach(({ link, section }) => {
      const top = section.offsetTop - navH - 20;
      const bottom = top + section.offsetHeight;
      link.style.color = (scrollY >= top && scrollY < bottom)
        ? 'var(--color-accent)'
        : '';
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   WHATSAPP FLOTANTE — Mostrar después del scroll inicial
   ============================================================ */
(function initWhatsappFloat() {
  const float = $('#whatsapp-float');
  if (!float) return;

  float.style.opacity = '0';
  float.style.transform = 'scale(0.8)';
  float.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  float.style.pointerEvents = 'none';

  const show = () => {
    if (window.scrollY > 300) {
      float.style.opacity = '1';
      float.style.transform = 'scale(1)';
      float.style.pointerEvents = '';
    } else {
      float.style.opacity = '0';
      float.style.transform = 'scale(0.8)';
      float.style.pointerEvents = 'none';
    }
  };

  window.addEventListener('scroll', show, { passive: true });
  show();
})();

/* ============================================================
   CALL BAR — Mostrar/ocultar al scroll
   ============================================================ */
(function initCallBar() {
  const bar = $('#call-bar');
  if (!bar) return;

  let lastY = window.scrollY;
  let hidden = false;

  const onScroll = () => {
    const y = window.scrollY;
    if (y < 100) {
      if (hidden) { bar.style.transform = ''; hidden = false; }
      lastY = y;
      return;
    }
    if (y > lastY + 8 && !hidden) {
      bar.style.transform = 'translateY(100%)';
      bar.style.transition = 'transform 0.3s ease';
      hidden = true;
    } else if (y < lastY - 8 && hidden) {
      bar.style.transform = '';
      hidden = false;
    }
    lastY = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   FAQ — Cierra otros al abrir uno
   ============================================================ */
(function initFaq() {
  const items = $$('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });
})();

/* ============================================================
   GALERÍA — Lightbox simple
   ============================================================ */
(function initGallery() {
  const items = $$('.gallery-item');
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Vista ampliada');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.92);
    display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;transition:opacity 0.3s ease;
    cursor:zoom-out;padding:1rem;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width:100%;max-height:90svh;border-radius:12px;
    object-fit:contain;transform:scale(0.95);
    transition:transform 0.3s ease;box-shadow:0 8px 64px rgba(0,0,0,0.8);
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Cerrar');
  closeBtn.style.cssText = `
    position:absolute;top:1rem;right:1rem;
    width:44px;height:44px;border-radius:50%;
    background:rgba(255,255,255,0.1);color:#fff;
    font-size:1.5rem;display:flex;align-items:center;justify-content:center;
    border:1px solid rgba(255,255,255,0.2);cursor:pointer;
    transition:background 0.2s ease;
  `;

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || '';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    img.style.transform = 'scale(1)';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    img.style.transform = 'scale(0.95)';
    document.body.style.overflow = '';
  };

  items.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const activate = () => {
      const bg = item.style.backgroundImage;
      const url = bg.replace(/url\(["']?|["']?\)/g, '');
      const label = item.getAttribute('aria-label') || '';
      if (url && url !== 'none') open(url, label);
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  overlay.addEventListener('click', (e) => { if (e.target !== img) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.pointerEvents !== 'none') close();
  });
})();

/* ============================================================
   FORMULARIO DE CONTACTO
   ============================================================ */
(function initForm() {
  const form = $('#contact-form');
  if (!form) return;

  const successEl = $('#form-success');
  const submitBtn = form.querySelector('button[type="submit"]');

  const validate = () => {
    let valid = true;
    const nameInput = form.querySelector('#name');
    const phoneInput = form.querySelector('#phone');

    [nameInput, phoneInput].forEach(input => {
      if (!input) return;
      input.classList.remove('error');
      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      }
    });

    if (phoneInput && phoneInput.value.trim()) {
      const cleaned = phoneInput.value.replace(/\D/g, '');
      if (cleaned.length < 7) {
        phoneInput.classList.add('error');
        valid = false;
      }
    }

    return valid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    // Simula envío — integra tu endpoint aquí
    await new Promise(r => setTimeout(r, 1200));

    // Construye mensaje WhatsApp como fallback
    const name = form.querySelector('#name')?.value || '';
    const phone = form.querySelector('#phone')?.value || '';
    const service = form.querySelector('#service')?.value || '';
    const message = form.querySelector('#message')?.value || '';
    const waNum = '[WHATSAPP]';

    const waText = encodeURIComponent(
      `Hola, mi nombre es ${name}. Teléfono: ${phone}. Servicio: ${service || 'General'}. ${message}`
    );

    if (successEl) {
      form.querySelectorAll('.form-group, button[type="submit"], .form-note').forEach(el => {
        el.style.display = 'none';
      });
      successEl.removeAttribute('hidden');
    }

    // Abre WhatsApp con los datos del formulario
    setTimeout(() => {
      window.open(`https://wa.me/${waNum.replace(/\D/g, '')}?text=${waText}`, '_blank', 'noopener,noreferrer');
    }, 600);
  });

  // Limpiar error en tiempo real
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });
})();

/* ============================================================
   MICROINTERACCIONES — Botones WhatsApp bounce on hover
   ============================================================ */
(function initMicroInteractions() {
  $$('.btn--whatsapp').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.04)' },
        { transform: 'scale(1)' }
      ], { duration: 300, easing: 'ease' });
    });
  });
})();

/* ============================================================
   CONTADOR ANIMADO — Stats del hero
   ============================================================ */
(function initCounters() {
  const stats = $$('.stat__num');
  if (!stats.length || !window.IntersectionObserver) return;

  const animateCount = (el) => {
    const text = el.textContent;
    const prefix = text.match(/^[^0-9]*/)?.[0] || '';
    const suffix = text.match(/[^0-9]+$/)?.[0] || '';
    const numStr = text.replace(/[^0-9]/g, '');
    const target = parseInt(numStr, 10);
    if (isNaN(target)) return;

    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
})();
