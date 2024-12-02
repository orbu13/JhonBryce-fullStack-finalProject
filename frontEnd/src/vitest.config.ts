import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Use jsdom as the test environment (browser-like environment)
    globals: true, // Enables global test functions like `describe`, `it`, `expect`
    transformMode: {
      web: [".ts", ".tsx", ".js", ".jsx"], // Transform TS/TSX and JS/JSX files for testing
    },
    coverage: {
      provider: 'v8', // or 'c8', based on your needs
      reporter: ['text', 'json', 'html'], // Use multiple reporters for coverage
    },
    // Other possible configurations:
    // watch: true, // Uncomment if you want to auto-run tests on changes
  },
});
