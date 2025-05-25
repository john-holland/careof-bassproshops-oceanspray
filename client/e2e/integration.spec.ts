import { test, expect } from '@playwright/test';
import { API_URLS } from '../src/config/api';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup any necessary test data or state
    await page.goto('http://localhost:3000');
  });

  test('should connect to fishery service', async ({ page }) => {
    const response = await page.request.get(`${API_URLS.FISHERY}/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should connect to UAV service', async ({ page }) => {
    const response = await page.request.get(`${API_URLS.UAV}/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should fetch and display fish data', async ({ page }) => {
    // Navigate to fish data page
    await page.goto('http://localhost:3000/fish');
    
    // Wait for fish data to load
    await page.waitForSelector('[data-testid="fish-list"]');
    
    // Verify fish data is displayed
    const fishList = await page.locator('[data-testid="fish-list"]').all();
    expect(fishList.length).toBeGreaterThan(0);
  });

  test('should fetch and display UAV data', async ({ page }) => {
    // Navigate to UAV data page
    await page.goto('http://localhost:3000/uav');
    
    // Wait for UAV data to load
    await page.waitForSelector('[data-testid="uav-list"]');
    
    // Verify UAV data is displayed
    const uavList = await page.locator('[data-testid="uav-list"]').all();
    expect(uavList.length).toBeGreaterThan(0);
  });

  test('should handle database operations', async ({ page }) => {
    // Test creating a new fish record
    const newFish = {
      species: 'Test Fish',
      weight: 5.5,
      location: 'Test Location'
    };

    const createResponse = await page.request.post(`${API_URLS.FISHERY}/fish`, {
      data: newFish
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdFish = await createResponse.json();
    expect(createdFish.species).toBe(newFish.species);

    // Test retrieving the created fish
    const getResponse = await page.request.get(`${API_URLS.FISHERY}/fish/${createdFish.id}`);
    expect(getResponse.ok()).toBeTruthy();
    const retrievedFish = await getResponse.json();
    expect(retrievedFish.id).toBe(createdFish.id);
  });

  test('should handle UAV deployment operations', async ({ page }) => {
    // Test creating a new UAV deployment
    const newDeployment = {
      location: 'Test Location',
      purpose: 'Test Purpose',
      status: 'pending'
    };

    const createResponse = await page.request.post(`${API_URLS.UAV}/deployments`, {
      data: newDeployment
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdDeployment = await createResponse.json();
    expect(createdDeployment.location).toBe(newDeployment.location);

    // Test updating deployment status
    const updateResponse = await page.request.patch(`${API_URLS.UAV}/deployments/${createdDeployment.id}`, {
      data: { status: 'active' }
    });
    expect(updateResponse.ok()).toBeTruthy();
    const updatedDeployment = await updateResponse.json();
    expect(updatedDeployment.status).toBe('active');
  });
}); 