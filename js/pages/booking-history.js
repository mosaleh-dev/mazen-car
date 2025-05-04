import { getBookings } from '../modules/bookings.js';
import { isLoggedIn, getCurrentUser } from '../modules/auth.js';
import {
  formatCurrency,
  formatDateTime,
  attachThemeToggler,
} from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  attachThemeToggler();

  if (!isLoggedIn()) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }

  displayBookingHistory();
});

function displayBookingHistory() {
  const container = document.getElementById('booking-history-container');
  const noBookingsMessage = document.getElementById('no-bookings');
  const loadingPlaceholder = document.getElementById('loading-placeholder');
  if (!container || !noBookingsMessage || !loadingPlaceholder) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('Could not retrieve current user data.');
    noBookingsMessage.textContent =
      'Error loading your bookings. Please try logging in again.';
    noBookingsMessage.classList.remove('d-none');
    loadingPlaceholder.classList.add('d-none');
    return;
  }

  noBookingsMessage.classList.add('d-none');
  loadingPlaceholder.classList.remove('d-none');
  container.innerHTML = '';

  const allBookings = getBookings();
  const userBookings = allBookings.filter(
    (booking) => booking.userId === currentUser.id
  );
  userBookings.sort(
    (a, b) =>
      new Date(`${b.pickupDate}T${b.pickupTime}`) -
      new Date(`${a.pickupDate}T${a.pickupTime}`)
  );

  loadingPlaceholder.classList.add('d-none');

  if (userBookings.length === 0) {
    noBookingsMessage.classList.remove('d-none');
    return;
  }

  userBookings.forEach((booking) => {
    const statusBadge = getStatusBadge(booking.status);
    const car = booking.carDetails;
    const imageUrl =
      car?.imageUrl || `https://placehold.co/150x100.webp?text=No+Image`;
    const carName = car ? `${car.brand} ${car.model}` : 'Unknown Car';

    const bookingCard = `
                <div class="card mb-4 shadow-sm booking-card">
                    <div class="row g-0">
                        <div class="col-md-3 text-center bg-light p-2 d-flex align-items-center justify-content-center">
                            <img src="${imageUrl}" class="img-fluid rounded" alt="${carName}" style="max-height: 120px; object-fit: contain;">
                        </div>
                        <div class="col-md-9">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="card-title mb-1">${carName}</h5>
                                    <span class="badge ${statusBadge.class} booking-status">${statusBadge.text}</span>
                                </div>
                                <p class="card-text text-muted-slight small mb-2">Booking ID: <span class="booking-id">${booking.id.substring(0, 8)}...</span></p>
                                <hr class="my-2">
                                <div class="row">
                                    <div class="col-sm-6 mb-2 mb-sm-0">
                                        <p class="card-text mb-1"><small><strong>Pickup:</strong> <span class="booking-pickup">${formatDateTime(new Date(`${booking.pickupDate}T${booking.pickupTime}`))}</span></small></p>
                                        <p class="card-text mb-1"><small><strong>Drop-off:</strong> <span class="booking-dropoff">${formatDateTime(new Date(`${booking.dropoffDate}T${booking.dropoffTime}`))}</span></small></p>
                                    </div>
                                    <div class="col-sm-6">
                                        <!-- Customer name is implicitly the logged-in user -->
                                        <p class="card-text mb-1"><small><strong>Total Cost:</strong> <span class="booking-cost fw-bold">$${formatCurrency(booking.totalCost)}</span></small></p>
                                    </div>
                                </div>
                                <!-- Optional: Cancel button logic can be added here if needed -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
    container.insertAdjacentHTML('beforeend', bookingCard);
  });
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { class: 'bg-success', text: 'Confirmed' };
    case 'pending':
      return { class: 'bg-warning text-dark', text: 'Pending' };
    case 'cancelled':
      return { class: 'bg-danger', text: 'Cancelled' };
    default:
      return { class: 'bg-secondary', text: 'Unknown' };
  }
}
