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
/**
/**
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

  toastEl.classList.add(bgClass, textClass);
  toastHeader.classList.add(textClass);

  toastBody.textContent = message;
  const toastInstance = new bootstrap.Toast(toastEl);
  toastInstance.show();
}

export function checkAdminLogin() {
  const isAdminLoggedIn = isAdmin();
  if (isAdminLoggedIn !== 'true') {
    window.location.href = '/login.html?redirect=' + location.href;
  }
}

export function logoutAdmin() {
  logout();
  window.location.href = '/';
}

/**
/**
 * Resets Bootstrap validation classes on a form.
 * @param {HTMLFormElement} formElement The form to reset.
 */
export function resetFormValidation(formElement) {
  formElement.classList.remove('was-validated');
  formElement.querySelectorAll('.is-invalid, .is-valid').forEach((el) => {
    el.classList.remove('is-invalid', 'is-valid');
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
    menuToggle.addEventListener('click', toggleSidebar);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      logoutAdmin();
    });
  }

  attachThemeToggler();
}
