/**
 * Utility functions for the Car Rental System
 */

const THEME_STORAGE_KEY = 'themePreference';

/**
 * Gets the theme preference from local storage.
 * @returns {string|null} 'light', 'dark', or null.
 */
const getStoredTheme = () => localStorage.getItem(THEME_STORAGE_KEY);

/**
 * Gets the preferred theme based on storage or system settings.
 * @returns {string} 'light' or 'dark'.
 */
const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

/**
 * Sets the theme on the <html> element and saves the preference.
 * @param {string} theme The theme to set ('light' or 'dark').
 */
export function setTheme(theme) {
  if (theme === 'auto') {
    // Handle 'auto' if added later
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  updateTogglerIcons(theme);
  const themeDisplay = document.getElementById('current-theme-display');
  if (themeDisplay) {
    themeDisplay.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
}

/**
 * Updates the theme toggler icons based on the current theme.
 * @param {string} theme The current theme ('light' or 'dark').
 */
function updateTogglerIcons(theme) {
  document.querySelectorAll('#theme-toggler').forEach((toggler) => {
    const sunIcon = toggler.querySelector('[data-theme-icon="bi-sun-fill"]');
    const moonIcon = toggler.querySelector('[data-theme-icon="bi-moon-fill"]');

    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.classList.add('d-none');
        sunIcon.classList.remove('theme-icon-active');
        moonIcon.classList.remove('d-none');
        moonIcon.classList.add('theme-icon-active');
      } else {
        sunIcon.classList.remove('d-none');
        sunIcon.classList.add('theme-icon-active');
        moonIcon.classList.add('d-none');
        moonIcon.classList.remove('theme-icon-active');
      }
    }
  });
}

/**
 * Initializes the theme when the script loads.
 */
(function initTheme() {
  setTheme(getPreferredTheme());

  // Optional: Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const storedTheme = getStoredTheme();
      if (!storedTheme) {
        // Only update if no explicit preference is set
        setTheme(getPreferredTheme());
      }
    });
})();

/**
 * Attaches event listener to the theme toggler button.
 * Call this after the DOM is loaded.
 */
export function attachThemeToggler() {
  document.querySelectorAll('#theme-toggler').forEach((toggler) => {
    toggler.addEventListener('click', () => {
      const currentTheme =
        document.documentElement.getAttribute('data-bs-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  });
}

/**
 * Gets a query parameter value from the current URL.
 * @param {string} name The name of the query parameter.
 * @returns {string|null} The value of the parameter or null if not found.
 */
