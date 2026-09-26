import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e/**'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/lib/content-access.ts',
        'src/lib/email-hygiene.ts',
        'src/lib/pricing.ts',
        'src/lib/stripe.ts',
        'src/lib/subscription.ts',
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/__tests__/**'],
      thresholds: {
        statements: 92,
        branches: 92,
        functions: 89,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
      '@data': path.resolve(__dirname, './data'),
    },
  },
});
