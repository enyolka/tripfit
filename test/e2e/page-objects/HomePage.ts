import type { Page, Locator } from '@playwright/test';
import { BasePage } from './core/BasePage';

/**
 * HomePage Page Object Model class
 * Represents the home page of the TripFit application
 */
export class HomePage extends BasePage {
  // Define page-specific locators
  readonly welcomeHeader: Locator;
  readonly navigationLinks: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeader = this.getLocator('h1');
    this.navigationLinks = this.getLocator('nav a');
    this.loginButton = this.getLocator('a[href="/login"]').first();
    this.registerButton = this.getLocator('a[href="/register"]').first();
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.navigateTo('');
  }

  /**
   * Get the welcome text
   */
  async getWelcomeText(): Promise<string> {
    return await this.welcomeHeader.textContent() || '';
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    await this.waitForNavigation();
  }

  /**
   * Click the register button
   */
  async clickRegister(): Promise<void> {
    await this.registerButton.click();
    await this.waitForNavigation();
  }

  /**
   * Get all navigation links text
   */
  async getNavigationLinksText(): Promise<string[]> {
    return await this.navigationLinks.allTextContents();
  }
}