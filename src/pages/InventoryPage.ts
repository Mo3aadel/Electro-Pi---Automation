import { type Locator, type Page, expect } from '@playwright/test';

export class InventoryPage {
  readonly navLink: Locator;
  readonly heading: Locator;
  readonly productNameInput: Locator;
  readonly priceInput: Locator;
  readonly saveButton: Locator;
  readonly toast: Locator;

  constructor(private readonly page: Page) {
    this.navLink = page.getByRole('link', { name: 'Inventory' });
    this.heading = page.getByRole('heading', { name: 'Inventory' });
    this.productNameInput = page.getByLabel('Product Name');
    this.priceInput = page.getByLabel('Price');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.toast = page.getByRole('alert');
  }

  async open() {
    await this.navLink.click();
    await expect(this.page).toHaveURL(/\/inventory/);
    await expect(this.heading).toBeVisible();
  }

  async fillProduct(name: string, price: string) {
    await this.productNameInput.fill(name);
    await this.priceInput.fill(price);
  }

  async save() {
    // Wait for the backend call instead of a fixed delay.
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v1/inventory/items') && res.request().method() === 'POST',
    );
    await this.saveButton.click();
    const response = await responsePromise;
    expect(response.ok(), `Save request failed with status ${response.status()}`).toBeTruthy();
  }
}
