import { getCarById } from '../modules/cars.js';
import { addBooking } from '../modules/bookings.js';
import {
  getQueryParam,
  formatCurrency,
  showToast,
  validateForm,
  resetFormValidation,
  formatDate,
  formatDateTime,
  attachThemeToggler,
} from '../utils/helpers.js';

let currentCar = null;
let carRentPerDay = 0;
let carId = null;

let bookedDates = [];
let disabledDates = [];
let fp = null;

document.addEventListener('DOMContentLoaded', () => {
  attachThemeToggler();

  const bookingForm = document.getElementById('booking-form');
  carId = getQueryParam('carId');

  if (!carId) {
    displayError('No car selected. Please go back and choose a car.');
    return;
  }

  currentCar = getCarById(carId);

  if (!currentCar) {
    displayError(
      'Selected car details could not be loaded or the car does not exist.'
    );
    return;
  }
  if (!currentCar.availability) {
    displayError(
      `Sorry, the ${currentCar.brand} ${currentCar.model} is currently unavailable for booking.`
    );
    bookingForm
      ?.querySelector('button[type="submit"]')
      .setAttribute('disabled', 'true');
    return;
  }

  loadCarSummary();

  bookingForm
    ?.querySelectorAll('input[type="date"], input[type="time"]')
    .forEach((input) => {
      input.addEventListener('change', updateBookingSummary);
    });

  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  // Load bookedDates for this carId
  bookedDates = JSON.parse(localStorage.getItem(`bookedDates${carId}`)) || [];
  disabledDates = [];
  bookedDates.forEach((range) => {
    disabledDates = [
      ...disabledDates,
      ...getDatesBetween(range.from, range.to),
    ];
  });

  // Initialize Flatpickr
  fp = flatpickr('#date-range', {
    mode: 'range',
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'F j, Y',
    minDate: 'today',
    disable: disabledDates,
    static: true,
    onClose: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        instance.element.dispatchEvent(new Event('change'));
        const altInput = instance.altInput;
      }
    },
  });
});

function loadCarSummary() {
  const summaryContainer = document.getElementById('car-summary');
  if (!summaryContainer || !currentCar) return;

  carRentPerDay = currentCar.rentPerDay;

  const cardBody = summaryContainer.querySelector('.card-body');
  cardBody.classList.remove('placeholder-glow');

  const imageUrl =
    currentCar.imageUrl ||
    `https://placehold.co/300x200.webp?text=${encodeURIComponent(currentCar.brand + ' ' + currentCar.model)}`;

  cardBody.innerHTML = `
        <img src="${imageUrl}" class="img-fluid rounded mb-3" alt="${currentCar.brand} ${currentCar.model}">
        <h5 class="card-title">${currentCar.brand} ${currentCar.model}</h5>
        <p class="card-text"><span class="badge bg-secondary">${currentCar.type}</span></p>
        <hr>
        <p><strong>Pickup:</strong> <span id="summary-pickup">Select date & time</span></p>
        <p><strong>Drop-off:</strong> <span id="summary-dropoff">Select date & time</span></p>
        <p><strong>Duration:</strong> <span id="summary-duration">--</span> days</p>
        <p><strong>Rate:</strong> $<span id="summary-rate">${formatCurrency(carRentPerDay)}</span>/day</p>
        <hr>
        <h5 class="mb-0">Total Cost: $<span id="summary-total">--.--</span></h5>
    `;
}

function updateBookingSummary() {
  const dateRange = document.getElementById('date-range').value;
  const [pickupDate, dropoffDate] = dateRange.split(' to ');
  const pickupTime = document.getElementById('pickupTime').value;
  const dropoffTime = document.getElementById('dropoffTime').value;

  const pickupDateTime =
    pickupDate && pickupTime ? new Date(`${pickupDate}T${pickupTime}`) : null;
  const dropoffDateTime =
    dropoffDate && dropoffTime
      ? new Date(`${dropoffDate}T${dropoffTime}`)
      : null;

  const summaryPickup = document.getElementById('summary-pickup');
  const summaryDropoff = document.getElementById('summary-dropoff');
  const summaryDuration = document.getElementById('summary-duration');
  const summaryTotal = document.getElementById('summary-total');

  if (summaryPickup)
    summaryPickup.textContent = pickupDateTime
      ? formatDateTime(pickupDateTime)
      : 'Select date & time';
  if (summaryDropoff)
    summaryDropoff.textContent = dropoffDateTime
      ? formatDateTime(dropoffDateTime)
      : 'Select date & time';

  const dropoffDateInput = document.getElementById('dropoffDate');
  if (dropoffDateTime && pickupDateTime && dropoffDateTime > pickupDateTime) {
    dropoffDateInput?.classList.remove('is-invalid');
  }

  if (pickupDateTime && dropoffDateTime && dropoffDateTime > pickupDateTime) {
    const durationMillis = dropoffDateTime - pickupDateTime;
    const durationDays = Math.max(
      1,
      Math.ceil(durationMillis / (1000 * 60 * 60 * 24))
    );

    if (summaryDuration) summaryDuration.textContent = durationDays;

    const totalCost = durationDays * carRentPerDay;
    if (summaryTotal) summaryTotal.textContent = formatCurrency(totalCost);
  } else {
    if (summaryDuration) summaryDuration.textContent = '--';
    if (summaryTotal) summaryTotal.textContent = '--.--';
  }
}

function handleBookingSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = event.target;
  if (!currentCar || !currentCar.availability) {
    showToast('Cannot book unavailable car.', 'error', 'booking-toast');
    return;
  }

  if (!validateForm(form)) {
    showToast(
      'Please fill in all required fields correctly.',
      'warning',
      'booking-toast'
    );
    return;
  }

  const dateRange = document.getElementById('date-range').value;
  const [pickupDate, dropoffDate] = dateRange.split(' to ');
  const pickupTime = document.getElementById('pickupTime').value;
  const dropoffTime = document.getElementById('dropoffTime').value;
  const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
  const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}`);
  const durationMillis = dropoffDateTime - pickupDateTime;
  const durationDays = Math.max(
    1,
    Math.ceil(durationMillis / (1000 * 60 * 60 * 24))
  );
  const totalCost = durationDays * carRentPerDay;
  const bookingData = {
    carId: currentCar.id,
    customerName: document.getElementById('customerName').value,
    customerEmail: document.getElementById('customerEmail').value,
    pickupDate: pickupDate,
    pickupTime: pickupTime,
    dropoffDate: dropoffDate,
    dropoffTime: dropoffTime,
    totalCost: totalCost,
  };

  try {
    const newBooking = addBooking(bookingData);
    displayConfirmation(newBooking);
    resetFormValidation(form);
    form.reset();
    document.getElementById('summary-pickup').textContent =
      'Select date & time';
    document.getElementById('summary-dropoff').textContent =
      'Select date & time';
    document.getElementById('summary-duration').textContent = '--';
    document.getElementById('summary-total').textContent = '--.--';
  } catch (error) {
    console.error('Error adding booking:', error);
    showToast(`Booking failed: ${error.message}`, 'error', 'booking-toast');
  }
}

function displayConfirmation(booking) {
  const bookingSection = document.getElementById('booking-section');
  const confirmationSection = document.getElementById('confirmation-section');
  const summaryConfirmation = document.getElementById(
    'booking-summary-confirmation'
  );

  if (bookingSection) bookingSection.classList.add('d-none');
  if (confirmationSection) confirmationSection.classList.remove('d-none');

  bookDates();

  if (summaryConfirmation && booking && currentCar) {
    summaryConfirmation.innerHTML = `
            <p><strong>Booking ID:</strong> ${booking.id.substring(0, 8)}...</p>
            <p><strong>Car:</strong> ${currentCar.brand} ${currentCar.model}</p>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Pickup:</strong> ${formatDateTime(new Date(`${booking.pickupDate}T${booking.pickupTime}`))}</p>
            <p><strong>Drop-off:</strong> ${formatDateTime(new Date(`${booking.dropoffDate}T${booking.dropoffTime}`))}</p>
            <p><strong>Total Cost:</strong> $${formatCurrency(booking.totalCost)}</p>
            <p><strong>Status:</strong> <span class="badge bg-warning text-dark">${booking.status.toUpperCase()}</span></p>
        `;
  }
}

function displayError(message) {
  const bookingSection = document.getElementById('booking-section');
  if (bookingSection) {
    bookingSection.innerHTML = `<div class="alert alert-danger">${message} <a href="cars.html">Return to Cars List</a></div>`;
  }
  document.getElementById('confirmation-section')?.classList.add('d-none');
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate).toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

function bookDates() {
  if (fp.selectedDates.length !== 2) {
    console.error('Invalid date range');
    alert('Please select a valid date range.');
    return;
  }

  const startDate = fp.selectedDates[0];
  const endDate = fp.selectedDates[1];
  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    console.error('Invalid date range:', { startDate, endDate });
    alert('Invalid date range selected.');
    return;
  }

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const newBooking = {
    from: formatDateToString(startDate),
    to: formatDateToString(endDate),
  };

  bookedDates.push(newBooking);
  localStorage.setItem(`bookedDates${carId}`, JSON.stringify(bookedDates));
  disabledDates = [
    ...disabledDates,
    ...getDatesBetween(newBooking.from, newBooking.to),
  ];
  fp.set('disable', disabledDates);
  fp.clear();
}
