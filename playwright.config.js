import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://127.0.0.1:8000', headless: true },
  webServer: { command: 'python3 -m http.server 8000 --bind 127.0.0.1', port: 8000, reuseExistingServer: true },
});
