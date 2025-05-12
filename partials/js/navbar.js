import {
  isLoggedIn,
  isAdmin,
  logout,
  getCurrentUser,
} from '../../js/modules/auth.js';
import { attachThemeToggler } from '../../js/utils/helpers.js';
function updateNavbar() {
  const authNavItemsContainer = document.getElementById('auth-nav-items');
  if (!authNavItemsContainer) {
    console.error('Auth nav items container (#auth-nav-items) not found.');
    return;
  }
  authNavItemsContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  if (isLoggedIn()) {
    const user = getCurrentUser();
    const userName = user?.firstName || 'Account';

    const dropdownLi = document.createElement('li');
    dropdownLi.className = 'nav-item dropdown';

    const dropdownToggle = document.createElement('a');
    dropdownToggle.className = 'nav-link dropdown-toggle';
    dropdownToggle.href = '#';
    dropdownToggle.id = 'navbarDropdownAuthLink';
    dropdownToggle.role = 'button';
    dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
    dropdownToggle.setAttribute('aria-expanded', 'false');
    dropdownToggle.textContent = `Welcome, ${userName}`;

    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
    dropdownMenu.setAttribute('aria-labelledby', 'navbarDropdownAuthLink');

    const bookingsLi = document.createElement('li');
    bookingsLi.innerHTML = `<a class="dropdown-item" href="/booking-history.html">My Bookings</a>`;
    dropdownMenu.appendChild(bookingsLi);

    if (isAdmin()) {
      const adminLi = document.createElement('li');
      adminLi.innerHTML = `<a class="dropdown-item" href="/admin-dashboard.html">Admin Dashboard</a>`;
      dropdownMenu.appendChild(adminLi);
    }

    const separatorLi = document.createElement('li');
    separatorLi.innerHTML = '<hr class="dropdown-divider">';
    dropdownMenu.appendChild(separatorLi);

    const logoutLi = document.createElement('li');
    const logoutLink = document.createElement('a');
    logoutLink.className = 'dropdown-item';
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = '/index.html';
    });
    logoutLi.appendChild(logoutLink);
    dropdownMenu.appendChild(logoutLi);

    dropdownLi.appendChild(dropdownToggle);
    dropdownLi.appendChild(dropdownMenu);
    fragment.appendChild(dropdownLi);
  } else {
    const loginLi = document.createElement('li');
    loginLi.className = 'nav-item';
    loginLi.innerHTML = `<a class="nav-link" href="/login.html">Login</a>`;
    fragment.appendChild(loginLi);

    const signupLi = document.createElement('li');
    signupLi.className = 'nav-item ms-2';
    signupLi.innerHTML = `<a class="btn btn-outline-primary btn-sm" href="/signup.html">Sign Up</a>`;
    fragment.appendChild(signupLi);
  }

  authNavItemsContainer.appendChild(fragment);
}
updateNavbar();
