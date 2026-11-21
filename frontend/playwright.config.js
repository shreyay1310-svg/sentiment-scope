import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8088',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: {
    command: '"C:\\Program Files\\Python314\\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8088',
    cwd: '../backend',
    url: 'http://127.0.0.1:8088/api/health',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
