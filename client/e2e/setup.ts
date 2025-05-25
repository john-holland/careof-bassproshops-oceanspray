import '@testing-library/jest-dom';
import { setupTestDatabase } from './test-helpers';

// Global setup
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
});

// Global teardown
afterAll(async () => {
  // Cleanup will be handled by test-helpers
}); 