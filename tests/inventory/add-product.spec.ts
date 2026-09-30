import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/config/env';

test.describe('Inventory', () => {
  test('Store Admin can add a new product to inventory', async ({ loginPage, inventoryPage }) => {
    const productName = `Wireless Mouse ${Date.now()}`;

    await test.step('Log in as Store Admin', async () => {
      await loginPage.goto();
      await loginPage.loginAs(env.adminEmail, env.adminPassword);
    });

    await test.step('Navigate to the Inventory module', async () => {
      await inventoryPage.open();
    });

    await test.step('Fill in Product Name and Price', async () => {
      await inventoryPage.fillProduct(productName, '25.00');
    });

    await test.step('Click Save', async () => {
      await inventoryPage.save();
    });

    await test.step('Assert the success toast appears', async () => {
      await expect(inventoryPage.toast).toBeVisible();
      await expect(inventoryPage.toast).toContainText('Product saved successfully');
    });
  });
});
