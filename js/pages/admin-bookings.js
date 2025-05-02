import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
  formatCurrency,
  formatDateTime,
  formatDate,
} from '../utils/helpers.js';
import {
  getBookings,
  updateBookingStatus,
  getBookingById,
} from '../modules/bookings.js';

let statusChangeModalInstance = null;
let bookingToUpdateId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  setupAdminLayoutListeners();

  const statusModalEl = document.getElementById('statusChangeModal');
  if (statusModalEl) {
    statusChangeModalInstance = new bootstrap.Modal(statusModalEl);
  }

  document
    .getElementById('bookings-table-body')
    ?.addEventListener('click', handleTableActionClick);
  document
    .getElementById('confirmStatusChangeButton')
    ?.addEventListener('click', handleConfirmStatusChange);
  document
    .getElementById('booking-filter-form')
    ?.addEventListener('submit', handleFilterSubmit);
  document
    .getElementById('reset-booking-filters')
    ?.addEventListener('click', handleResetFilters);

  applyUrlFiltersAndLoadTable();
});

function applyUrlFiltersAndLoadTable() {
  const statusParam = new URLSearchParams(window.location.search).get('status');
  const filterStatusSelect = document.getElementById('filterBookingStatus');

  if (statusParam && filterStatusSelect) {
    filterStatusSelect.value = statusParam;
  }

  loadBookingsTable();
}

function handleFilterSubmit(event) {
  event.preventDefault();
  loadBookingsTable();
}

function handleResetFilters() {
  const form = document.getElementById('booking-filter-form');
  if (form) {
    form.reset();
  }
  window.history.replaceState({}, document.title, window.location.pathname);
  loadBookingsTable();
}

function loadBookingsTable() {
  const tableBody = document.getElementById('bookings-table-body');
  const noBookingsMessage = document.getElementById('no-bookings-message');
  if (!tableBody || !noBookingsMessage) return;

  const filterStatus =
    document.getElementById('filterBookingStatus')?.value || '';
  const filterDate = document.getElementById('filterBookingDate')?.value || '';

  let bookings = getBookings();

  if (filterStatus) {
    bookings = bookings.filter((b) => b.status === filterStatus);
  }
  if (filterDate) {
    bookings = bookings.filter((b) => formatDate(b.pickupDate) === filterDate);
  }

  bookings.sort(
    (a, b) =>
      new Date(`${b.pickupDate}T${b.pickupTime}`) -
      new Date(`${a.pickupDate}T${a.pickupTime}`)
  );

  tableBody.innerHTML = '';

  if (bookings.length === 0) {
    noBookingsMessage.classList.remove('d-none');
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No bookings found matching the criteria.</td></tr>`;
    return;
  }

  noBookingsMessage.classList.add('d-none');
  const fragment = document.createDocumentFragment();

  bookings.forEach((booking) => {
    const statusBadge = getStatusBadgeAdmin(booking.status);
    const car = booking.carDetails;
    const carDisplay = car
      ? `${car.brand} ${car.model} (ID: ${booking.carId.substring(0, 6)}...)`
      : `Car ID: ${booking.carId.substring(0, 6)}...`;

    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${booking.id.substring(0, 8)}...</td>
            <td>${booking.customerName}<br><small class="text-muted">${booking.customerEmail}</small></td>
            <td>${carDisplay}</td>
            <td>${formatDateTime(new Date(`${booking.pickupDate}T${booking.pickupTime}`))}</td>
            <td>${formatDateTime(new Date(`${booking.dropoffDate}T${booking.dropoffTime}`))}</td>
            <td>${formatCurrency(booking.totalCost)}</td>
            <td><span class="badge ${statusBadge.class}">${statusBadge.text}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning change-status-button" data-id="${booking.id}" title="Change Status">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                 <!-- Add view details button or other actions if needed -->
            </td>
        `;
    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
}

function handleTableActionClick(event) {
  const target = event.target.closest('button');
  if (!target) return;

  const bookingId = target.getAttribute('data-id');

  if (target.classList.contains('change-status-button')) {
    if (bookingId) handleStatusChangeClick(bookingId);
  }
}

function handleStatusChangeClick(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking || !statusChangeModalInstance) return;

  bookingToUpdateId = bookingId;

  document.getElementById('statusChangeBookingId').textContent =
    booking.id.substring(0, 8) + '...';
  document.getElementById('statusChangeCustomerInfo').textContent =
    booking.customerName;
  const car = booking.carDetails;
  document.getElementById('statusChangeCarInfo').textContent = car
    ? `${car.brand} ${car.model}`
    : 'Unknown Car';
  document.getElementById('newBookingStatus').value = booking.status; // Set current status

  statusChangeModalInstance.show();
}

function handleConfirmStatusChange() {
  if (!bookingToUpdateId || !statusChangeModalInstance) return;

  const newStatus = document.getElementById('newBookingStatus').value;

  try {
    const updatedBooking = updateBookingStatus(bookingToUpdateId, newStatus);
    if (updatedBooking) {
      showToast(
        `Booking ${bookingToUpdateId.substring(0, 8)}... status updated to ${newStatus}.`,
        'success',
        'admin-toast'
      );
      loadBookingsTable(); // Refresh the table
    } else {
      showToast(
        'Failed to update booking status. Booking might not exist or status invalid.',
        'error',
        'admin-toast'
      );
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    showToast(
      `Error updating status: ${error.message}`,
      'error',
      'admin-toast'
    );
  } finally {
    statusChangeModalInstance.hide();
    bookingToUpdateId = null; // Reset ID
  }
}

function getStatusBadgeAdmin(status) {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { class: 'bg-confirmed', text: 'Confirmed' };
    case 'pending':
      return { class: 'bg-pending', text: 'Pending' };
    case 'cancelled':
      return { class: 'bg-cancelled', text: 'Cancelled' };
    default:
      return { class: 'bg-secondary', text: 'Unknown' };
  }
}
