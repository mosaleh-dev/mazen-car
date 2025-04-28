import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
  },
  server: {
    host: true,
    allowedHosts: ['.localhost', '127.0.0.1', '.tunnelmole.net'],
  },
});
