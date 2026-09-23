/* Edward Lau Portfolio — UI interactions (plain JavaScript) */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupYear() {
    $$('.current-year').forEach(el => el.textContent = new Date().getFullYear());
  }

  function setupHeader() {
    const header = $('.site-header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 18);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
  }

  function setupMobileNav() {
    const btn = $('#menuBtn');
    const nav = $('#navLinks');
    if (!btn || !nav) return;
    const close = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
      document.body.classList.remove('nav-open');
    };
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? '✕' : '☰';
      document.body.classList.toggle('nav-open', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (innerWidth > 880) close(); });
  }

  function setupActiveNav() {
    const page = document.body.dataset.page;
    $$('[data-nav]').forEach(link => {
      const active = link.dataset.nav === page;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function setupTheme() {
    const btn = $('#themeToggle');
    if (!btn) return;
    const root = document.documentElement;
    const stored = localStorage.getItem('portfolio-theme');
    const preferred = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    root.dataset.theme = stored || preferred;
    const render = () => {
      const light = root.dataset.theme === 'light';
      btn.textContent = light ? '☾' : '☀';
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      btn.title = light ? 'Dark mode' : 'Light mode';
    };
    render();
    btn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('portfolio-theme', root.dataset.theme);
      render();
    });
  }

  function setupReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -25px' });
    items.forEach(el => observer.observe(el));
  }

  function setupTyping() {
    const el = $('#typingText');
    if (!el || reducedMotion) return;
    const phrases = ['Web Developer', 'IT Student', 'UI Explorer', 'Problem Solver'];
    let p = 0, c = 0, deleting = false;
    const tick = () => {
      const text = phrases[p];
      c += deleting ? -1 : 1;
      el.textContent = text.slice(0, Math.max(0, c));
      let delay = deleting ? 44 : 76;
      if (!deleting && c === text.length) { deleting = true; delay = 1150; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 260; }
      setTimeout(tick, delay);
    };
    tick();
  }

  function setupCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;
    const run = el => {
      const target = Number(el.dataset.counter || 0);
      const suffix = el.dataset.suffix || '';
      if (reducedMotion) { el.textContent = `${target}${suffix}`; return; }
      const start = performance.now();
      const duration = 1200;
      const frame = now => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (!('IntersectionObserver' in window)) return counters.forEach(run);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { run(entry.target); observer.unobserve(entry.target); }
    }), { threshold: .55 });
    counters.forEach(el => observer.observe(el));
  }

  function setupSkillBars() {
    const bars = $$('.skill-fill[data-level]');
    if (!bars.length) return;
    const show = bar => bar.style.width = `${bar.dataset.level}%`;
    if (reducedMotion || !('IntersectionObserver' in window)) return bars.forEach(show);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
    }), { threshold: .35 });
    bars.forEach(bar => observer.observe(bar));
  }

  function setupProjectFilters() {
    const buttons = $$('.filter-btn');
    const cards = $$('.project-card[data-category]');
    if (!buttons.length || !cards.length) return;
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      cards.forEach(card => {
        const visible = filter === 'all' || (card.dataset.category || '').split(' ').includes(filter);
        if (visible) {
          card.classList.remove('is-hidden');
          if (!reducedMotion) card.animate([
            { opacity: 0, transform: 'translateY(12px) scale(.985)' },
            { opacity: 1, transform: 'none' }
          ], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
        } else card.classList.add('is-hidden');
      });
    }));
  }

  function setupProjectModal() {
    const modal = $('#projectModal');
    if (!modal) return;
    const title = $('#modalTitle');
    const desc = $('#modalDescription');
    const tech = $('#modalTech');
    const art = $('#modalArt');
    const closeBtn = $('#modalClose');
    const modalContent = modal.querySelector('.modal-content');
    let liveDemo = modalContent?.querySelector('[data-modal-live-demo]');

    if (modalContent && !liveDemo) {
      liveDemo = document.createElement('a');
      liveDemo.className = 'btn btn-primary modal-live-demo';
      liveDemo.dataset.modalLiveDemo = 'true';
      liveDemo.target = '_blank';
      liveDemo.rel = 'noopener';
      liveDemo.hidden = true;
      liveDemo.textContent = 'Launch Live Demo ↗';
      modalContent.appendChild(liveDemo);
    }

    let opener = null;

    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      opener?.focus();
    };

    $$('[data-project-open]').forEach(btn => btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (!card) return;
      opener = btn;
      title.textContent = card.dataset.title || 'Project';
      desc.textContent = card.dataset.description || '';
      tech.innerHTML = (card.dataset.tech || '').split(',').filter(Boolean).map(item => `<span class="tag">${item.trim()}</span>`).join('');
      art.className = `modal-top ${card.dataset.art || 'art-ai'}`;

      const liveUrl = card.dataset.liveUrl || '';
      if (liveDemo) {
        if (liveUrl) {
          liveDemo.href = liveUrl;
          liveDemo.hidden = false;
          liveDemo.textContent = card.dataset.liveLabel || 'Launch Live Demo ↗';
          liveDemo.setAttribute('aria-label', `Open ${card.dataset.title || 'project'} in a new tab`);
        } else {
          liveDemo.hidden = true;
          liveDemo.removeAttribute('href');
        }
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }));

    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }

  function setupTilt() {
    const coarsePointer = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
    const cards = $$('.card, .profile-card, .quick-contact-card').filter(card => !card.matches('[data-static-card="true"]'));

    cards.forEach(card => {
      card.classList.add('unified-card');
      card.dataset.unifiedCard = 'true';

      if (card.dataset.unifiedBound === 'true') return;
      card.dataset.unifiedBound = 'true';

      // Touch devices keep a simple press response in CSS; no pointer-follow 3D tilt.
      if (coarsePointer || reducedMotion) return;

      const reset = () => {
        card.classList.remove('is-card-hovered');
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
        card.style.setProperty('--card-lift', '0px');
        card.style.setProperty('--card-scale', '1');
      };

      card.addEventListener('pointerenter', event => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        // Remove any reveal stagger from the interaction itself so every card responds immediately.
        card.style.transitionDelay = '0s';
        card.classList.add('is-card-hovered');
        card.style.setProperty('--card-lift', '-3px');
        card.style.setProperty('--card-scale', '1.004');
      }, { passive: true });

      card.addEventListener('pointermove', event => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = ((event.clientX - rect.left) / rect.width) - 0.5;
        const ny = ((event.clientY - rect.top) / rect.height) - 0.5;
        const rotateY = Math.max(-2.2, Math.min(2.2, nx * 4.4));
        const rotateX = Math.max(-2.2, Math.min(2.2, -ny * 4.4));
        card.style.setProperty('--card-rx', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${rotateY.toFixed(2)}deg`);
      }, { passive: true });

      card.addEventListener('pointerleave', reset, { passive: true });
      card.addEventListener('pointercancel', reset, { passive: true });
    });
  }

  function setupSpotlight() {
    if (matchMedia('(pointer: coarse)').matches) return;
    $$('.card, .profile-card').filter(el => !el.matches('[data-static-card="true"]')).forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
  }

  function setupParticles() {
    const layer = $('#particles');
    if (!layer || reducedMotion) return;
    const amount = innerWidth < 700 ? 10 : 20;
    const colors = ['#22d3ee','#8a5cff','#ff4fa3','#ffe15b'];
    for (let i = 0; i < amount; i++) {
      const dot = document.createElement('span');
      dot.className = 'particle';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.animationDuration = `${10 + Math.random() * 15}s`;
      dot.style.animationDelay = `${-Math.random() * 22}s`;
      dot.style.color = colors[Math.floor(Math.random() * colors.length)];
      layer.appendChild(dot);
    }
  }

  function setupCursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow || matchMedia('(pointer: coarse)').matches || reducedMotion) return;
    addEventListener('pointermove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  function setupRipple() {
    $$('.btn, .filter-btn, .icon-btn').forEach(btn => {
      if (btn.dataset.rippleBound === 'true') return;
      btn.dataset.rippleBound = 'true';
      btn.addEventListener('click', e => {
      if (reducedMotion) return;
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(r.width, r.height) * .8;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left}px`;
      ripple.style.top = `${e.clientY - r.top}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  function setupContactForm() {
    const form = $('#contactForm');
    if (!form) return;
    const toast = $('#toast');
    const success = $('#formSuccess');
    const submit = form.querySelector('button[type="submit"]');
    const defaultSubmitLabel = submit?.dataset.submitLabel || 'Send Message ↗';
    let successTimer = null;

    const setError = (name, message = '') => {
      const error = $(`[data-error="${name}"]`);
      const input = form.elements[name];
      if (error) error.textContent = message;
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const showToast = msg => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3600);
    };

    const setSubmitting = active => {
      form.classList.toggle('is-sending', active);
      if (!submit) return;
      submit.disabled = active;
      submit.setAttribute('aria-busy', active ? 'true' : 'false');
      submit.textContent = active ? 'Sending…' : defaultSubmitLabel;
    };

    const showSentState = () => {
      if (!submit) return;
      if (successTimer) clearTimeout(successTimer);
      submit.disabled = true;
      submit.classList.add('is-sent');
      submit.textContent = 'Message sent ✓';
      successTimer = setTimeout(() => {
        submit.disabled = false;
        submit.classList.remove('is-sent');
        submit.textContent = defaultSubmitLabel;
      }, 2200);
    };

    const successMessage = 'Message sent successfully! I’ll get back to you via email.';
    const params = new URLSearchParams(location.search);
    if (params.get('sent') === '1') {
      if (success) success.textContent = successMessage;
      form.classList.add('is-success');
      showToast('✓ Message sent successfully!');
      showSentState();
      history.replaceState({}, '', location.pathname + location.hash);
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.classList.contains('is-sending')) return;

      const data = Object.fromEntries(new FormData(form).entries());
      let valid = true;
      ['name','email','subject','message'].forEach(k => setError(k));
      if (success) success.textContent = '';
      form.classList.remove('is-success');
      if (!data.name?.trim()) { setError('name','Please enter your name.'); valid = false; }
      if (!/^\S+@\S+\.\S+$/.test(data.email || '')) { setError('email','Please enter a valid email.'); valid = false; }
      if (!data.subject?.trim()) { setError('subject','Please enter a subject.'); valid = false; }
      if ((data.message || '').trim().length < 10) { setError('message','Please write at least 10 characters.'); valid = false; }
      if (!valid) { showToast('Please check the highlighted fields.'); return; }

      if (location.protocol === 'file:') {
        showToast('Preview mode — open the published Netlify site to send a real message.');
        return;
      }

      setSubmitting(true);
      let sent = false;
      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const response = await fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!response.ok) throw new Error(`Submission failed (${response.status})`);

        form.reset();
        sent = true;
        if (success) success.textContent = successMessage;
        form.classList.add('is-success');
        showToast('✓ Message sent successfully!');
      } catch (error) {
        console.error(error);
        const fallback = 'Something went wrong. Please use Email, LinkedIn or WhatsApp instead.';
        if (success) success.textContent = fallback;
        showToast(fallback);
      } finally {
        setSubmitting(false);
        if (sent) showSentState();
      }
    });
  }

  function setupCopy() {
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        const old = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(() => btn.textContent = old, 1300);
      } catch { alert(value); }
    }));
  }

  function setupPrint() {
    $('#printResume')?.addEventListener('click', () => print());
  }

  function setupBackToTop() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-top';
    btn.setAttribute('aria-label','Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
    const update = () => btn.classList.toggle('show', scrollY > 600);
    update();
    addEventListener('scroll', update, { passive:true });
    btn.addEventListener('click', () => scrollTo({ top:0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  }

  function setupDynamicPage() {
    setupReveal();
    setupTyping();
    setupCounters();
    setupSkillBars();
    setupProjectFilters();
    setupProjectModal();
    setupTilt();
    setupSpotlight();
    setupRipple();
    setupContactForm();
    setupQuickContactPlaceholders();
    setupCopy();
    setupPrint();
    setupExitExperience();
    setupPortfolioEnhancements();
  }

  function setupSeamlessNavigation() {
    const pages = window.__EDWARD_PORTFOLIO_PAGES__ || {};
    let navigating = false;

    const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

    const filenameFromUrl = value => {
      try {
        const url = new URL(value, location.href);

        // Netlify may publish .html pages as "pretty URLs" such as /about
        // or /about/. Local files keep /about.html. Normalize both forms
        // back to the cached page key so navigation always stays in-page.
        const cleanPath = url.pathname.replace(/\/+$/, '');
        if (!cleanPath) return 'index.html';

        let filename = cleanPath.split('/').pop() || 'index.html';

        if (pages[filename]) return filename;

        if (!filename.includes('.')) {
          const htmlFilename = `${filename}.html`;
          if (pages[htmlFilename]) return htmlFilename;
        }

        return filename;
      } catch (_) {
        return 'index.html';
      }
    };

    const isInternalPageLink = (link, event) => {
      if (!link || event.defaultPrevented) return false;
      // Desktop clicks expose button=0; some mobile/touch-generated clicks do not
      // expose a numeric button value. Treat those as normal primary navigation.
      if (typeof event.button === 'number' && event.button !== 0) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (link.target === '_blank' || link.hasAttribute('download')) return false;
      if (link.dataset.noTransition === 'true') return false;

      const href = link.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) return false;

      const filename = filenameFromUrl(link.href);
      return Boolean(pages[filename]);
    };

    const elementFromHTML = html => {
      if (typeof html !== 'string' || !html.trim()) return null;
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstElementChild;
    };

    // Support both the original cache schema
    //   { page, main, footer, extras }
    // and the newer schema
    //   { bodyPage, mainHTML, footerHTML, extrasHTML }.
    // Keeping this normalization here prevents the transition overlay from
    // getting stuck if a cached page bundle and navigation script were built
    // by different portfolio revisions.
    const normalizePageData = data => {
      if (!data || typeof data !== 'object') return null;

      const rawExtras = data.extrasHTML ?? data.extras ?? [];
      const extrasHTML = Array.isArray(rawExtras)
        ? rawExtras.filter(item => typeof item === 'string' && item.trim())
        : (typeof rawExtras === 'string' && rawExtras.trim() ? [rawExtras] : []);

      return {
        title: data.title || '',
        bodyPage: data.bodyPage || data.page || '',
        mainHTML: data.mainHTML || data.main || '',
        footerHTML: data.footerHTML || data.footer || '',
        extrasHTML
      };
    };

    const clearPageExtras = (main, footer) => {
      let node = main.nextElementSibling;
      while (node && node !== footer) {
        const next = node.nextElementSibling;
        node.remove();
        node = next;
      }
    };

    const ensureTransitionOverlay = () => {
      let overlay = document.getElementById('pageTransitionOverlay');
      if (overlay) return overlay;

      overlay = document.createElement('div');
      overlay.id = 'pageTransitionOverlay';
      overlay.className = 'page-transition-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="page-transition-beam"></div>
        <div class="page-transition-core">
          <span class="page-transition-mark">EL</span>
          <span class="page-transition-label">PORTFOLIO</span>
        </div>
      `;
      document.body.appendChild(overlay);
      return overlay;
    };

    const prepareArrival = (main, pageName) => {
      if (!main || reducedMotion) return;
      main.classList.add('page-arrival', `page-arrival-${pageName || 'page'}`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => main.classList.add('is-ready'));
      });
      window.setTimeout(() => {
        main.classList.remove(
          'page-arrival',
          'page-arrival-home',
          'page-arrival-about',
          'page-arrival-projects',
          'page-arrival-skills',
          'page-arrival-contact',
          'page-arrival-page',
          'is-ready'
        );
      }, 760);
    };

    const swapToPage = (filename, targetUrl, push = true) => {
      const data = normalizePageData(pages[filename]);
      const currentMain = document.querySelector('main');
      const currentFooter = document.querySelector('footer');

      if (!data || !currentMain || !currentFooter) return false;

      const nextMain = elementFromHTML(data.mainHTML);
      const nextFooter = elementFromHTML(data.footerHTML);
      if (!nextMain || !nextFooter) return false;

      clearPageExtras(currentMain, currentFooter);
      currentMain.replaceWith(nextMain);

      const footerNow = document.querySelector('footer');
      data.extrasHTML.forEach(html => {
        const extra = elementFromHTML(html);
        if (extra && footerNow) footerNow.before(extra);
      });

      if (footerNow) footerNow.replaceWith(nextFooter);

      document.body.dataset.page = data.bodyPage;
      document.title = data.title || document.title;

      try {
        if (push) {
          if (location.protocol === 'file:') {
            history.pushState(
              { portfolioPage: filename },
              '',
              '#/' + filename
            );
          } else {
            history.pushState(
              { portfolioPage: filename },
              '',
              targetUrl
            );
          }
        }
      } catch (_) {}

      setupYear();
      setupActiveNav();
      setupDynamicPage();

      const nav = $('#navLinks');
      const menu = $('#menuBtn');
      nav?.classList.remove('open');
      menu?.setAttribute('aria-expanded', 'false');
      if (menu) menu.textContent = '☰';
      document.body.classList.remove('nav-open');

      window.scrollTo({ top: 0, behavior: 'auto' });
      prepareArrival(nextMain, data.bodyPage);

      return true;
    };

    const transitionToPage = async (filename, targetUrl, push = true) => {
      if (navigating) return;
      const data = normalizePageData(pages[filename]);
      if (!data) {
        location.href = targetUrl;
        return;
      }

      if (reducedMotion) {
        if (!swapToPage(filename, targetUrl, push)) location.href = targetUrl;
        return;
      }

      navigating = true;
      document.body.classList.add('seamless-loading', 'page-transitioning');

      const overlay = ensureTransitionOverlay();
      const label = overlay.querySelector('.page-transition-label');
      const currentMain = document.querySelector('main');

      try {
        if (label) {
          const name = data.bodyPage === 'home' ? 'HOME' : (data.bodyPage || 'PORTFOLIO').toUpperCase();
          label.textContent = name;
        }

        overlay.classList.remove('is-leaving');
        // Restart the overlay animation even when clicking quickly between pages.
        void overlay.offsetWidth;
        overlay.classList.add('is-active');
        currentMain?.classList.add('page-transition-out');

        const recruiterFast = document.documentElement.classList.contains('recruiter-mode');
        await wait(recruiterFast ? 70 : 300);

        const swapped = swapToPage(filename, targetUrl, push);
        if (!swapped) throw new Error(`Unable to swap cached page: ${filename}`);

        await wait(recruiterFast ? 85 : 330);
        overlay.classList.add('is-leaving');

        await wait(recruiterFast ? 90 : 320);
      } catch (error) {
        console.error('[Portfolio navigation]', error);
        // Never leave visitors trapped behind the transition layer. If the
        // in-page swap fails for any reason, fall back to a normal navigation.
        window.location.assign(targetUrl);
        return;
      } finally {
        overlay.classList.remove('is-active', 'is-leaving');
        document.body.classList.remove('seamless-loading', 'page-transitioning');
        navigating = false;
      }
    };

    const navigate = (url, push = true) => {
      const filename = filenameFromUrl(url);
      transitionToPage(filename, url, push);
    };

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!isInternalPageLink(link, event)) return;

      event.preventDefault();
      navigate(link.href, true);
    }, true);

    try {
      const currentFile = filenameFromUrl(location.href);
      history.replaceState(
        { portfolioPage: currentFile },
        '',
        location.href
      );
    } catch (_) {}

    addEventListener('popstate', event => {
      const stateFile = event.state?.portfolioPage;
      if (stateFile && pages[stateFile]) {
        transitionToPage(stateFile, location.href, false);
        return;
      }

      if (location.protocol === 'file:' && location.hash.startsWith('#/')) {
        const hashFile = location.hash.slice(2);
        if (pages[hashFile]) {
          transitionToPage(hashFile, location.href, false);
          return;
        }
      }

      const currentFile = filenameFromUrl(location.href);
      if (pages[currentFile]) transitionToPage(currentFile, location.href, false);
    });
  }


  function setupQuickContactPlaceholders() {
    const toast = $('#toast');
    const showToast = text => {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3300);
    };
    $$('[data-contact-placeholder]').forEach(link => {
      link.addEventListener('click', e => {
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
          showToast(link.dataset.contactPlaceholder || 'Add your contact link before publishing.');
        }
      });
    });
  }


  const projectCaseStudies = {
    'Empower Counselling Website & Admin CMS': {
      focus: 'A real client-facing counselling website with a separate protected content-management workflow for long-term handoff.',
      contribution: 'Served as Project OC and Web Developer, building the public website, admin content workflow, programme-to-WhatsApp enquiry experience, deployment, testing and client handoff.',
      demonstrates: 'Real-world requirement handling, responsive web delivery, client communication, CMS handoff, deployment and responsibility for a system intended for ongoing use.'
    },
    'CampusAI Student Assistant': {
      focus: 'Student-focused conversational UI and practical AI-assisted support.',
      contribution: 'Structured the interface, chat interactions, quick FAQ access and session-history experience.',
      demonstrates: 'Front-end thinking, conversational UI design and practical use of AI-assisted responses.'
    },
    'Cloud Infrastructure Lab': {
      focus: 'Hands-on cloud infrastructure practice covering virtual machines, Cloud Storage, service models and foundational cloud security responsibilities.',
      contribution: 'Worked through VM-instance configuration, Cloud Storage bucket and file-upload workflows, compared IaaS/PaaS/SaaS responsibility boundaries, and reviewed practical security controls.',
      demonstrates: 'Understanding of cloud compute, object storage, service-model responsibilities and basic security considerations in a practical lab context.'
    },
    'Business Calculation & Receipt System': {
      focus: 'A complete C++17 checkout and receipt workflow for a practical retail-style business scenario.',
      contribution: 'Built an 8-product catalogue, cart add/update/remove controls, reusable input validation, subtotal and tiered-discount calculations, configurable demo service tax, cash/card/e-wallet checkout, cash-change validation, transaction-numbered receipts, date/time output and automatic receipt-file saving.',
      demonstrates: 'Object-oriented C++, STL containers and algorithms, validation, calculation logic, file handling, formatted console output and end-to-end transaction flow.'
    },
    'Tuition Centre Management System': {
      focus: 'A Python-based tuition registration and fee-management program for UPSR, PT3 and SPM students.',
      contribution: 'Implemented student information capture, level and subject selection, tuition schedules, Malaysian public-holiday display, fee calculation, package discounts, invoice generation and a loop for registering multiple students.',
      demonstrates: 'Python fundamentals, functions, dictionaries, input validation, calculation logic and structured console-based workflow.'
    },
    'Student Management System': {
      focus: 'A Python console application for storing student marks, converting grades, searching records and producing summary statistics.',
      contribution: 'Implemented student data collection, 0–100 marks validation, A–F grade conversion, case-insensitive partial-name search, and calculations for total students, average, highest, lowest and grade distribution.',
      demonstrates: 'Python fundamentals, dictionaries, loops, conditionals, input validation, search logic and basic data analysis.'
    },
    'Full-Stack Login & Registration System': {
      focus: 'An end-to-end student club registration and login workflow connecting frontend, backend and database layers.',
      contribution: 'Built client-side form validation and login flows, connected POST /register and /login requests to a Node.js/Express backend, and stored user records in a MySQL users table.',
      demonstrates: 'Frontend-backend integration, API communication, database connectivity and practical understanding of a full-stack application workflow.'
    },
    'Interactive UI Prototype': {
      focus: 'Interactive interface design with clear hierarchy and navigation flow.',
      contribution: 'Created Figma prototypes focused on layout, interaction, navigation and overall interface experience.',
      demonstrates: 'UI/UX visual thinking, interaction design and the ability to turn ideas into usable interface concepts.'
    },
    'Personal Portfolio Website': {
      focus: 'An archived earlier coursework portfolio kept to show my development progress before the current portfolio.',
      contribution: 'Built a five-page responsive site with HTML, CSS and JavaScript, including navigation, interactive UI elements, project presentation and contact-form validation.',
      demonstrates: 'Growth in front-end structure, responsive layout, visual consistency and interaction design over time.'
    }
  };

  let recruiterMusicWasPlaying = false;

  function applyRecruiterMode(enabled) {
    const root = document.documentElement;
    root.classList.toggle('recruiter-mode', enabled);
    try {
      sessionStorage.setItem('edwardRecruiterMode', enabled ? '1' : '0');
    } catch (_) {}

    const audio = document.getElementById('portfolioAudio');
    if (enabled && audio) {
      recruiterMusicWasPlaying = !audio.paused;
      audio.pause();
    } else if (!enabled && audio && recruiterMusicWasPlaying) {
      audio.play().catch(() => {});
    }

    const intro = document.getElementById('keynoteIntro');
    if (enabled && intro) {
      intro.remove();
      document.documentElement.classList.remove('keynote-active');
      document.body.style.overflow = '';
    }

    const button = document.getElementById('recruiterModeToggle');
    if (button) {
      button.classList.toggle('is-active', enabled);
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      const label = button.querySelector('.recruiter-mode-label');
      if (label) label.textContent = enabled ? 'Recruiter On' : 'Recruiter Mode';
    }
  }

  function setupRecruiterMode() {
    let button = document.getElementById('recruiterModeToggle');
    if (!button) {
      const navActions = document.querySelector('.nav-actions');
      if (!navActions) return;

      button = document.createElement('button');
      button.id = 'recruiterModeToggle';
      button.type = 'button';
      button.className = 'recruiter-mode-toggle';
      button.setAttribute('aria-pressed', 'false');
      button.title = 'Fast, quiet view for recruiters';
      button.innerHTML = '<span class="recruiter-mode-dot"></span><span class="recruiter-mode-label">Recruiter Mode</span>';
      navActions.prepend(button);

      button.addEventListener('click', () => {
        applyRecruiterMode(!document.documentElement.classList.contains('recruiter-mode'));
      });
    }

    let enabled = false;
    try {
      enabled = sessionStorage.getItem('edwardRecruiterMode') === '1';
    } catch (_) {}
    applyRecruiterMode(enabled);
  }

  function setupHomeRecruiterSnapshot() {
    if (document.body.dataset.page !== 'home') return;

    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !heroActions.querySelector('[data-direct-resume]')) {
      const resume = document.createElement('a');
      resume.className = 'btn btn-resume';
      resume.href = 'assets/Edward-Lau-Resume.pdf';
      resume.target = '_blank';
      resume.rel = 'noopener';
      resume.dataset.directResume = 'true';
      resume.innerHTML = 'Download Resume <span aria-hidden="true">↓</span>';
      heroActions.appendChild(resume);
    }

    if (!document.querySelector('.career-snapshot')) {
      const hero = document.querySelector('.hero');
      const marquee = document.querySelector('.marquee');
      if (hero && marquee) {
        const snapshot = document.createElement('section');
        snapshot.className = 'career-snapshot';
        snapshot.setAttribute('aria-label', 'Current professional snapshot');
        snapshot.innerHTML = `
          <div class="container career-snapshot-grid">
            <div class="career-snapshot-intro">
              <span class="eyebrow">Currently</span>
              <strong>Ready for the next learning opportunity.</strong>
            </div>
            <div class="career-snapshot-item"><small>Education</small><b>Diploma in IT</b><span>FAME International College</span></div>
            <div class="career-snapshot-item"><small>Focus</small><b>UI · Interaction · Web</b><span>Digital problem solving</span></div>
            <div class="career-snapshot-item"><small>Seeking</small><b>IT / Digital Internship</b><span>Hands-on industry exposure</span></div>
            <div class="career-snapshot-item"><small>Based in</small><b>Kuching, Sarawak</b><span>Malaysia</span></div>
          </div>
        `;
        marquee.before(snapshot);
      }
    }
  }

  function enhanceProjectCaseStudies() {
    document.querySelectorAll('.project-card [data-project-open]').forEach(button => {
      button.textContent = 'View case study →';
    });

    const modal = document.getElementById('projectModal');
    const content = modal?.querySelector('.modal-content');
    if (!modal || !content) return;

    let caseStudy = content.querySelector('.project-case-study');
    if (!caseStudy) {
      caseStudy = document.createElement('div');
      caseStudy.className = 'project-case-study';
      const techHeading = [...content.querySelectorAll('h3')].find(el => el.textContent.includes('Tools'));
      if (techHeading) content.insertBefore(caseStudy, techHeading);
      else content.appendChild(caseStudy);
    }

    document.querySelectorAll('.project-card [data-project-open]').forEach(button => {
      if (button.dataset.caseStudyBound === 'true') return;
      button.dataset.caseStudyBound = 'true';
      button.addEventListener('click', () => {
        const card = button.closest('.project-card');
        const details = projectCaseStudies[card?.dataset.title || ''];
        if (!details) {
          caseStudy.innerHTML = '';
          return;
        }
        caseStudy.innerHTML = `
          <div class="case-study-cell">
            <small>Project focus</small>
            <p>${details.focus}</p>
          </div>
          <div class="case-study-cell">
            <small>My contribution</small>
            <p>${details.contribution}</p>
          </div>
          <div class="case-study-cell case-study-wide">
            <small>What this demonstrates</small>
            <p>${details.demonstrates}</p>
          </div>
        `;
      });
    });
  }

  function setupPortfolioEnhancements() {
    setupRecruiterMode();
    setupHomeRecruiterSnapshot();
    enhanceProjectCaseStudies();
  }


  function setupExitExperience() {
    // Persistent Exit control:
    // first click = play the existing outro
    // second click = leave the website
    let exitControl = document.getElementById('portfolioExitControl');
    if (!exitControl) {
      exitControl = document.createElement('button');
      exitControl.id = 'portfolioExitControl';
      exitControl.type = 'button';
      exitControl.className = 'portfolio-exit-control';
      exitControl.setAttribute('aria-label', 'End portfolio experience');
      exitControl.title = 'End portfolio experience';
      exitControl.innerHTML = '<span class="portfolio-exit-control-icon">↗</span><span class="portfolio-exit-control-label">Exit</span>';
      document.body.appendChild(exitControl);
    }

    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks && !footerLinks.querySelector('[data-end-experience]')) {
      const endButton = document.createElement('button');
      endButton.type = 'button';
      endButton.className = 'footer-exit';
      endButton.dataset.endExperience = 'true';
      endButton.textContent = 'End Experience';
      footerLinks.appendChild(endButton);
    }

    let outro = document.getElementById('portfolioOutro');
    if (!outro) {
      outro = document.createElement('div');
      outro.id = 'portfolioOutro';
      outro.className = 'portfolio-outro';
      outro.setAttribute('aria-hidden', 'true');
      outro.innerHTML = `
        <div class="outro-glow outro-glow-a"></div>
        <div class="outro-glow outro-glow-b"></div>
        <div class="outro-stage">
          <span class="outro-kicker">EDWARD LAU · PORTFOLIO 2026</span>
          <div class="outro-mark">EL</div>
          <h2>Thank you<br/><span>for visiting.</span></h2>
          <p>Edward Lau · 2026</p>
          <div class="outro-actions">
            <button class="btn btn-secondary" type="button" data-outro-replay>Replay Experience</button>
            <button class="btn btn-primary" type="button" data-outro-close>Close</button>
          </div>
          <small class="outro-close-note" aria-live="polite"></small>
        </div>
      `;
      document.body.appendChild(outro);
    }

    if (outro.dataset.bound === 'true') return;
    outro.dataset.bound = 'true';

    let originalOverflow = '';
    let originalVolume = 0.18;
    let wasPlaying = false;
    let fadeFrame = null;

    const audio = () => document.getElementById('portfolioAudio');

    const fadeMusicOut = () => {
      const track = audio();
      if (!track || track.paused) return;

      originalVolume = track.volume || 0.18;
      const startedAt = performance.now();
      const duration = 1650;

      const tick = now => {
        const progress = Math.min(1, (now - startedAt) / duration);
        track.volume = Math.max(0, originalVolume * (1 - progress));
        if (progress < 1) {
          fadeFrame = requestAnimationFrame(tick);
        } else {
          track.pause();
          track.volume = originalVolume;
        }
      };

      fadeFrame = requestAnimationFrame(tick);
    };

    const startOutro = () => {
      if (outro.classList.contains('is-active')) return;

      const track = audio();
      wasPlaying = Boolean(track && !track.paused);
      if (track) originalVolume = track.volume || 0.18;

      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('portfolio-ending');
      outro.setAttribute('aria-hidden', 'false');
      outro.classList.remove('is-finished');
      void outro.offsetWidth;
      outro.classList.add('is-active');

      if (wasPlaying) fadeMusicOut();

      window.setTimeout(() => {
        outro.classList.add('is-finished');
      }, reducedMotion ? 80 : 1950);
    };

    const leaveWebsite = () => {
      // window.close() only succeeds when the browser allows the page to close itself.
      // about:blank is the reliable fallback so the visitor definitely leaves the portfolio.
      try { window.close(); } catch (_) {}
      window.setTimeout(() => {
        try { window.location.replace('about:blank'); }
        catch (_) { window.location.href = 'about:blank'; }
      }, 120);
    };

    exitControl.onclick = event => {
      event.preventDefault();
      event.stopPropagation();

      if (outro.classList.contains('is-active')) {
        leaveWebsite();
        return;
      }

      startOutro();
      exitControl.classList.add('is-confirm');
      const label = exitControl.querySelector('.portfolio-exit-control-label');
      if (label) label.textContent = 'Exit Website';
      exitControl.setAttribute('aria-label', 'Exit website');
    };

    const stopOutro = () => {
      if (fadeFrame) cancelAnimationFrame(fadeFrame);
      const track = audio();

      outro.classList.remove('is-active', 'is-finished');
      outro.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('portfolio-ending');
      document.body.style.overflow = originalOverflow;

      if (track) {
        track.volume = originalVolume || 0.18;
        if (wasPlaying) track.play().catch(() => {});
      }

      exitControl.classList.remove('is-confirm');
      const label = exitControl.querySelector('.portfolio-exit-control-label');
      if (label) label.textContent = 'Exit';
      exitControl.setAttribute('aria-label', 'End portfolio experience');
      exitControl.title = 'End portfolio experience';
    };

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-end-experience]');
      if (!trigger) return;
      event.preventDefault();
      startOutro();
    });

    outro.querySelector('[data-outro-replay]')?.addEventListener('click', () => {
      stopOutro();
      // Replay is an explicit request, so clear the once-per-session intro flag.
      try { sessionStorage.removeItem('edwardIntroSeen'); } catch (_) {}
      window.setTimeout(() => {
        location.href = 'index.html';
      }, 120);
    });

    outro.querySelector('[data-outro-close]')?.addEventListener('click', () => {
      leaveWebsite();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && outro.classList.contains('is-active')) {
        stopOutro();
      }
    });
  }


  function setupPortfolioMusic() {
    if ($('#musicToggle')) return;

    const TRACK_TITLE = 'Terror Jr — 3 Strikes';
    const MUSIC_PREF_KEY = 'edwardMusicPreference';
    const getPref = () => {
      try { return sessionStorage.getItem(MUSIC_PREF_KEY); } catch (_) { return null; }
    };
    const setPref = value => {
      try { sessionStorage.setItem(MUSIC_PREF_KEY, value); } catch (_) {}
    };

    const existingAudio = $('#portfolioAudio');
    const audio = existingAudio || document.createElement('audio');
    audio.id = 'portfolioAudio';
    audio.src = 'assets/3-Strikes-Terror-Jr.mp3';
    audio.loop = true;
    audio.preload = 'metadata';
    audio.autoplay = false;
    audio.muted = false;
    audio.volume = 0.18;
    audio.setAttribute('playsinline', '');

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'musicToggle';
    button.className = 'music-control';
    button.title = TRACK_TITLE;
    button.setAttribute('aria-label', 'Toggle background music: ' + TRACK_TITLE);
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="music-icon">♪</span><span class="music-label">Music off</span>';

    if (!audio.isConnected) document.body.appendChild(audio);
    document.body.appendChild(button);

    const render = () => {
      const playing = !audio.paused;
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      const icon = button.querySelector('.music-icon');
      const label = button.querySelector('.music-label');
      if (icon) icon.textContent = playing ? '♫' : '♪';
      if (label) label.textContent = playing ? 'Music on' : 'Music off';
    };

    const start = async (remember = true) => {
      try {
        await audio.play();
        if (remember) setPref('on');
      } catch (_) {}
      render();
    };

    const stop = (remember = true) => {
      audio.pause();
      if (remember) setPref('off');
      render();
    };

    button.addEventListener('click', () => {
      if (audio.paused) start(true);
      else stop(true);
    });

    audio.addEventListener('play', render);
    audio.addEventListener('pause', render);

    // On seamless page changes the same audio element remains alive, so its state
    // naturally persists. If a hard reload happens after the visitor explicitly
    // chose Music on, resume only after their next interaction (never on load).
    const shouldResumeAfterReload = getPref() === 'on' && audio.paused && !document.getElementById('keynoteIntro');
    if (shouldResumeAfterReload) {
      const resumeOnce = event => {
        if (event?.target?.closest?.('#musicToggle')) return;
        if (event?.type === 'keydown') {
          const tag = event.target?.tagName?.toLowerCase?.() || '';
          if (['input','textarea','select'].includes(tag)) return;
          if (!['Enter',' ','ArrowRight'].includes(event.key)) return;
        }
        start(false);
        window.removeEventListener('pointerdown', resumeOnce, true);
        window.removeEventListener('keydown', resumeOnce, true);
      };
      window.addEventListener('pointerdown', resumeOnce, true);
      window.addEventListener('keydown', resumeOnce, true);
    }

    render();
  }


  setupYear();
  setupHeader();
  setupScrollProgress();
  setupMobileNav();
  setupActiveNav();
  setupTheme();
  setupParticles();
  setupCursorGlow();
  setupDynamicPage();
  setupBackToTop();
  setupSeamlessNavigation();
  setupPortfolioMusic();
})();
