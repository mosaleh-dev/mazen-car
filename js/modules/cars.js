const CARS_STORAGE_KEY = 'carsData';

/**
 * Initializes mock car data if local storage is empty.
 */
function _initMockCars() {
  const mockCars = [
    {
      id: 'car1',
      brand: 'Toyota',
      model: 'Camry',
      type: 'Sedan',
      rentPerDay: 50,
      imageUrl: 'https://placehold.co/640x480.webp?text=Toyota%20Camry',
      description:
        'A reliable and comfortable sedan, perfect for families or business trips.',
      features: ['Air Conditioning', 'Automatic Transmission', 'Bluetooth'],
      availability: true,
      isFeatured: true,
    },
    {
      id: 'car2',
      brand: 'Honda',
      model: 'CR-V',
      type: 'SUV',
      rentPerDay: 70,
      imageUrl: 'https://placehold.co/640x480.webp?text=Honda%20CR-V',
      description: 'Spacious and versatile SUV with modern features.',
      features: [
        'Air Conditioning',
        'GPS Navigation',
        'Backup Camera',
        'All-Wheel Drive',
      ],
      availability: true,
      isFeatured: true,
    },
    {
      id: 'car3',
      brand: 'Ford',
      model: 'Mustang',
      type: 'Sports',
      rentPerDay: 120,
      imageUrl: 'https://placehold.co/640x480.webp?text=Ford%20Mustang',
      description: 'Experience the thrill of driving this iconic sports car.',
      features: [
        'Air Conditioning',
        'Premium Sound System',
        'Leather Seats',
        'Convertible',
      ],
      availability: true,
      isFeatured: true,
    },
    {
      id: 'car4',
      brand: 'Hyundai',
      model: 'Accent',
      type: 'Sedan',
      rentPerDay: 40,
      imageUrl: 'https://placehold.co/640x480.webp?text=Hyundai%20Accent',
      description: 'An affordable and fuel-efficient choice for city driving.',
      features: ['Air Conditioning', 'Manual Transmission', 'Good MPG'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car5',
      brand: 'Kia',
      model: 'Carnival',
      type: 'Van',
      rentPerDay: 90,
      imageUrl: 'https://placehold.co/640x480.webp?text=Kia%20Carnival',
      description:
        'Large and comfortable van for group travel or large families.',
      features: [
        'Air Conditioning',
        'Sliding Doors',
        '7+ Seater',
        'Entertainment System',
      ],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car6',
      brand: 'BMW',
      model: 'X5',
      type: 'SUV',
      rentPerDay: 150,
      imageUrl: 'https://placehold.co/640x480.webp?text=BMW%20X5',
      description: 'Premium SUV combining luxury, performance, and space.',
      features: [
        'Air Conditioning',
        'Sunroof',
        'Leather Seats',
        'Advanced Driver Assist',
      ],
      availability: false,
      isFeatured: false,
    },
    {
      id: 'car7',
      brand: 'Tesla',
      model: 'Model 3',
      type: 'Sedan',
      rentPerDay: 100,
      imageUrl: 'https://placehold.co/640x480.webp?text=Tesla%20Model%203',
      description:
        'Modern electric sedan with long range and autopilot capabilities.',
      features: ['Electric', 'Autopilot', 'Large Touchscreen', 'Fast Charging'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car8',
      brand: 'Ford',
      model: 'F-150',
      type: 'Truck',
      rentPerDay: 80,
      imageUrl: 'https://placehold.co/640x480.webp?text=Ford%20F-150',
      description:
        'Powerful and rugged pickup truck, great for hauling or off-road adventures.',
      features: ['4x4', 'Towing Package', 'Spacious Cabin'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car9',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      type: 'Sedan',
      rentPerDay: 130,
      imageUrl:
        'https://placehold.co/640x480.webp?text=Mercedes-Benz%20C-Class',
      description:
        'Elegant and sophisticated luxury sedan with advanced technology.',
      features: [
        'Leather Seats',
        'Sunroof',
        'Premium Sound System',
        'Navigation',
      ],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car10',
      brand: 'Volkswagen',
      model: 'Golf',
      type: 'Hatchback',
      rentPerDay: 45,
      imageUrl: 'https://placehold.co/640x480.webp?text=Volkswagen%20Golf',
      description:
        'A popular and reliable compact car, easy to park and fuel-efficient.',
      features: [
        'Air Conditioning',
        'Manual Transmission',
        'Hatchback',
        'Good MPG',
      ],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car11',
      brand: 'Chevrolet',
      model: 'Tahoe',
      type: 'SUV',
      rentPerDay: 110,
      imageUrl: 'https://placehold.co/640x480.webp?text=Chevrolet%20Tahoe',
      description:
        'Large SUV with ample seating and cargo space, suitable for large groups or hauling.',
      features: ['8+ Seater', 'Towing Capacity', 'Backup Camera'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car12',
      brand: 'Nissan',
      model: 'Leaf',
      type: 'Hatchback',
      rentPerDay: 60,
      imageUrl: 'https://placehold.co/640x480.webp?text=Nissan%20Leaf',
      description:
        'An affordable and practical electric car, great for city commuting.',
      features: ['Electric', 'Automatic Transmission', 'Regenerative Braking'],
      availability: false,
      isFeatured: false,
    },
    {
      id: 'car13',
      brand: 'Audi',
      model: 'A4',
      type: 'Sedan',
      rentPerDay: 125,
      imageUrl: 'https://placehold.co/640x480.webp?text=Audi%20A4',
      description: 'Stylish and performance-oriented luxury sedan.',
      features: ['Leather Seats', 'Quattro AWD', 'Virtual Cockpit'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car14',
      brand: 'Jeep',
      model: 'Wrangler',
      type: 'SUV',
      rentPerDay: 95,
      imageUrl: 'https://placehold.co/640x480.webp?text=Jeep%20Wrangler',
      description: 'Iconic SUV built for adventure, perfect for off-roading.',
      features: ['4x4', 'Removable Top/Doors', 'Off-Road Tires'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car15',
      brand: 'Mazda',
      model: 'CX-5',
      type: 'SUV',
      rentPerDay: 65,
      imageUrl: 'https://placehold.co/640x480.webp?text=Mazda%20CX-5',
      description:
        'Sporty and stylish compact SUV with a focus on driving dynamics.',
      features: ['Air Conditioning', 'Backup Camera', 'Blind Spot Monitoring'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car16',
      brand: 'Subaru',
      model: 'Outback',
      type: 'SUV',
      rentPerDay: 75,
      imageUrl: 'https://placehold.co/640x480.webp?text=Subaru%20Outback',
      description:
        'Versatile vehicle combining wagon and SUV features with standard AWD.',
      features: ['All-Wheel Drive', 'Roof Rails', 'Adaptive Cruise Control'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car17',
      brand: 'Volvo',
      model: 'XC90',
      type: 'SUV',
      rentPerDay: 160,
      imageUrl: 'https://placehold.co/640x480.webp?text=Volvo%20XC90',
      description: 'Safe and luxurious 3-row SUV with Scandinavian design.',
      features: ['7 Seater', 'Advanced Safety Features', 'Panoramic Sunroof'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car18',
      brand: 'Porsche',
      model: '911',
      type: 'Sports',
      rentPerDay: 300,
      imageUrl: 'https://placehold.co/640x480.webp?text=Porsche%20911',
      description:
        'Legendary sports car known for its performance and handling.',
      features: [
        'High Performance Engine',
        'Sport Exhaust',
        'Leather Interior',
      ],
      availability: false,
      isFeatured: false,
    },
    {
      id: 'car19',
      brand: 'Fiat',
      model: '500',
      type: 'Hatchback',
      rentPerDay: 35,
      imageUrl: 'https://placehold.co/640x480.webp?text=Fiat%20500',
      description: 'Small and stylish city car, easy to maneuver and park.',
      features: ['Compact Size', 'Fuel Efficient', 'Manual Transmission'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car20',
      brand: 'Honda',
      model: 'Civic',
      type: 'Sedan',
      rentPerDay: 55,
      imageUrl: 'https://placehold.co/640x480.webp?text=Honda%20Civic',
      description: 'Reliable and popular compact car with good fuel economy.',
      features: ['Air Conditioning', 'Automatic Transmission', 'Backup Camera'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car21',
      brand: 'Lexus',
      model: 'RX',
      type: 'SUV',
      rentPerDay: 140,
      imageUrl: 'https://placehold.co/640x480.webp?text=Lexus%20RX',
      description: 'Luxury SUV with a smooth ride and premium features.',
      features: ['Leather Seats', 'Navigation', 'Sunroof'],
      availability: true,
      isFeatured: true,
    },
    {
      id: 'car22',
      brand: 'Chevrolet',
      model: 'Camaro',
      type: 'Sports',
      rentPerDay: 200,
      imageUrl: 'https://placehold.co/640x480.webp?text=Chevrolet%20Camaro',
      description: 'High-performance sports car with a bold design.',
      features: ['V8 Engine', 'Sport Suspension', 'Convertible'],
      availability: true,
      isFeatured: true,
    },
    {
      id: 'car23',
      brand: 'Toyota',
      model: 'Sienna',
      type: 'Van',
      rentPerDay: 85,
      imageUrl: 'https://placehold.co/640x480.webp?text=Toyota%20Sienna',
      description: 'Spacious van perfect for family trips.',
      features: ['7 Seater', 'Rear Entertainment System', 'All-Wheel Drive'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car24',
      brand: 'Nissan',
      model: 'Altima',
      type: 'Sedan',
      rentPerDay: 60,
      imageUrl: 'https://placehold.co/640x480.webp?text=Nissan%20Altima',
      description: 'Comfortable sedan with advanced safety features.',
      features: ['Blind Spot Monitoring', 'Adaptive Cruise Control'],
      availability: true,
      isFeatured: false,
    },
    {
      id: 'car25',
      brand: 'Ford',
      model: 'Explorer',
      type: 'SUV',
      rentPerDay: 90,
      imageUrl: 'https://placehold.co/640x480.webp?text=Ford%20Explorer',
      description: 'Versatile SUV with plenty of space for passengers.',
      features: ['3rd Row Seating', 'Terrain Management System'],
      availability: true,
      isFeatured: false,
    },
  ];
  _saveCars(mockCars);
  return mockCars;
}

/**
 * Saves the cars array to local storage.
 * @param {Array<Object>} carsArray The array of car objects.
 */
function _saveCars(carsArray) {
  try {
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(carsArray));
  } catch (e) {
    console.error('Error saving cars to local storage:', e);
  }
}

/**
 * Retrieves all cars from local storage. Initializes mock data if needed.
 * @returns {Array<Object>} An array of car objects.
 */
export function getCars() {
  try {
    const carsData = localStorage.getItem(CARS_STORAGE_KEY);
    if (!carsData) {
      return _initMockCars();
    }
    const cars = JSON.parse(carsData);
    return cars.map((car) => ({
      ...car,
      features: Array.isArray(car.features) ? car.features : [],
      availability: car.availability !== undefined ? car.availability : true,
    }));
  } catch (e) {
    console.error('Error getting cars from local storage:', e);
    return _initMockCars();
  }
}

/**
 * Finds a car by its ID.
 * @param {string} id The ID of the car to find.
 * @returns {Object|null} The car object or null if not found.
 */
export function getCarById(id) {
  const cars = getCars();
  return cars.find((car) => car.id === id) || null;
}
/**
 * Adds a new car to the storage.
 * @param {Object} carData The data for the new car. Needs validation beforehand.
 * @returns {Object} The newly added car object with an assigned ID.
 */
export function addCar(carData) {
  if (
    !carData ||
    !carData.brand ||
    !carData.model ||
    !carData.type ||
    !carData.rentPerDay ||
    !carData.imageUrl ||
    !carData.description
  ) {
    throw new Error('Incomplete car data provided for adding.');
  }
  const cars = getCars();
  const newCar = {
    ...carData,
    id: `car${Date.now()}${Math.random().toString(16).slice(2)}`,
    rentPerDay: parseFloat(carData.rentPerDay), // Ensure number
    features: carData.features
      ? carData.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f)
      : [],
    availability: true,
  };
  cars.push(newCar);
  _saveCars(cars);
  return newCar;
}

/**
 * Updates an existing car's data.
 * @param {Object} updatedCarData The car data including the ID of the car to update.
 * @returns {Object|null} The updated car object or null if not found.
 */
export function updateCar(updatedCarData) {
  if (!updatedCarData || !updatedCarData.id) {
    throw new Error('Car ID is required for updating.');
  }
  if (
    !updatedCarData.brand ||
    !updatedCarData.model ||
    !updatedCarData.type ||
    !updatedCarData.rentPerDay ||
    !updatedCarData.imageUrl ||
    !updatedCarData.description
  ) {
    throw new Error('Incomplete car data provided for updating.');
  }

  const cars = getCars();
  const carIndex = cars.findIndex((car) => car.id === updatedCarData.id);

  if (carIndex === -1) {
    console.error(`Car with ID ${updatedCarData.id} not found for update.`);
    return null;
  }

  const updatedCar = {
    ...cars[carIndex],
    ...updatedCarData,
    rentPerDay: parseFloat(updatedCarData.rentPerDay),
    features: updatedCarData.features
      ? updatedCarData.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f)
      : [],
  };

  cars[carIndex] = updatedCar;
  _saveCars(cars);
  return updatedCar;
}

/**
 * Deletes a car by its ID.
 * @param {string} id The ID of the car to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteCar(id) {
  if (!id) {
    throw new Error('Car ID is required for deletion.');
  }
  let cars = getCars();
  const initialLength = cars.length;
  cars = cars.filter((car) => car.id !== id);

  if (cars.length < initialLength) {
    _saveCars(cars);
    return true;
  } else {
    console.warn(`Car with ID ${id} not found for deletion.`);
    return false;
  }
}
