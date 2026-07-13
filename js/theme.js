/**
 * Zentrix theme controller.
 * Applies the stored/system theme before the page paints and keeps the user's
 * preference in localStorage.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'zentrix-theme';
  const root = document.documentElement;
  let storedTheme = null;

  try {
    storedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  root.dataset.theme = initialTheme;

  const updateBrowserThemeColor = (theme) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f4ef' : '#09090b');
  };

  const updateControl = (button, theme) => {
    if (!button) return;
    const isLight = theme === 'light';
    button.setAttribute('aria-pressed', String(isLight));
    button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  };

  const applyTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    updateBrowserThemeColor(theme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        // Theme still works for the current session when storage is blocked.
      }
    }

    updateControl(document.getElementById('theme-toggle'), theme);
    window.dispatchEvent(new CustomEvent('zentrix:themechange', { detail: { theme } }));
  };

  const initializeThemeToggle = () => {
    const button = document.getElementById('theme-toggle');
    updateBrowserThemeColor(root.dataset.theme);
    updateControl(button, root.dataset.theme);

    button?.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });

  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeToggle, { once: true });
  } else {
    initializeThemeToggle();
  }
})();
