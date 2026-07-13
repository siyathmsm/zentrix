/**
 * Zentrix main interaction controller.
 * Navigation, loader, forms, scroll behavior, and card micro-interactions.
 */
(() => {
  'use strict';

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const body = document.body;
    const header = document.getElementById('site-header');
    const menuButton = document.getElementById('menu-toggle');
    const navPanel = document.getElementById('nav-panel');
    const navLinks = [...document.querySelectorAll('.nav-link')];
    const backToTop = document.getElementById('back-to-top');
    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    // Premium loader with a minimum display duration to avoid a visual flash.
    const loader = document.getElementById('loader');
    const loaderStartedAt = performance.now();
    const hideLoader = () => {
      const elapsed = performance.now() - loaderStartedAt;
      window.setTimeout(() => loader?.classList.add('is-hidden'), Math.max(0, 850 - elapsed));
    };

    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader, { once: true });
    window.setTimeout(hideLoader, 3500); // Safety fallback for failed external assets.

    const closeMenu = () => {
      body.classList.remove('menu-open');
      navPanel?.classList.remove('is-open');
      menuButton?.classList.remove('is-active');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', 'Open navigation menu');
    };

    const openMenu = () => {
      body.classList.add('menu-open');
      navPanel?.classList.add('is-open');
      menuButton?.classList.add('is-active');
      menuButton?.setAttribute('aria-expanded', 'true');
      menuButton?.setAttribute('aria-label', 'Close navigation menu');
    };

    menuButton?.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) closeMenu();
    });

    const updateScrollUI = () => {
      const currentScrollY = window.scrollY;
      header?.classList.toggle('is-scrolled', currentScrollY > 18);
      backToTop?.classList.toggle('is-visible', currentScrollY > 650);

      if (!body.classList.contains('menu-open')) {
        const scrollingDown = currentScrollY > lastScrollY && currentScrollY > 160;
        header?.classList.toggle('is-hidden', scrollingDown);
      }

      lastScrollY = currentScrollY;
      scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    }, { passive: true });

    updateScrollUI();

    backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Highlight the navigation item associated with the visible section.
    const observedSections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
        });
      }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });

      observedSections.forEach((section) => sectionObserver.observe(section));
    }

    // Subtle pointer-driven 3D effect on service cards.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!reducedMotion && supportsFinePointer) {
      document.querySelectorAll('[data-tilt]').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const rotateY = (x - 0.5) * 7;
          const rotateX = (0.5 - y) * 7;
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('pointerleave', () => {
          card.style.transform = '';
        });
      });
    }

    // Contact form client-side validation.
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const validators = {
      name: (value) => value.trim().length >= 2 || 'Please enter at least 2 characters.',
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim()) || 'Please enter a valid email address.',
      phone: (value) => !value.trim() || /^[+\d][\d\s().-]{6,20}$/.test(value.trim()) || 'Please enter a valid phone number.',
      company: () => true,
      message: (value) => value.trim().length >= 10 || 'Please tell us a little more about your project.'
    };

    const setFieldState = (field, message = '') => {
      const wrapper = field.closest('.form-field');
      const error = document.getElementById(`${field.id}-error`);
      wrapper?.classList.toggle('is-invalid', Boolean(message));
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (message) field.setAttribute('aria-describedby', `${field.id}-error`);
      else field.removeAttribute('aria-describedby');
      if (error) error.textContent = message;
    };

    const validateField = (field) => {
      const validator = validators[field.name];
      if (!validator) return true;
      const result = validator(field.value);
      const message = result === true ? '' : result;
      setFieldState(field, message);
      return result === true;
    };

    contactForm?.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-field')?.classList.contains('is-invalid')) validateField(field);
        formSuccess?.classList.remove('is-visible');
      });
    });

    contactForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fields = [...contactForm.querySelectorAll('input, textarea')];
      const isValid = fields.map(validateField).every(Boolean);

      if (!isValid) {
        fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton?.querySelector('span')?.textContent || 'Send Project Inquiry';
      submitButton?.setAttribute('disabled', '');
      if (submitButton?.querySelector('span')) submitButton.querySelector('span').textContent = 'Sending…';

      // Replace this simulated request with fetch('/your-api-endpoint', {...}).
      await new Promise((resolve) => window.setTimeout(resolve, 700));

      contactForm.reset();
      fields.forEach((field) => setFieldState(field));
      formSuccess?.classList.add('is-visible');
      submitButton?.removeAttribute('disabled');
      if (submitButton?.querySelector('span')) submitButton.querySelector('span').textContent = originalLabel;
    });

    // Newsletter demo interaction.
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMessage = document.getElementById('newsletter-message');
    newsletterForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]');
      if (!email?.checkValidity()) {
        newsletterMessage.textContent = 'Please enter a valid email address.';
        email?.focus();
        return;
      }
      newsletterMessage.textContent = 'Thanks — you’re on the list.';
      newsletterForm.reset();
    });

    const year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
