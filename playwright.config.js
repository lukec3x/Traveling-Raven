const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: 'e2e',
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  use: {
    baseURL: 'http://127.0.0.1:8080',
  },
  projects: [
    {
      name: 'landscape',
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'portrait',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
})
