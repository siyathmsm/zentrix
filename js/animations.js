/**
 * Zentrix animation controller.
 * Intersection reveals, counters, particle background, and lightweight parallax.
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal content as it enters the viewport.
    const reveals = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((element) => element.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });

      reveals.forEach((element) => revealObserver.observe(element));
    }

    // Count statistics once they are visible.
    const counters = document.querySelectorAll('.counter');
    const animateCounter = (counter) => {
      const target = Number(counter.dataset.target || 0);
      const suffix = counter.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(step);
      };

      window.requestAnimationFrame(step);
    };

    if (reducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach((counter) => {
        counter.textContent = `${counter.dataset.target || 0}${counter.dataset.suffix || ''}`;
      });
    } else {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.55 });

      counters.forEach((counter) => counterObserver.observe(counter));
    }

    // Low-cost scroll parallax for selected hero visuals.
    const parallaxElements = [...document.querySelectorAll('[data-parallax]')];
    let parallaxTicking = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach((element) => {
        const factor = Number(element.dataset.parallax || 0.05);
        const offset = Math.min(scrollY * factor, 42);
        if (element.classList.contains('is-visible')) {
          element.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
      parallaxTicking = false;
    };

    if (!reducedMotion && parallaxElements.length) {
      window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
          window.requestAnimationFrame(updateParallax);
          parallaxTicking = true;
        }
      }, { passive: true });
    }

    // Canvas particles. They automatically adapt to theme, screen size, and tab visibility.
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || reducedMotion) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = 0;
    let isPageVisible = !document.hidden;
    let palette = {};

    const getPalette = () => {
      const isLight = document.documentElement.dataset.theme === 'light';
      return {
        dot: isLight ? 'rgba(110, 80, 52, 0.42)' : 'rgba(205, 184, 133, 0.48)',
        line: isLight ? 'rgba(110, 80, 52, 0.09)' : 'rgba(205, 184, 133, 0.10)'
      };
    };

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.45 + 0.45,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.55 + 0.18
    });

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const particleCount = Math.min(76, Math.max(28, Math.round(width / 18)));
      particles = Array.from({ length: particleCount }, createParticle);
      palette = getPalette();
    };

    const draw = () => {
      if (!isPageVisible) return;
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -5) particle.x = width + 5;
        if (particle.x > width + 5) particle.x = -5;
        if (particle.y < -5) particle.y = height + 5;
        if (particle.y > height + 5) particle.y = -5;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = palette.dot.replace(/([\d.]+)\)$/, `${particle.opacity})`);
        context.fill();

        for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
          const compare = particles[compareIndex];
          const distanceX = particle.x - compare.x;
          const distanceY = particle.y - compare.y;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;

          if (distanceSquared < 115 * 115) {
            const opacity = (1 - Math.sqrt(distanceSquared) / 115) * 0.75;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(compare.x, compare.y);
            context.strokeStyle = palette.line.replace(/([\d.]+)\)$/, `${opacity * 0.13})`);
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        window.cancelAnimationFrame(animationFrame);
        draw();
      } else {
        window.cancelAnimationFrame(animationFrame);
      }
    };

    resizeCanvas();
    draw();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('zentrix:themechange', () => { palette = getPalette(); });
  });
})();
