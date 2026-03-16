



/* ============================================
   script.js - "لكي نصل معاً"
   نسخة مُعاد كتابتها (Production-ready)
   - Fix: ترتيب المتغيرات قبل init
   - Fix: handleResize بدون shadowing
   - تحسين: scroll handler واحد + throttle
   - تحسين: validation via CSS classes
   - تحسين: A11y للمنيو + سلايدر + رسائل
   - تحسين: prefers-reduced-motion
============================================ */

'use strict';

/* =========================
   Helpers
========================= */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit = 150) {
  let inThrottle = false;
  let lastArgs = null;

  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      window.setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* =========================
   DOM Refs (declare first)
========================= */
const DOM = {
  loadingScreen: null,
  navbar: null,
  menuToggle: null,
  navMenu: null,
  navLinks: [],
  backToTop: null,
  currentYear: null,

  // sections
  sections: [],

  // stats
  statNumbers: [],

  // portfolio
  filterButtons: [],
  portfolioItems: [],

  // testimonials
  testimonialSlider: null,
  sliderTrack: null,
  prevBtn: null,
  nextBtn: null,

  // forms
  contactForm: null,
  formMessage: null,
  newsletterForm: null
};

/* =========================
   State (declare first)
========================= */
let state = {
  isMenuOpen: false,

  // Stats
  statsAnimated: false,

  // Testimonials
  testimonialIndex: 0,
  testimonialTimer: null,
  testimonialIsAnimating: false,
  testimonialStartX: 0,
  testimonialDeltaX: 0,
  testimonialIsDragging: false,

  // Particles
  particles: {
    enabled: true,
    container: null,
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    raf: 0,
    points: [],
    count: 45
  }
};

/* =========================
   Init
========================= */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  bindEvents();
  initializeUI();
});

window.addEventListener('load', () => {
  // Loading screen should reflect actual load, not a fake timeout
  hideLoadingScreen();
});

/* =========================
   Cache DOM
========================= */
function cacheDOM() {
  DOM.loadingScreen = document.getElementById('loadingScreen');
  DOM.navbar = document.getElementById('navbar');
  DOM.menuToggle = document.getElementById('menuToggle');
  DOM.navMenu = document.getElementById('navMenu');
  DOM.navLinks = Array.from(document.querySelectorAll('.nav-link'));
  DOM.backToTop = document.getElementById('backToTop');
  DOM.currentYear = document.getElementById('currentYear');

  DOM.sections = Array.from(document.querySelectorAll('section[id], header[id]'));

  DOM.statNumbers = Array.from(document.querySelectorAll('.stat-number[data-count]'));

  DOM.filterButtons = Array.from(document.querySelectorAll('.filter-btn[data-filter]'));
  DOM.portfolioItems = Array.from(document.querySelectorAll('.portfolio-item[data-category]'));

  DOM.testimonialSlider = document.getElementById('testimonialSlider');
  DOM.prevBtn = document.getElementById('prevTestimonial');
  DOM.nextBtn = document.getElementById('nextTestimonial');
  DOM.sliderTrack = DOM.testimonialSlider ? DOM.testimonialSlider.querySelector('.slider-track') : null;

  DOM.contactForm = document.getElementById('contactForm');
  DOM.formMessage = document.getElementById('formMessage');
  DOM.newsletterForm = document.getElementById('newsletterForm');

  // particles container (div)
  state.particles.container = document.getElementById('particles');
}

/* =========================
   Bind Events
========================= */
function bindEvents() {
  // Single scroll handler (navbar + backToTop + active links + stats trigger)
  const onScroll = throttle(handleScroll, 120);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Resize handler
  window.addEventListener('resize', debounce(handleResize, 200));

  // Menu toggle
  if (DOM.menuToggle) {
    DOM.menuToggle.addEventListener('click', toggleMenu);
  }

  // Close menu on link click (mobile)
  DOM.navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (state.isMenuOpen) closeMenu();
    });
  });

  // Portfolio filter
  DOM.filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => handlePortfolioFilter(btn));
  });

  // Testimonials controls
  if (DOM.prevBtn) DOM.prevBtn.addEventListener('click', () => slideTestimonial(-1));
  if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', () => slideTestimonial(1));

  // Pause auto slide on hover/focus
  if (DOM.testimonialSlider) {
    DOM.testimonialSlider.addEventListener('mouseenter', pauseTestimonials);
    DOM.testimonialSlider.addEventListener('mouseleave', resumeTestimonials);
    DOM.testimonialSlider.addEventListener('focusin', pauseTestimonials);
    DOM.testimonialSlider.addEventListener('focusout', resumeTestimonials);

    // Touch support (simple + safe)
    DOM.testimonialSlider.addEventListener('touchstart', onTouchStart, { passive: true });
    DOM.testimonialSlider.addEventListener('touchmove', onTouchMove, { passive: true });
    DOM.testimonialSlider.addEventListener('touchend', onTouchEnd);
  }

  // Back to top
  if (DOM.backToTop) {
    DOM.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  // Forms
  if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', handleContactSubmit);
    enableLiveValidation(DOM.contactForm);
  }

  if (DOM.newsletterForm) {
    DOM.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // Escape closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isMenuOpen) closeMenu();
  });
}

/* =========================
   Initialize UI
========================= */
function initializeUI() {
  // Year
  if (DOM.currentYear) DOM.currentYear.textContent = String(new Date().getFullYear());

  // AOS
  initAOS();

  // Initial scroll state
  handleScroll();

  // Testimonials
  initTestimonials();

  // Particles (optional)
  initParticles();

  // Initial resize adjustments
  handleResize();
}

function initAOS() {
  if (typeof window.AOS === 'undefined') return;
  window.AOS.init({
    duration: prefersReducedMotion() ? 0 : 800,
    once: true,
    easing: 'ease-out',
    offset: 80
  });
}

function hideLoadingScreen() {
  if (!DOM.loadingScreen) return;
  DOM.loadingScreen.classList.add('loaded');
  DOM.loadingScreen.setAttribute('aria-hidden', 'true');
}

/* =========================
   Scroll Handler (single)
========================= */
function handleScroll() {
  const y = window.scrollY || 0;

  // Navbar style
  if (DOM.navbar) {
    DOM.navbar.classList.toggle('scrolled', y > 10);
  }

  // Back to top
  if (DOM.backToTop) {
    DOM.backToTop.classList.toggle('show', y > 600);
  }

  // Active link highlight + Stats trigger
  updateActiveNavLink();
  maybeAnimateStats();
}

function updateActiveNavLink() {
  if (!DOM.sections.length || !DOM.navLinks.length) return;

  const y = window.scrollY || 0;
  const offset = 120; // navbar + breathing room
  let currentId = null;

  for (const sec of DOM.sections) {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    if (y + offset >= top && y + offset < top + height) {
      currentId = sec.id;
      break;
    }
  }

  if (!currentId) return;

  DOM.navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isActive = href === `#${currentId}`;
    link.classList.toggle('active', isActive);
  });
}

/* =========================
   Menu
========================= */
function toggleMenu() {
  state.isMenuOpen ? closeMenu() : openMenu();
}

function openMenu() {
  if (!DOM.menuToggle || !DOM.navMenu) return;

  state.isMenuOpen = true;
  DOM.menuToggle.classList.add('active');
  DOM.navMenu.classList.add('active');

  DOM.menuToggle.setAttribute('aria-expanded', 'true');
  DOM.menuToggle.setAttribute('aria-label', 'إغلاق القائمة');

  // prevent body scroll on mobile menu
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!DOM.menuToggle || !DOM.navMenu) return;

  state.isMenuOpen = false;
  DOM.menuToggle.classList.remove('active');
  DOM.navMenu.classList.remove('active');

  DOM.menuToggle.setAttribute('aria-expanded', 'false');
  DOM.menuToggle.setAttribute('aria-label', 'فتح القائمة');

  document.body.style.overflow = '';
}

/* =========================
   Stats Counter
========================= */
function maybeAnimateStats() {
  if (state.statsAnimated) return;
  if (!DOM.statNumbers.length) return;

  // trigger when stats section is near viewport
  const first = DOM.statNumbers[0];
  const section = first.closest('.stats-section');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.85;

  if (inView) {
    state.statsAnimated = true;
    DOM.statNumbers.forEach(animateNumber);
  }
}

function animateNumber(el) {
  const target = Number(el.getAttribute('data-count') || '0');
  const duration = prefersReducedMotion() ? 0 : 1200;
  const start = performance.now();

  if (duration === 0) {
    el.textContent = String(target);
    return;
  }

  function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const current = Math.floor(target * (0.2 + 0.8 * t));
    el.textContent = String(current);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = String(target);
  }

  requestAnimationFrame(tick);
}

/* =========================
   Portfolio Filter
========================= */
function handlePortfolioFilter(btn) {
  const filter = btn.getAttribute('data-filter');
  if (!filter) return;

  // update buttons
  DOM.filterButtons.forEach((b) => {
    const active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  // filter items
  DOM.portfolioItems.forEach((item) => {
    const cat = item.getAttribute('data-category');
    const show = filter === 'all' || cat === filter;
    item.style.display = show ? '' : 'none';
  });

  // refresh AOS positions if exists
  if (typeof window.AOS !== 'undefined') window.AOS.refreshHard();
}

/* =========================
   Testimonials Slider
========================= */
function initTestimonials() {
  if (!DOM.sliderTrack) return;

  const items = DOM.sliderTrack.querySelectorAll('.testimonial-item');
  if (!items.length) return;

  state.testimonialIndex = 0;
  applyTestimonialTransform();

  // autoplay
  resumeTestimonials();
}

function applyTestimonialTransform() {
  if (!DOM.sliderTrack) return;
  const x = -state.testimonialIndex * 100;
  DOM.sliderTrack.style.transform = `translateX(${x}%)`;
}

function slideTestimonial(dir) {
  if (!DOM.sliderTrack) return;
  if (state.testimonialIsAnimating) return;

  const itemsCount = DOM.sliderTrack.querySelectorAll('.testimonial-item').length;
  if (!itemsCount) return;

  state.testimonialIsAnimating = true;

  state.testimonialIndex = (state.testimonialIndex + dir) % itemsCount;
  if (state.testimonialIndex < 0) state.testimonialIndex = itemsCount - 1;

  applyTestimonialTransform();

  // unlock after CSS transition
  const unlockDelay = prefersReducedMotion() ? 0 : 520;
  window.setTimeout(() => {
    state.testimonialIsAnimating = false;
  }, unlockDelay);
}

function resumeTestimonials() {
  if (prefersReducedMotion()) return; // avoid autoplay for reduced motion
  if (!DOM.sliderTrack) return;

  pauseTestimonials();
  state.testimonialTimer = window.setInterval(() => {
    slideTestimonial(1);
  }, 5000);
}

function pauseTestimonials() {
  if (state.testimonialTimer) {
    window.clearInterval(state.testimonialTimer);
    state.testimonialTimer = null;
  }
}

/* Touch */
function onTouchStart(e) {
  if (!e.touches || !e.touches[0]) return;
  state.testimonialIsDragging = true;
  state.testimonialStartX = e.touches[0].clientX;
  state.testimonialDeltaX = 0;
  pauseTestimonials();
}

function onTouchMove(e) {
  if (!state.testimonialIsDragging) return;
  if (!e.touches || !e.touches[0]) return;
  state.testimonialDeltaX = e.touches[0].clientX - state.testimonialStartX;
}

function onTouchEnd() {
  if (!state.testimonialIsDragging) return;
  state.testimonialIsDragging = false;

  const threshold = 45;
  if (state.testimonialDeltaX > threshold) slideTestimonial(-1);
  else if (state.testimonialDeltaX < -threshold) slideTestimonial(1);

  resumeTestimonials();
}

/* =========================
   Forms
========================= */
function enableLiveValidation(form) {
  const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
  inputs.forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });
}

function validateField(field) {
  if (!field) return true;

  const required = field.hasAttribute('required');
  const value = String(field.value || '').trim();

  let valid = true;

  if (required && !value) valid = false;

  if (valid && field.type === 'email' && value) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  // CSS classes instead of inline styles
  field.classList.toggle('is-valid', valid && value.length > 0);
  field.classList.toggle('is-invalid', !valid);

  return valid;
}

function showFormMessage(type, text) {
  if (!DOM.formMessage) return;

  DOM.formMessage.classList.remove('success', 'error');
  DOM.formMessage.classList.add(type === 'success' ? 'success' : 'error');
  DOM.formMessage.textContent = text;
}

function handleContactSubmit(e) {
  e.preventDefault();
  if (!DOM.contactForm) return;

  const fields = Array.from(DOM.contactForm.querySelectorAll('input, textarea, select'));
  const allValid = fields.every((f) => validateField(f));

  if (!allValid) {
    showFormMessage('error', 'يرجى التأكد من تعبئة الحقول المطلوبة بشكل صحيح.');
    return;
  }

  // Demo success (no backend in هذا المشروع)
  showFormMessage('success', 'تم إرسال رسالتك بنجاح! سنقوم بالتواصل معك قريباً.');
  DOM.contactForm.reset();

  // Clear validation states
  fields.forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  if (!DOM.newsletterForm) return;

  const emailInput = DOM.newsletterForm.querySelector('input[type="email"]');
  if (!emailInput) return;

  const ok = validateField(emailInput);
  if (!ok) return;

  // Simple UX feedback
  const btn = DOM.newsletterForm.querySelector('button[type="submit"]');
  if (btn) {
    const prev = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>تم!</span>';

    window.setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = prev;
      DOM.newsletterForm.reset();
      emailInput.classList.remove('is-valid', 'is-invalid');
    }, 1200);
  }
}

/* =========================
   Particles (Canvas)
   - Optional background effect
========================= */
function initParticles() {
  const p = state.particles;
  if (!p.container) return;

  // Disable for reduced motion
  if (prefersReducedMotion()) {
    p.enabled = false;
    return;
  }

  // Create canvas once
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  p.container.appendChild(canvas);
  p.canvas = canvas;
  p.ctx = canvas.getContext('2d');

  resetParticles();
  drawParticles();
}

function resetParticles() {
  const p = state.particles;
  if (!p.canvas || !p.ctx) return;

  const rect = p.container.getBoundingClientRect();
  p.w = Math.max(1, Math.floor(rect.width));
  p.h = Math.max(1, Math.floor(rect.height));

  p.canvas.width = p.w;
  p.canvas.height = p.h;

  p.points = Array.from({ length: p.count }, () => ({
    x: Math.random() * p.w,
    y: Math.random() * p.h,
    r: 1 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));
}

function drawParticles() {
  const p = state.particles;
  if (!p.enabled || !p.ctx) return;

  const ctx = p.ctx;

  ctx.clearRect(0, 0, p.w, p.h);

  // points
  ctx.globalAlpha = 0.7;
  for (const pt of p.points) {
    pt.x += pt.vx;
    pt.y += pt.vy;

    if (pt.x < 0) pt.x = p.w;
    if (pt.x > p.w) pt.x = 0;
    if (pt.y < 0) pt.y = p.h;
    if (pt.y > p.h) pt.y = 0;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  // lines
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < p.points.length; i++) {
    for (let j = i + 1; j < p.points.length; j++) {
      const a = p.points[i];
      const b = p.points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(96,165,250,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  p.raf = requestAnimationFrame(drawParticles);
}

/* =========================
   Resize
========================= */
function handleResize() {
  // Fix: no shadowing, container resolved once
  const p = state.particles;
  if (p.enabled && p.container && p.canvas) {
    resetParticles();
  }
}
