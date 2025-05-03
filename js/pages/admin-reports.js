import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
} from '../utils/helpers.js';
import { getCars } from '../modules/cars.js';
import { getBookings } from '../modules/bookings.js';
import { getUsers as getAllUsers } from '../modules/users.js';

let statusChartInstance = null;
let typeChartInstance = null;

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

    // --- Booking Status ---
    const statusCounts = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalBookings = bookings.length;
    document.getElementById('report-total-bookings-badge').textContent =
      `Total: ${totalBookings}`;
    renderBookingStatusChart(statusCounts);

    // --- Car Types ---
    const typeCounts = cars.reduce((acc, car) => {
      const type = car.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const totalCars = cars.length;
    document.getElementById('report-total-cars-badge').textContent =
      `Total: ${totalCars}`;
    renderCarTypesChart(typeCounts);

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

    const bookedCarTypeCounts = bookings.reduce((acc, booking) => {
      const carType = booking.carDetails?.type;
      if (carType) {
        acc[carType] = (acc[carType] || 0) + 1;
      }
      return acc;
    }, {});

    let popularType = 'N/A';
    let maxBookings = 0;
    if (Object.keys(bookedCarTypeCounts).length > 0) {
      popularType = Object.entries(bookedCarTypeCounts).reduce(
        (popular, [type, count]) => {
          if (count > maxBookings) {
            maxBookings = count;
            return type;
          }
          return popular;
        },
        Object.keys(bookedCarTypeCounts)[0]
      );
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
    document.getElementById('report-total-bookings-badge').textContent =
      `Total: Err`;
    document.getElementById('report-total-cars-badge').textContent =
      `Total: Err`;
    document.getElementById('report-bookings-this-month').textContent = 'Err';
    document.getElementById('report-avg-duration').textContent = 'Err';
    document.getElementById('report-popular-type').textContent = 'Err';
    document.getElementById('report-total-users').textContent = 'Err';
    document.getElementById('report-verified-users').textContent = 'Err';
  }
}

function renderBookingStatusChart(statusCounts) {
  const ctx = document.getElementById('bookingsStatusChart')?.getContext('2d');
  if (!ctx) return;

  // Destroy previous chart instance if it exists
  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  const labels = ['Confirmed', 'Pending', 'Cancelled', 'Unknown'];
  const data = [
    statusCounts.confirmed || 0,
    statusCounts.pending || 0,
    statusCounts.cancelled || 0,
    statusCounts.unknown || 0,
  ];
  const backgroundColors = ['#198754', '#ffc107', '#dc3545', '#6c757d'];

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Booking Status',
          data: data,
          backgroundColor: backgroundColors,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: false,
        },
      },
    },
  });
}

function renderCarTypesChart(typeCounts) {
  const ctx = document.getElementById('carTypesChart')?.getContext('2d');
  if (!ctx) return;

  if (typeChartInstance) {
    typeChartInstance.destroy();
  }

  const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a); // Sort by count desc
  const labels = sortedTypes.map(([type]) => type);
  const data = sortedTypes.map(([, count]) => count);

  typeChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Number of Cars',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    },
  });
}
