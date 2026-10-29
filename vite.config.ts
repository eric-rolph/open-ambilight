import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allow local network / Android phone access
    port: 3000,
  },
});
