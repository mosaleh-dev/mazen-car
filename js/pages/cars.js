import { getCars } from '../modules/cars.js';
import {
  getQueryParam,
  formatCurrency,
  attachThemeToggler,
} from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  attachThemeToggler();

  const filterForm = document.getElementById('filter-form');
  const priceRange = document.getElementById('filter-price');
  const priceValueSpan = document.getElementById('price-value');
  const resetFiltersBtn = document.getElementById('reset-filters');

  if (priceRange && priceValueSpan) {
    priceValueSpan.textContent = priceRange.value;
    priceRange.addEventListener('input', (e) => {
      priceValueSpan.textContent = e.target.value;
    });
  }

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      displayCars();
    });
  }

  if (resetFiltersBtn && filterForm) {
    resetFiltersBtn.addEventListener('click', () => {
      filterForm.reset();
      if (priceValueSpan && priceRange) {
        priceValueSpan.textContent = priceRange.max;
        priceRange.value = priceRange.max;
      }
      displayCars();
    });
  }

  applyInitialFilters();
  displayCars();
});

function applyInitialFilters() {
  const typeParam = getQueryParam('type');
  const maxPriceParam = getQueryParam('maxPrice');
  const searchParam = getQueryParam('search');

  const filterTypeSelect = document.getElementById('filter-type');
  const priceRange = document.getElementById('filter-price');
  const priceValueSpan = document.getElementById('price-value');
  const searchInput = document.getElementById('filter-search');

  if (typeParam && filterTypeSelect) {
    filterTypeSelect.value = typeParam;
  }
  if (maxPriceParam && priceRange && priceValueSpan) {
    const price = parseInt(maxPriceParam, 10);
    if (!isNaN(price) && price <= parseInt(priceRange.max, 10)) {
      priceRange.value = price;
      priceValueSpan.textContent = price;
    }
  }
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
  }
}

function displayCars() {
  const carListingsContainer = document.getElementById(
    'car-listings-container'
  );
  const noResultsDiv = document.getElementById('no-results');
  if (!carListingsContainer || !noResultsDiv) return;

  const allCars = getCars();
  const searchTerm =
    document.getElementById('filter-search')?.value.toLowerCase() || '';
  const selectedType = document.getElementById('filter-type')?.value || '';
  const maxPrice = parseInt(
    document.getElementById('filter-price')?.value || '500',
    10
  );

  let filteredCars = allCars.filter((car) => {
    const filterBySearch =
      !searchTerm ||
      car.brand.toLowerCase().includes(searchTerm) ||
      car.model.toLowerCase().includes(searchTerm);
    const filterByType = !selectedType || car.type === selectedType;
    const filterByPrice = car.rentPerDay <= maxPrice;
    const isFilterd = filterBySearch && filterByType && filterByPrice;

    return car.availability && isFilterd;
  });

  let carsCards = '';
  carListingsContainer.innerHTML = '';

  if (filteredCars.length === 0) {
    noResultsDiv.classList.remove('d-none');
  } else {
    noResultsDiv.classList.add('d-none');
    filteredCars.forEach((car, index) => {
      const switchId = `switch${index}`;
      const statusId = `status${index}`;

      carsCards += `
      <div class="col">
        <div class="card h-100 car-card">
          <img src="${car.imageUrl || 'https://placehold.co/300x200.webp?text=No+Image'}" class="card-img-top" alt="${car.brand} ${car.model}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${car.brand} ${car.model}</h5>
            <p class="card-text">
              <span class="badge bg-secondary">${car.type}</span>
            </p>
            <p class="card-text mt-auto pt-2">
              <span class="price fs-5">$${formatCurrency(car.rentPerDay)}</span> / day
              
            </p>
            <a href="car.html?id=${car.id}" class="btn btn-primary mt-2">View Details</a>
          </div>
        </div>
      </div>
    `;
    });

    carListingsContainer.innerHTML = carsCards;

    filteredCars.forEach((_, index) => {
      const switchId = `switch${index}`;
      const statusId = `status${index}`;
      toggleFeature(switchId, statusId);
    });
  }
}
