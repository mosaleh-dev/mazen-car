import { getBookings } from '../modules/bookings.js';
import {
  formatCurrency,
  formatDateTime,
  attachThemeToggler,
} from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  attachThemeToggler();
  displayBookingHistory();
});

function displayBookingHistory() {
  const container = document.getElementById('booking-history-container');
  const noBookingsMessage = document.getElementById('no-bookings');
  const loadingPlaceholder = document.getElementById('loading-placeholder');
  if (!container || !noBookingsMessage || !loadingPlaceholder) return;

  noBookingsMessage.classList.add('d-none');
  loadingPlaceholder.classList.remove('d-none');
  container.innerHTML = '';

  setTimeout(() => {
    const bookings = getBookings();

    bookings.sort(
      (a, b) =>
        new Date(`${b.pickupDate}T${b.pickupTime}`) -
        new Date(`${a.pickupDate}T${a.pickupTime}`)
    );

    loadingPlaceholder.classList.add('d-none');

    if (bookings.length === 0) {
      noBookingsMessage.classList.remove('d-none');
      return;
    }

    bookings.forEach((booking) => {
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
                                <p class="card-text text-muted-slight small mb-2">Booking ID: <span class="booking-id">${booking.id.substring(0, 8)}...</span></p> <!-- Shorten ID -->
                                <hr class="my-2">
                                <div class="row">
                                    <div class="col-sm-6 mb-2 mb-sm-0">
                                        <p class="card-text mb-1"><small><strong>Pickup:</strong> <span class="booking-pickup">${formatDateTime(new Date(`${booking.pickupDate}T${booking.pickupTime}`))}</span></small></p>
                                        <p class="card-text mb-1"><small><strong>Drop-off:</strong> <span class="booking-dropoff">${formatDateTime(new Date(`${booking.dropoffDate}T${booking.dropoffTime}`))}</span></small></p>
                                    </div>
                                    <div class="col-sm-6">
                                        <p class="card-text mb-1"><small><strong>Customer:</strong> ${booking.customerName}</small></p>
                                        <p class="card-text mb-1"><small><strong>Total Cost:</strong> <span class="booking-cost fw-bold">$${formatCurrency(booking.totalCost)}</span></small></p>
                                    </div>
                                </div>
                                <!-- Add cancel button for pending/confirmed bookings? -->
                                <!--
                                ${
                                  booking.status === 'pending' ||
                                  booking.status === 'confirmed'
                                    ? `<button class="btn btn-sm btn-outline-danger mt-2 float-end cancel-booking-btn" data-booking-id="${booking.id}">Cancel Booking</button>`
                                    : ''
                                }
                                -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
      container.insertAdjacentHTML('beforeend', bookingCard);
    });

    // Add event listener for cancel buttons if they were added
    // container.querySelectorAll('.cancel-booking-btn').forEach(button => {
    //     button.addEventListener('click', handleCancelBooking);
    // });
  }, 500);
}

// function handleCancelBooking(event) {
//     const bookingId = event.target.getAttribute('data-booking-id');
//     if (!bookingId) return;
//
//     if (confirm(`Are you sure you want to cancel booking ${bookingId.substring(0, 8)}...?`)) {
//         try {
//             const updated = updateBookingStatus(bookingId, 'cancelled');
//             if (updated) {
//                 showToast('Booking cancelled successfully.', 'success', 'app-toast');
//                 displayBookingHistory();
//             } else {
//                 showToast('Failed to cancel booking.', 'error', 'app-toast');
//             }
//         } catch (error) {
//             console.error("Error cancelling booking:", error);
//             showToast(`Error: ${error.message}`, 'error', 'app-toast');
//         }
//     }
// }

function getStatusBadge(status) {
  switch (
    status?.toLowerCase() // Add null check
  ) {
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
