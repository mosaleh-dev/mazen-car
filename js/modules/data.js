import { isLoggedIn } from './auth.js';
import * as cars from './cars.js';
import * as bookings from './bookings.js';

export function getCars() {
  return cars.getCars();
}

export function getCar(id, required = ['*']) {
  const car = cars.getCarById(id);
  return car;
}

export async function deleteCar(id) {
  try {
    const success = cars.deleteCar(id);
    if (!success) {
      throw new Error(`Car with ID ${id} not found for deletion.`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
}

export async function getFeaturedCars(limit = 0) {
  const allCars = cars.getCars();
  let featuredCars = allCars.filter((car) => car.availability === true);
  if (limit > 0) {
    featuredCars = featuredCars.slice(0, limit);
  }
  return featuredCars;
}

export async function getBookings() {
  if (!isLoggedIn()) {
    throw Error('should be logged in');
  }
  try {
    const bookingsList = bookings.getBookings();
    return bookingsList;
  } catch (error) {
    console.error(`Data module - Error fetching bookings:`, error);
    return [];
  }
}
