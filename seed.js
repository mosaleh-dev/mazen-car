import PocketBase from 'pocketbase';
import { Blob } from 'node:buffer';
import { File } from '@web-std/file';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

// Credentials for the PocketBase Dashboard Admin we are assuming it was set
// this is a demo in real senario we would use .env vars
const SUPERADMIN_EMAIL = 'admin@car.com';
const SUPERADMIN_PASSWORD = 'adminadmin';

const APP_ADMIN_EMAIL = 'admin@test.com';
const APP_ADMIN_PASSWORD = 'adminpassword';

const USER_PASSWORD = 'passwordpassword';
const USER_EMAILS = [
  'a@test.com',
  'b@test.com',
  'c@test.com',
  'd@test.com',
  'f@test.com',
];
const PLACEHOLDER_BASE_URL = 'https://placehold.co';

const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

async function fetchPlaceholderImage(text, width = 640, height = 480) {
  const url = `${PLACEHOLDER_BASE_URL}/${width}x${height}.webp?text=${encodeURIComponent(text)}`;

  const baseFilename =
    text.replace(/[^a-z0-9]/gi, '_').toLowerCase() ||
    `placeholder_${width}x${height}`;
  const finalFilename = `${baseFilename}.webp`;

  try {
    console.log(`Fetching placeholder: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
        const errorBody = await response.text();
        errorDetails += ` - ${errorBody}`;
      } catch (e) {
        /* Ignore */
      }
      throw new Error(
        `Failed to fetch placeholder (${response.status}): ${errorDetails}`
      );
    }

    const contentType = response.headers.get('content-type') || 'image/webp';

    const imageBuffer = await response.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: contentType });

    return new File([imageBlob], finalFilename, { type: contentType });
  } catch (error) {
    console.error(
      `Error fetching placeholder "${text}" from ${url}:`,
      error.message
    );
    return null;
  }
}

async function createUser(userData) {
  try {
    const record = await pb.collection('users').create(userData);
    console.log(`Successfully created user: ${record.email}`);
    return record;
  } catch (error) {
    if (error.status === 400 && error.data?.data) {
      const validationErrors = error.data.data;
      if (
        validationErrors.email?.code === 'validation_exists' ||
        validationErrors.username?.code === 'validation_exists'
      ) {
        try {
          console.log(
            `User creation failed (likely exists), attempting to fetch: ${userData.email}`
          );
          const existing = await pb
            .collection('users')
            .getFirstListItem(`email = "${userData.email}"`);
          console.log(
            `Found existing user: ${userData.email} (ID: ${existing.id})`
          );
          return existing;
        } catch (fetchError) {
          console.error(
            `Failed to create or find user ${userData.email}. Fetch error:`,
            fetchError.message
          );
          console.error(
            'Original creation error details:',
            JSON.stringify(error?.data, null, 2)
          );
          return null;
        }
      }
    }
    console.error(`Failed to create user ${userData.email}:`, error?.message);
    console.error('Error details:', JSON.stringify(error?.data, null, 2));
    return null;
  }
}

async function createCar(carData) {
  if (!pb.authStore.model?.isAdmin) {
    console.error(
      `Cannot create car "${carData.brand} ${carData.model}". App Admin authentication required.`
    );
    return null;
  }

  try {
    const heroImageFile = await fetchPlaceholderImage(
      `${carData.brand} ${carData.model} Hero`,
      800,
      600
    );
    const image1File = await fetchPlaceholderImage(
      `${carData.brand} ${carData.model} 1`,
      640,
      480
    );
    const image2File = await fetchPlaceholderImage(
      `${carData.brand} ${carData.model} 2`,
      640,
      480
    );
    const image3File = await fetchPlaceholderImage(
      `${carData.brand} ${carData.model} 3`,
      640,
      480
    );

    const formData = new FormData();
    Object.keys(carData).forEach((key) => {
      formData.append(key, carData[key]);
    });
    if (heroImageFile) formData.append('heroImage', heroImageFile);
    if (image1File) formData.append('images', image1File);
    if (image2File) formData.append('images', image2File);
    if (image3File) formData.append('images', image3File);

    const record = await pb.collection('cars').create(formData);
    console.log(
      `Successfully created car: ${record.brand} ${record.model} (ID: ${record.id})`
    );
    return record;
  } catch (error) {
    console.error(
      `Failed to create car ${carData.brand} ${carData.model}:`,
      error?.message
    );
    console.error('Error details:', JSON.stringify(error?.data, null, 2));
    return null;
  }
}

async function createBooking(bookingData, userEmail, userPassword) {
  const currentAuthModel = pb.authStore.model;
  const currentToken = pb.authStore.token;

  try {
    console.log(`Authenticating as ${userEmail} to create booking...`);
    await pb.collection('users').authWithPassword(userEmail, userPassword);

    if (bookingData.pickupDate instanceof Date) {
      bookingData.pickupDate = bookingData.pickupDate
        .toISOString()
        .split('T')[0];
    }
    if (bookingData.dropoffDate instanceof Date) {
      bookingData.dropoffDate = bookingData.dropoffDate
        .toISOString()
        .split('T')[0];
    }

    const record = await pb.collection('bookings').create(bookingData);
    console.log(
      `Successfully created booking for user ${userEmail} car ${bookingData.car} (ID: ${record.id})`
    );
    return record;
  } catch (error) {
    console.error(
      `Failed to create booking for user ${userEmail}:`,
      error?.message
    );
    console.error('Error details:', JSON.stringify(error?.data, null, 2));
    return null;
  } finally {
    pb.authStore.save(currentToken, currentAuthModel);
    const restoredUser =
      pb.authStore.model?.email ||
      (pb.authStore.isAdmin ? 'Superadmin' : 'logged out');
    console.log(`Restored auth to: ${restoredUser}`);
  }
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  let appAdminRecord = null;
  const createdUsers = {};
  const createdCars = [];

  let didSuperAdminAuth = false;
  try {
    console.log(
      `Attempting Superadmin (Dashboard) authentication (${SUPERADMIN_EMAIL})...`
    );
    await pb.admins.authWithPassword(SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
    console.log(
      'Superadmin authentication successful. User creation will proceed with admin rights.'
    );
    didSuperAdminAuth = true;
  } catch (error) {
    console.warn(`Superadmin authentication failed: ${error.message}.`);
    console.warn(
      'Proceeding without Superadmin auth. User creation might fail if API rules require admin.'
    );
    pb.authStore.clear();
  }

  const appAdminData = {
    email: APP_ADMIN_EMAIL,
    username: APP_ADMIN_EMAIL,
    password: APP_ADMIN_PASSWORD,
    passwordConfirm: APP_ADMIN_PASSWORD,
    firstName: 'App',
    lastName: 'Admin',
    phoneNumber: 1000000001,
    nationalId: 10000000000001,
    isAdmin: true,
  };
  appAdminRecord = await createUser(appAdminData); // Uses Superadmin auth context if successful above but we donot need it for now
  if (appAdminRecord) {
    createdUsers[APP_ADMIN_EMAIL] = appAdminRecord;
  } else {
    console.error(
      `CRITICAL: Failed to create or find the App Admin user (${APP_ADMIN_EMAIL}). Cannot proceed with Admin-required actions.`
    );
    if (didSuperAdminAuth) pb.authStore.clear();
    return;
  }

  if (didSuperAdminAuth) {
    console.log('\nLogging out Superadmin...');
    pb.authStore.clear();
  }

  console.log('\n--- Creating Regular Users ---');
  for (const email of USER_EMAILS) {
    const namePart = email.split('@')[0];
    const userData = {
      email: email,
      password: USER_PASSWORD,
      passwordConfirm: USER_PASSWORD,
      firstName: namePart.toUpperCase(),
      lastName: 'Testuser',
      phoneNumber: 1234567890 + USER_EMAILS.indexOf(email),
      nationalId: 29901011000000 + USER_EMAILS.indexOf(email),
      isAdmin: false,
    };
    const userRecord = await createUser(userData); // Still using Superadmin auth context if available
    if (userRecord) {
      createdUsers[email] = userRecord;
    }
  }

  console.log(`\n--- Authenticating as App Admin (${APP_ADMIN_EMAIL}) ---`);
  try {
    await pb
      .collection('users')
      .authWithPassword(APP_ADMIN_EMAIL, APP_ADMIN_PASSWORD);
    if (!pb.authStore.model?.isAdmin) {
      throw new Error(
        `Authentication succeeded for ${APP_ADMIN_EMAIL}, but the user is not marked as admin (isAdmin=false).`
      );
    }
    console.log(
      `App Admin authentication successful (User ID: ${pb.authStore.model.id}).`
    );
  } catch (error) {
    console.error(
      `Failed to authenticate as App Admin (${APP_ADMIN_EMAIL}): ${error.message}`
    );
    console.error('Cannot proceed with car creation.');
    pb.authStore.clear();
    return;
  }

  console.log('\n--- Creating Cars ---');
  const carsData = [
    {
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      rentPerDay: 55,
      type: 'Sedan',
      status: 'Available',
      discription: 'Reliable and fuel-efficient sedan.',
      isFeuterd: true,
    },
    {
      brand: 'Honda',
      model: 'CR-V',
      year: 2022,
      rentPerDay: 65,
      type: 'SUV',
      status: 'Available',
      discription: 'Popular and versatile compact SUV.',
      isFeuterd: false,
    },
    {
      brand: 'Ford',
      model: 'Mustang',
      year: 2024,
      rentPerDay: 90,
      type: 'Sport',
      status: 'Available',
      discription: 'Iconic American muscle car.',
      isFeuterd: true,
    },
    {
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      rentPerDay: 85,
      type: 'Electric',
      status: 'In Maintenance',
      discription: 'Popular electric sedan with great range.',
      isFeuterd: false,
    },
    {
      brand: 'Chevrolet',
      model: 'Silverado',
      year: 2022,
      rentPerDay: 75,
      type: 'Truck',
      status: 'Available',
      discription: 'Full-size pickup truck for work or play.',
      isFeuterd: false,
    },
    {
      brand: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2023,
      rentPerDay: 110,
      type: 'Van',
      status: 'Out of Service',
      discription: 'Large cargo or passenger van.',
      isFeuterd: false,
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      rentPerDay: 100,
      type: 'SUV',
      status: 'Available',
      discription: 'Luxury mid-size SUV with performance.',
      isFeuterd: true,
    },
  ];

  for (const car of carsData) {
    const carRecord = await createCar(car);
    if (carRecord) {
      createdCars.push(carRecord);
    }
  }

  console.log('\nLogging out App Admin...');
  pb.authStore.clear();

  console.log('\n--- Creating Bookings ---');

  // Booking 1: User 'a', Car 1 (Camry)
  if (createdUsers[USER_EMAILS[0]] && createdCars[0]) {
    const booking1 = {
      user: createdUsers[USER_EMAILS[0]].id,
      car: createdCars[0].id,
      pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      dropoffDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      totalCost: 3 * createdCars[0].rentPerDay,
      status: 'Pending',
      userNotes: 'Need baby seat',
    };
    await createBooking(booking1, USER_EMAILS[0], USER_PASSWORD);
  } else {
    console.warn("Skipping booking 1: User 'a' or Car 1 not available.");
  }

  if (createdUsers[USER_EMAILS[1]] && createdCars[2]) {
    const booking2 = {
      user: createdUsers[USER_EMAILS[1]].id,
      car: createdCars[2].id,
      pickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      dropoffDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days
      totalCost: 2 * createdCars[2].rentPerDay,
      status: 'Confirmed',
      adminNotes: 'User called to confirm details.',
    };
    await createBooking(booking2, USER_EMAILS[1], USER_PASSWORD);
  } else {
    console.warn("Skipping booking 2: User 'b' or Car 3 not available.");
  }

  if (createdUsers[USER_EMAILS[0]] && createdCars[1]) {
    const booking3 = {
      user: createdUsers[USER_EMAILS[0]].id,
      car: createdCars[1].id,
      pickupDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      dropoffDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      totalCost: 4 * createdCars[1].rentPerDay,
      status: 'Completed',
      userNotes: 'Excellent car, very clean.',
    };
    await createBooking(booking3, USER_EMAILS[0], USER_PASSWORD);
  } else {
    console.warn("Skipping booking 3: User 'a' or Car 2 not available.");
  }

  console.log('\nEnsuring auth is cleared...');
  pb.authStore.clear();

  console.log('\nDatabase seeding process finished.');
}

seedDatabase().catch((err) => {
  console.error('\nUnhandled error during seeding:', err);
  process.exit(1);
});
