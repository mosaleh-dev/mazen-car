import { isLoggedIn } from './auth.js';
import pb from './pocketbase.js';
import { normalizeFileUrls } from './utils.js';
export async function getCars() {
  return (await pb.collection('cars').getFullList()).map(normalizeFileUrls);
}
export async function getCar(id, required = ['*']) {
  return normalizeFileUrls(
    await pb.collection('cars').getOne(id, { fields: required.join(',') })
  );
}

export async function getFeaturedCars(limit = 0) {
  let featuredCars = [];
  if (!limit) {
    featuredCars = await pb.collection('cars').getFullList({
      filter: 'isFeuterd = true',
    });
  } else {
    featuredCars = (
      await pb.collection('cars').getList(1, limit, {
        filter: 'isFeuterd = true',
      })
    ).items;
  }
  return featuredCars.map(normalizeFileUrls);
}

export async function getBookings() {
  if (!isLoggedIn()) {
    throw Error('should be logged in');
  }
  try {
    const bookings = await pb.collection('bookings').getFullList();
    return bookings;
  } catch (error) {
    console.error(
      `Data module - Error fetching bookings for user ${userId}:`,
      error
    );
    return [];
  }
}
