/**
 * Utility functions for the Car Rental System
 */

import { isAdmin, logout } from '../modules/auth';

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
  // Flatpickr theme toggler
  const flatpickrDarkTheme = document.getElementById('flatpickr-dark-theme');
  if (flatpickrDarkTheme) {
    flatpickrDarkTheme.disabled = theme !== 'dark';
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
function initTheme() {
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
}

/**
 * Attaches event listener to the theme toggler button(s).
 * Call this after the DOM is loaded where a toggler exists.
 */
export function attachThemeToggler() {
  initTheme();
  document.querySelectorAll('#theme-toggler').forEach((toggler) => {
    if (!toggler.dataset.themeListenerAttached) {
      toggler.addEventListener('click', () => {
        const currentTheme =
          document.documentElement.getAttribute('data-bs-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
      });
      toggler.dataset.themeListenerAttached = 'true';
    }
  });
}

/**
 * Gets a query parameter value from the current URL.
 * @param {string} name The name of the query parameter.
 * @returns {string|null} The value of the parameter or null if not found.
 */
export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Sets or updates a query parameter in the current URL without reloading.
 * Use this carefully, full navigation might be better sometimes.
 * @param {string} key The key of the query parameter.
 * @param {string} value The value of the query parameter.
 */
export function setQueryParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

/**
 * Removes a query parameter from the current URL without reloading.
 * @param {string} key The key of the query parameter to remove.
 */
export function removeQueryParam(key) {
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url);
}

/**
 * Shows a Bootstrap toast notification. Adapts text color for dark mode.
 * @param {string} message The message to display.
 * @param {string} type 'success', 'error', 'warning', 'info' (maps to Bootstrap bg colors).
 * @param {string} toastId The ID of the toast element in the HTML.
 */
export function showToast(message, type = 'info', toastId = 'app-toast') {
  const toastEl = document.getElementById(toastId);
  if (!toastEl) {
    console.error(`Toast element with ID "${toastId}" not found.`);
    return;
  }
  const toastBody = toastEl.querySelector('.toast-body');
  const toastHeader = toastEl.querySelector('.toast-header');
  if (!toastBody || !toastHeader) {
    console.error(`Toast body or header not found within #${toastId}`);
    return;
  }

  toastEl.classList.remove(
    'bg-success',
    'bg-danger',
    'bg-warning',
    'bg-info',
    'text-white',
    'text-dark'
  );
  toastHeader.classList.remove('text-white', 'text-dark');

  let bgClass = '';
  let textClass = 'text-white';

  switch (type) {
    case 'success':
      bgClass = 'bg-success';
      break;
    case 'error':
      bgClass = 'bg-danger';
      break;
    case 'warning':
      bgClass = 'bg-warning';
      textClass = 'text-dark';
      break;
    case 'info':
    default:
      bgClass = 'bg-info';
      textClass = 'text-dark';
      break;
  }

  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  if (currentTheme === 'dark') {
    if (bgClass === 'bg-warning' || bgClass === 'bg-info') {
      // In dark mode, light text might be better on warning/info backgrounds
      // textClass = 'text-white';
    }
  } else {
    // In light mode, ensure dark text on warning/info
    if (bgClass === 'bg-warning' || bgClass === 'bg-info') {
      textClass = 'text-dark';
    }
  }

  toastEl.classList.add(bgClass, textClass);
  toastHeader.classList.add(textClass);

  toastBody.textContent = message;
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl);
  toastInstance.show();
}

export function checkAdminLogin() {
  const isAdminLoggedIn = isAdmin();
  if (isAdminLoggedIn !== true) {
    // setQueryParam('redirect', value);
    window.location.href = '/login.html';
  }
}

export function logoutAdmin() {
  logout();
  window.location.href = '/login.html';
}

/**
 * Formats a date string or Date object into YYYY-MM-DD format.
 * @param {string|Date} dateInput
 * @returns {string} Formatted date or empty string if invalid.
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    // Adjust for potential timezone offset if the input is just a date string
    const adjustedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    if (isNaN(adjustedDate.getTime())) return '';

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Error formatting date:', dateInput, e);
    return '';
  }
}

/**
 * Formats a date string or Date object into a locale-aware date and time string.
 * Example: "Sep 10, 2024, 10:00 AM"
 * @param {string|Date} dateTimeInput
 * @returns {string} Formatted date and time or empty string if invalid.
 */
export function formatDateTime(dateTimeInput) {
  if (!dateTimeInput) return '';
  try {
    const date = new Date(dateTimeInput);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString(undefined, {
      // Use browser's default locale
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // Use AM/PM
    });
  } catch (e) {
    console.error('Error formatting date/time:', dateTimeInput, e);
    return '';
  }
}

/**
 * Formats a number as currency (e.g., USD).
 * @param {number} amount The amount to format.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return amount.toFixed(2);
}

/**
 * Basic form validation using Bootstrap's built-in classes.
 * Adds 'was-validated' class and returns checkValidity result.
 * @param {HTMLFormElement} formElement The form to validate.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
export function validateForm(formElement) {
  formElement.classList.add('was-validated');
  return formElement.checkValidity();
}

/**
 * Resets Bootstrap validation classes and any custom error messages on a form.
 * @param {HTMLFormElement} formElement The form to reset.
 */
export function resetFormValidation(formElement) {
  formElement.classList.remove('was-validated');
  formElement.querySelectorAll('.is-invalid, .is-valid').forEach((el) => {
    el.classList.remove('is-invalid', 'is-valid');
  });
  // Optional: Clear custom error messages if you add any dynamically
  formElement.querySelectorAll('.custom-error-message').forEach((el) => {
    el.textContent = ''; // Or el.remove()
  });
}

/**
 * Toggles the admin sidebar.
 */
export function toggleSidebar() {
  const wrapper = document.getElementById('wrapper');
  if (wrapper) {
    wrapper.classList.toggle('toggled');
  }
}

/**
 * Attaches event listeners for common admin UI elements like sidebar toggle and logout.
 * Also attaches the theme toggler listener.
 */
export function setupAdminLayoutListeners() {
  const menuToggle = document.getElementById('menu-toggle');
  const logoutButton = document.getElementById('logout-button');

  if (menuToggle) {
    // Ensure listener isn't attached multiple times
    if (!menuToggle.dataset.toggleListenerAttached) {
      menuToggle.addEventListener('click', toggleSidebar);
      menuToggle.dataset.toggleListenerAttached = 'true';
    }
  }

  if (logoutButton) {
    // Ensure listener isn't attached multiple times
    if (!logoutButton.dataset.logoutListenerAttached) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logoutAdmin();
      });
      logoutButton.dataset.logoutListenerAttached = 'true';
    }
  }
}
