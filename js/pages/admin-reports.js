import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
} from '../utils/helpers.js';
import { getCars } from '../modules/cars.js';
import { getBookings } from '../modules/bookings.js';
import { getUsers as getAllUsers } from '../modules/users.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  setupAdminLayoutListeners();
  generateReports();
});

function generateReports() {
  try {
    const cars = getCars();
    const bookings = getBookings();
    const users = getAllUsers();

    const statusCounts = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    document.getElementById('report-confirmed-count').textContent =
      statusCounts.confirmed || 0;
    document.getElementById('report-pending-count').textContent =
      statusCounts.pending || 0;
    document.getElementById('report-cancelled-count').textContent =
      statusCounts.cancelled || 0;
    document.getElementById('report-total-bookings').textContent =
      bookings.length;

    const typeCounts = cars.reduce((acc, car) => {
      const type = car.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const carTypesList = document.getElementById('report-car-types-list');
    carTypesList.innerHTML = '';
    if (Object.keys(typeCounts).length > 0) {
      Object.entries(typeCounts)
        .sort()
        .forEach(([type, count]) => {
          const listItem = `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${type}
                        <span class="badge bg-primary rounded-pill">${count}</span>
                    </li>`;
          carTypesList.insertAdjacentHTML('beforeend', listItem);
        });
    } else {
      carTypesList.innerHTML =
        '<li class="list-group-item text-center">No car types found.</li>';
    }
    document.getElementById('report-total-cars').textContent = cars.length;

    // --- General Stats ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const bookingsThisMonth = bookings.filter((booking) => {
      try {
        const pickupDate = new Date(booking.pickupDate);
        return (
          pickupDate.getMonth() === currentMonth &&
          pickupDate.getFullYear() === currentYear
        );
      } catch (e) {
        return false;
      }
    }).length;
    document.getElementById('report-bookings-this-month').textContent =
      bookingsThisMonth;

    let totalDurationDays = 0;
    let validBookingsForDuration = 0;
    bookings.forEach((b) => {
      try {
        const pickup = new Date(`${b.pickupDate}T${b.pickupTime}`);
        const dropoff = new Date(`${b.dropoffDate}T${b.dropoffTime}`);
        if (
          !isNaN(pickup.getTime()) &&
          !isNaN(dropoff.getTime()) &&
          dropoff > pickup
        ) {
          const durationMillis = dropoff - pickup;
          const durationDays = Math.max(
            1,
            Math.ceil(durationMillis / (1000 * 60 * 60 * 24))
          ); // Min 1 day
          totalDurationDays += durationDays;
          validBookingsForDuration++;
        }
      } catch (e) {
        console.warn('Could not parse dates for duration calculation', b);
      }
    });
    const avgDuration =
      validBookingsForDuration > 0
        ? (totalDurationDays / validBookingsForDuration).toFixed(1)
        : 'N/A';
    document.getElementById('report-avg-duration').textContent = avgDuration;

    // Most popular car type based on *bookings*
    const bookedCarTypeCounts = bookings.reduce((acc, booking) => {
      const carType = booking.carDetails?.type;
      if (carType) {
        acc[carType] = (acc[carType] || 0) + 1;
      }
      return acc;
    }, {});

    let popularType = 'N/A';
    let maxBookings = 0;
    for (const [type, count] of Object.entries(bookedCarTypeCounts)) {
      if (count > maxBookings) {
        maxBookings = count;
        popularType = type;
      }
    }
    document.getElementById('report-popular-type').textContent = popularType;

    // --- User Stats ---
    const totalUsers = users.length;
    const verifiedUsers = users.filter((user) => user.verified).length;
    document.getElementById('report-total-users').textContent = totalUsers;
    document.getElementById('report-verified-users').textContent =
      verifiedUsers;
  } catch (error) {
    console.error('Error generating reports:', error);
    showToast('Could not generate reports.', 'error', 'admin-toast');
    // Set all report fields to 'Err' on failure
    document.getElementById('report-confirmed-count').textContent = 'Err';
    document.getElementById('report-pending-count').textContent = 'Err';
    document.getElementById('report-cancelled-count').textContent = 'Err';
    document.getElementById('report-total-bookings').textContent = 'Err';
    document.getElementById('report-car-types-list').innerHTML =
      '<li class="list-group-item text-danger">Error loading data</li>';
    document.getElementById('report-total-cars').textContent = 'Err';
    document.getElementById('report-bookings-this-month').textContent = 'Err';
    document.getElementById('report-avg-duration').textContent = 'Err';
    document.getElementById('report-popular-type').textContent = 'Err';
    document.getElementById('report-total-users').textContent = 'Err';
    document.getElementById('report-verified-users').textContent = 'Err';
  }
}
