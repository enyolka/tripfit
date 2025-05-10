import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model class
 * Provides common methods and properties for all page objects
 */
export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
  }

  /**
   * Navigate to the specified path
   */
  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}/${path}`);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a locator using a selector
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Expect page to have title
   */
  async expectTitleToBe(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Take a screenshot and save it to the specified path
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./test/e2e/screenshots/${name}.png` });
  }
}