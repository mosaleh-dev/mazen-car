import { getCars } from '../modules/data.js';
let cars = await getCars();
console.log(cars);
