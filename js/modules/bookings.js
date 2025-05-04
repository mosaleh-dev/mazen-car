// Booking Data Management Module (using Local Storage)

import { getCarById } from './cars.js';

const BOOKINGS_STORAGE_KEY = 'bookingsData';

/**
 * Initializes mock booking data if local storage is empty (optional).
 */
function _initMockBookings() {
  const mockBookings = [
    {
      id: 'booking1',
      carId: 'car1',
      customerName: 'Ali Ahmed',
      customerEmail: 'ali@example.com',
      pickupDate: '2024-09-10',
      pickupTime: '10:00',
      dropoffDate: '2024-09-15',
      dropoffTime: '10:00',
      totalCost: 250.0,
      status: 'confirmed',
    },
    {
      id: 'booking2',
      carId: 'car2',
      customerName: 'Hassan Youssef',
      customerEmail: 'hassan@example.com',
      pickupDate: '2024-09-12',
      pickupTime: '14:00',
      dropoffDate: '2024-09-14',
      dropoffTime: '14:00',
      totalCost: 140.0,
      status: 'pending',
    },
    {
      id: 'booking3',
      carId: 'car4',
      customerName: 'Khaled Ibrahim',
      customerEmail: 'khaled@example.com',
      pickupDate: '2024-08-20',
      pickupTime: '09:00',
      dropoffDate: '2024-08-22',
      dropoffTime: '17:00',
      totalCost: 120.0,
      status: 'confirmed',
    },
    {
      id: 'booking4',
      carId: 'car5',
      customerName: 'Khaled Ibrahim',
      customerEmail: 'khaled@example.com',
      pickupDate: '2024-08-20',
      pickupTime: '09:00',
      dropoffDate: '2024-08-22',
      dropoffTime: '17:00',
      totalCost: 120.0,
      status: 'cancelled',
    },
    {
      id: 'booking5',
      carId: 'car4',
      customerName: 'Khaled Ibrahim',
      customerEmail: 'khaled@example.com',
      pickupDate: '2024-09-20',
      pickupTime: '09:00',
      dropoffDate: '2024-09-22',
      dropoffTime: '17:00',
      totalCost: 120.0,
      status: 'cancelled',
    },
  ];
  _saveBookings(mockBookings);
  return mockBookings;
}

/**
 * Saves the bookings array to local storage.
 * @param {Array<Object>} bookingsArray The array of booking objects.
 */
function _saveBookings(bookingsArray) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookingsArray));
  } catch (e) {
    console.error('Error saving bookings to local storage:', e);
  }
}

/**
 * Retrieves all bookings from local storage. Initializes if needed.
 * Includes car details for each booking.
 * @returns {Array<Object>} An array of booking objects, each possibly enriched with car details.
 */
export function getBookings() {
  try {
    const bookingsData = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    let bookings = [];
    if (!bookingsData) {
      bookings = _initMockBookings();
    } else {
      bookings = JSON.parse(bookingsData);
    }

    // Enrich bookings with car details
    return bookings.map((booking) => {
      const car = getCarById(booking.carId);
      return {
        ...booking,
        carDetails: car
          ? {
              brand: car.brand,
              model: car.model,
              imageUrl: car.imageUrl,
              type: car.type,
            }
          : null, // Add type if needed
      };
    });
  } catch (e) {
    console.error('Error getting bookings from local storage:', e);
    return _initMockBookings(); // Attempt recovery
  }
}

/**
 * Finds a booking by its ID.
 * @param {string} id The ID of the booking to find.
 * @returns {Object|null} The booking object (with carDetails) or null if not found.
 */
export function getBookingById(id) {
  const bookings = getBookings(); // Gets enriched bookings
  return bookings.find((booking) => booking.id === id) || null;
}

/**
 * Adds a new booking to the storage.
 * @param {Object} bookingData The data for the new booking. Needs validation beforehand.
 *                         Required: carId, customerName, customerEmail, pickupDate, pickupTime, dropoffDate, dropoffTime, totalCost
 * @returns {Object} The newly added booking object with an assigned ID and status.
 */
export function addBooking(bookingData) {
  if (
    !bookingData ||
    !bookingData.carId ||
    !bookingData.customerName ||
    !bookingData.customerEmail ||
    !bookingData.pickupDate ||
    !bookingData.pickupTime ||
    !bookingData.dropoffDate ||
    !bookingData.dropoffTime ||
    bookingData.totalCost === undefined ||
    bookingData.totalCost === null
  ) {
    throw new Error('Incomplete booking data provided.');
  }

  const bookingsRaw = JSON.parse(
    localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]'
  );
  const newBooking = {
    ...bookingData,
    id: `booking${Date.now()}${Math.random().toString(16).slice(2)}`,
    totalCost: parseFloat(bookingData.totalCost),
    status: 'pending',
  };
  bookingsRaw.push(newBooking);
  _saveBookings(bookingsRaw);

  const car = getCarById(newBooking.carId);
  return {
    ...newBooking,
    carDetails: car
      ? {
          brand: car.brand,
          model: car.model,
          imageUrl: car.imageUrl,
          type: car.type,
        }
      : null,
  };
}

/**
 * Updates the status of an existing booking.
 * @param {string} id The ID of the booking to update.
 * @param {string} status The new status ('pending', 'confirmed', 'cancelled').
 * @returns {Object|null} The updated booking object or null if not found or status is invalid.
 */
export function updateBookingStatus(id, status) {
  if (!id) {
    throw new Error('Booking ID is required for updating status.');
  }
  const validStatuses = ['pending', 'confirmed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    console.error(`Invalid status "${status}" provided.`);
    return null;
  }

  const bookingsRaw = JSON.parse(
    localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]'
  ); // Get raw bookings
  const bookingIndex = bookingsRaw.findIndex((booking) => booking.id === id);

  if (bookingIndex === -1) {
    console.error(`Booking with ID ${id} not found for status update.`);
    return null;
  }

  bookingsRaw[bookingIndex].status = status;
  _saveBookings(bookingsRaw);

  const updatedRawBooking = bookingsRaw[bookingIndex];
  const car = getCarById(updatedRawBooking.carId);
  return {
    ...updatedRawBooking,
    carDetails: car
      ? {
          brand: car.brand,
          model: car.model,
          imageUrl: car.imageUrl,
          type: car.type,
        }
      : null,
  };
}

/**
 * Deletes a booking by its ID. (Use with caution - maybe just cancel?)
 * Generally, updating status to 'cancelled' is preferred over deletion.
 * @param {string} id The ID of the booking to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteBooking(id) {
  if (!id) {
    throw new Error('Booking ID is required for deletion.');
  }
  let bookingsRaw = JSON.parse(
    localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]'
  );
  const initialLength = bookingsRaw.length;
  bookingsRaw = bookingsRaw.filter((booking) => booking.id !== id);

  if (bookingsRaw.length < initialLength) {
    _saveBookings(bookingsRaw);
    return true;
  } else {
    console.warn(`Booking with ID ${id} not found for deletion.`);
    return false;
  }
}
