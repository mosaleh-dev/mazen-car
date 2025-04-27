import { getCar } from '../modules/data.js';

const urlParams = new URLSearchParams(window.location.search);
const carId = urlParams.get('id');

if (!carId) {
  throw Error('No car ID provided in URL.');
}

try {
  const car = await getCar(carId, ['heroImage', 'model', 'brand']);

  console.log(car); // Log the fetched car object
} catch (error) {
  console.error(
    `Error fetching car details for ID ${carId} in car-details.js:`,
    error
  );
}
