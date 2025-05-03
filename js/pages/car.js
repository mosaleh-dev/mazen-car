import { getCarById } from '../modules/cars.js';
import {
  getQueryParam,
  formatCurrency,
  attachThemeToggler,
} from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  attachThemeToggler();
  displayCarDetails();
});

function displayCarDetails() {
  const container = document.getElementById('car-details-container');
  if (!container) return;

  const carId = getQueryParam('id');
  if (!carId) {
    container.innerHTML =
      '<div class="alert alert-danger">Error: Car ID not provided in the URL.</div>';
    return;
  }

  const car = getCarById(carId);

  if (!car) {
    container.innerHTML =
      '<div class="alert alert-warning">Sorry, the requested car could not be found.</div>';
    return;
  }

  container.innerHTML = '';

  const detailsHtml = `
        <div class="col-lg-7 mb-4">
            <img src="${car.imageUrl || 'https://placehold.co/600x400.webp?text=No+Image'}" class="img-fluid rounded shadow-sm" alt="${car.brand} ${car.model}">
        </div>
        <div class="col-lg-5">
            <span class="badge bg-secondary mb-2">${car.type}</span>
            <h1>${car.brand} ${car.model}</h1>
            <p class="lead mb-4">$${formatCurrency(car.rentPerDay)}<span class="fs-6 text-muted-slight"> / day</span></p>

            <h4 class="mt-4">Description</h4>
            <p>${car.description || 'No description available.'}</p>

            ${
              car.features && car.features.length > 0
                ? `
            <h4 class="mt-4">Features</h4>
            <ul class="list-unstyled features-list">
                ${car.features.map((feature) => `<li>${feature}</li>`).join('')}
            </ul>
            `
                : ''
            }

             <h4 class="mt-4">Availability</h4>
             <p>${car.availability ? '<span class="text-success fw-bold">Available</span> - Check dates during booking.' : '<span class="text-danger fw-bold">Currently Unavailable</span>'}</p>

            <a href="booking.html?carId=${car.id}" class="btn btn-primary btn-lg mt-3 ${!car.availability ? 'disabled' : ''}" ${!car.availability ? 'aria-disabled="true" tabindex="-1"' : ''}>
                <i class="bi bi-calendar-plus me-2"></i>Book Now
            </a>
        </div>
    `;

  container.innerHTML = detailsHtml;
}
