import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
  validateForm,
  resetFormValidation,
  formatCurrency,
} from '../utils/helpers.js';
import {
  getCars,
  getCarById,
  addCar,
  updateCar,
  deleteCar,
} from '../modules/cars.js';

let carFormModalInstance = null;
let deleteConfirmModalInstance = null;
let carToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initial setup
  checkAdminLogin();
  setupAdminLayoutListeners();

  // Initialize modals
  initializeModals();

  // Event listeners
  setupEventListeners();

  // Load initial data
  loadCarsTable();
});

function initializeModals() {
  const carFormModalEl = document.getElementById('carFormModal');
  if (carFormModalEl) {
    carFormModalInstance = new bootstrap.Modal(carFormModalEl);
    carFormModalEl.addEventListener('hidden.bs.modal', resetCarForm);
  }

  const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
  if (deleteConfirmModalEl) {
    deleteConfirmModalInstance = new bootstrap.Modal(deleteConfirmModalEl);
  }
}

function setupEventListeners() {
  document
    .getElementById('add-car-button')
    ?.addEventListener('click', handleAddCarClick);
  document
    .getElementById('car-form')
    ?.addEventListener('submit', handleCarFormSubmit);
  document
    .getElementById('cars-table-body')
    ?.addEventListener('click', handleTableButtonClick);
  document
    .getElementById('confirmDeleteButton')
    ?.addEventListener('click', handleConfirmDelete);
}

function loadCarsTable() {
  const tableBody = document.getElementById('cars-table-body');
  const noCarsMessage = document.getElementById('no-cars-message');
  if (!tableBody || !noCarsMessage) return;

  const cars = getCars();
  tableBody.innerHTML = '';

  if (cars.length === 0) {
    noCarsMessage.classList.remove('d-none');
    return;
  }

  noCarsMessage.classList.add('d-none');
  const fragment = document.createDocumentFragment();

  cars.forEach((car) => {
    const defaultImage = `https://placehold.co/80x50.webp?text=${encodeURIComponent(car.brand)}`;
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${car.id.substring(0, 8)}...</td>
      <td>
        <img src="${car.imageUrl || defaultImage}" 
             alt="${car.brand} ${car.model}" 
             class="car-thumbnail">
      </td>
      <td>${car.brand}</td>
      <td>${car.model}</td>
      <td>${car.type}</td>
      <td>${formatCurrency(car.rentPerDay)}</td>
      <td>
        <div class="form-check form-switch">
          <input class="form-check-input" 
                 type="checkbox" 
                 id="switch-${car.id}" 
                 data-car-id="${car.id}">
          <label class="form-check-label" 
                 for="switch-${car.id}"></label>
        </div>
      </td>
      <td class="action-buttons">
        <button class="btn btn-sm btn-info edit-button" 
                data-id="${car.id}" 
                title="Edit">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-button" 
                data-id="${car.id}" 
                data-info="${car.brand} ${car.model}" 
                title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    // Setup feature toggle
    const checkbox = row.querySelector(`#switch-${car.id}`);
    const label = checkbox.nextElementSibling;
    checkbox.addEventListener('change', () => {
      label.textContent = '';
    });

    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
}

// Form Handlers
function handleAddCarClick() {
  resetCarForm();
  document.getElementById('carFormModalLabel').textContent = 'Add New Car';
  document.getElementById('saveCarButton').textContent = 'Save Car';
  carFormModalInstance?.show();
}

function handleEditCarClick(carId) {
  const car = getCarById(carId);
  if (!car || !carFormModalInstance) return;

  resetCarForm();
  populateCarForm(car);

  document.getElementById('carFormModalLabel').textContent = 'Edit Car';
  document.getElementById('saveCarButton').textContent = 'Update Car';
  carFormModalInstance.show();
}

function populateCarForm(car) {
  document.getElementById('carId').value = car.id;
  document.getElementById('carBrand').value = car.brand;
  document.getElementById('carModel').value = car.model;
  document.getElementById('carType').value = car.type;
  document.getElementById('carRentPerDay').value = car.rentPerDay;
  document.getElementById('carImageUrl').value = car.imageUrl;
  document.getElementById('carDescription').value = car.description;
  document.getElementById('carFeatures').value = Array.isArray(car.features)
    ? car.features.join(', ')
    : '';
}

// Delete Handlers
function handleDeleteCarClick(carId, carInfo) {
  carToDeleteId = carId;
  document.getElementById('deleteCarInfo').textContent = carInfo || 'this car';
  deleteConfirmModalInstance?.show();
}

function handleConfirmDelete() {
  if (!carToDeleteId || !deleteConfirmModalInstance) return;

  try {
    const success = deleteCar(carToDeleteId);
    if (success) {
      showToast('Car deleted successfully.', 'success', 'admin-toast');
      loadCarsTable();
    } else {
      showToast(
        'Failed to delete car. It might have already been removed.',
        'warning',
        'admin-toast'
      );
    }
  } catch (error) {
    console.error('Error deleting car:', error);
    showToast(`Error deleting car: ${error.message}`, 'error', 'admin-toast');
  } finally {
    deleteConfirmModalInstance.hide();
    carToDeleteId = null;
  }
}

// Form Submission
function handleCarFormSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = event.target;
  if (!validateForm(form) || !carFormModalInstance) {
    showToast(
      'Please fill in all required fields correctly.',
      'warning',
      'admin-toast'
    );
    return;
  }

  const carData = {
    id: document.getElementById('carId').value || null,
    brand: document.getElementById('carBrand').value.trim(),
    model: document.getElementById('carModel').value.trim(),
    type: document.getElementById('carType').value,
    rentPerDay: document.getElementById('carRentPerDay').value,
    imageUrl: document.getElementById('carImageUrl').value.trim(),
    description: document.getElementById('carDescription').value.trim(),
    features: document.getElementById('carFeatures').value,
    featured: document.getElementById('carFeatured').checked,
  };

  try {
    if (carData.id) {
      handleCarUpdate(carData);
    } else {
      handleCarCreation(carData);
    }
    carFormModalInstance.hide();
    loadCarsTable();
  } catch (error) {
    console.error('Error saving car:', error);
    showToast(`Error saving car: ${error.message}`, 'error', 'admin-toast');
  }
}

function handleCarUpdate(carData) {
  const updated = updateCar(carData);
  if (updated) {
    showToast(
      `Car "${updated.brand} ${updated.model}" updated successfully.`,
      'success',
      'admin-toast'
    );
  } else {
    showToast('Failed to update car. Car not found.', 'error', 'admin-toast');
  }
}

function handleCarCreation(carData) {
  const added = addCar(carData);
  showToast(
    `Car "${added.brand} ${added.model}" added successfully.`,
    'success',
    'admin-toast'
  );
}

// Utility Functions
function resetCarForm() {
  const form = document.getElementById('car-form');
  if (form) {
    form.reset();
    document.getElementById('carId').value = '';
    resetFormValidation(form);
  }
}

function handleTableButtonClick(event) {
  const target = event.target.closest('button');
  if (!target) return;

  const carId = target.getAttribute('data-id');
  const carInfo = target.getAttribute('data-info');

  if (target.classList.contains('edit-button')) {
    handleEditCarClick(carId);
  } else if (target.classList.contains('delete-button')) {
    handleDeleteCarClick(carId, carInfo);
  }
}
