import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
        adminCars: resolve(__dirname, 'admin-cars.html'),
        adminBookings: resolve(__dirname, 'admin-bookings.html'),
        adminReports: resolve(__dirname, 'admin-reports.html'),
        logIN: resolve(__dirname, 'login.html'),
        signUp: resolve(__dirname, 'signup.html'),
        booking: resolve(__dirname, 'booking.html'),
        bookingHistory: resolve(__dirname, 'booking-history.html'),
        car: resolve(__dirname, 'car.html'),
        cars: resolve(__dirname, 'cars.html'),
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ['.localhost', '127.0.0.1', '.tunnelmole.net'],
  },
});
