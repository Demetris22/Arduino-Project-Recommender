import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // The engine is a pure function — no DOM needed for its suite.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
