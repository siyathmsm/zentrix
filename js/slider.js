/**
 * Zentrix testimonial carousel.
 * Autoplay, keyboard controls, dots, arrows, hover pause, and touch swiping.
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('testimonial-slider');
    if (!slider) return;

    const track = slider.querySelector('.testimonial-slider__track');
    const slides = [...slider.querySelectorAll('.testimonial-slide')];
    const dots = [...slider.querySelectorAll('.slider-dot')];
    const previousButton = document.getElementById('testimonial-prev');
    const nextButton = document.getElementById('testimonial-next');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchDeltaX = 0;

    const goTo = (index, announce = false) => {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentIndex;
        slide.setAttribute('aria-hidden', String(!active));
        slide.querySelectorAll('a, button, input, textarea, select').forEach((element) => {
          element.tabIndex = active ? 0 : -1;
        });
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === currentIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', String(active));
      });

      if (announce) slider.setAttribute('aria-label', `Client testimonials, showing ${currentIndex + 1} of ${slides.length}`);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion || document.hidden) return;
      autoplayTimer = window.setInterval(() => goTo(currentIndex + 1), 5600);
    };

    previousButton?.addEventListener('click', () => {
      goTo(currentIndex - 1, true);
      startAutoplay();
    });

    nextButton?.addEventListener('click', () => {
      goTo(currentIndex + 1, true);
      startAutoplay();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goTo(index, true);
        startAutoplay();
      });
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', (event) => {
      if (!slider.contains(event.relatedTarget)) startAutoplay();
    });

    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(currentIndex - 1, true);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(currentIndex + 1, true);
      }
    });

    slider.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
      stopAutoplay();
    }, { passive: true });

    slider.addEventListener('touchmove', (event) => {
      touchDeltaX = event.touches[0].clientX - touchStartX;
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      if (Math.abs(touchDeltaX) > 48) goTo(currentIndex + (touchDeltaX < 0 ? 1 : -1), true);
      startAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    goTo(0);
    startAutoplay();
  });
})();
