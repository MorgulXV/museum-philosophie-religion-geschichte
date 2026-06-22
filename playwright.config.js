import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:8000',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
