import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
} from '../utils/helpers.js';
import { getCars } from '../modules/cars.js';
import { getBookings } from '../modules/bookings.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  setupAdminLayoutListeners();
  loadDashboardStats();
  const themeDisplay = document.getElementById('current-theme-display');
  if (themeDisplay) {
    const currentTheme =
      document.documentElement.getAttribute('data-bs-theme') || 'light';
    themeDisplay.textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
  }
});

function loadDashboardStats() {
  const totalCarsStat = document.getElementById('total-cars-stat');
  const totalBookingsStat = document.getElementById('total-bookings-stat');
  const pendingBookingsStat = document.getElementById('pending-bookings-stat');

  try {
    const cars = getCars();
    const bookings = getBookings();

    const pendingBookings = bookings.filter((b) => b.status === 'pending');

    if (totalCarsStat) totalCarsStat.textContent = cars.length;
    if (totalBookingsStat) totalBookingsStat.textContent = bookings.length;
    if (pendingBookingsStat)
      pendingBookingsStat.textContent = pendingBookings.length;
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Could not load dashboard statistics.', 'error', 'admin-toast');
    if (totalCarsStat) totalCarsStat.textContent = 'Error';
    if (totalBookingsStat) totalBookingsStat.textContent = 'Error';
    if (pendingBookingsStat) pendingBookingsStat.textContent = 'Error';
  }
}
