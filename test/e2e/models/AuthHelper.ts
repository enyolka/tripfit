import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { envField } from 'astro/config';

/**
 * AuthHelper class for managing authentication in E2E tests
 * Uses test credentials from .env.test
 */
export class AuthHelper extends BasePage {
  readonly testEmail: string;
  readonly testPassword: string;
  readonly loginForm: { email: string, password: string, submit: string };
  constructor(page: Page) {
    super(page);    const testEmail = process.env.E2E_USERNAME;
    const testPassword = process.env.E2E_PASSWORD;
    console.log("*****URL: ", process.env.SUPABASE_URL);
    
    if (!testEmail || !testPassword) {
      throw new Error('E2E_USERNAME and E2E_PASSWORD environment variables must be set');
    }
    
    console.log('Using test email:', testEmail);
    
    this.testEmail = testEmail;
    this.testPassword = testPassword;
    
    // Update selectors to be more specific and resilient
    this.loginForm = {
      email: '[name="email"], input[type="email"]',
      password: '[name="password"], input[type="password"]',
      submit: 'button[type="submit"], button:has-text("Sign in")'
    };
  }

  /**
   * Login using test credentials from .env.test
   * Handles loading states and performs validation
   */  
  async login(): Promise<void> {
    try {
      console.log('Starting login process...');
      
      // Navigate to login page if not already there
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        await this.navigate('login');
      }

      // Wait for form to be ready - look for email field as indicator
      const emailInput = this.page.locator(this.loginForm.email);
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });

      // Debug form state
      console.log('Form fields found. Proceeding with login...');

      // Clear fields first (in case there's any existing input)
      await emailInput.clear();
      await this.page.locator(this.loginForm.password).clear();

      // Fill in credentials with proper typing simulation
      await emailInput.type(this.testEmail, { delay: 50 });
      await this.page.locator(this.loginForm.password).type(this.testPassword, { delay: 50 });

      // Take screenshot before submitting (useful for debugging)
      await this.page.screenshot({ path: './test-results/pre-login.png' });

      // Submit form and handle the initial auth error that we can ignore
      console.log('Submitting login form...');
      const submitButton = this.page.locator(this.loginForm.submit);
      await submitButton.click();

      // Wait for the login request to complete
      try {
        await this.page.waitForResponse(
          response => response.url().includes('/auth/login') && response.status() === 200,
          { timeout: 10000 }
        );
        console.log('Login request completed successfully');
      } catch (error) {
        console.error('Login request failed or timed out');
        throw error;
      }

      // Give a moment for client-side session handling
      await this.page.waitForTimeout(2000);

      // Check current URL 
      const postLoginUrl = this.page.url();
      console.log('Current URL after login:', postLoginUrl);

      // If we're not on journeys page yet, wait for the redirect
      if (!postLoginUrl.includes('/journeys')) {
        console.log('Waiting for redirect to /journeys...');
        await this.page.waitForURL(/.*journeys/, { timeout: 5000 });
      }

      // Final verification
      const finalUrl = this.page.url();
      if (!finalUrl.includes('/journeys')) {
        throw new Error(`Login may have failed - expected to be on /journeys but got ${finalUrl}`);
      }

      console.log('Login successful - verified on journeys page');
    } catch (error) {
      console.error('Login failed:', error);
      // Take a screenshot of the failure state
      await this.page.screenshot({ path: './test-results/login-failure.png' });
      throw error;
    }
  }

  /**
   * Check if user is logged in by verifying protected routes access
   * and the presence of auth-specific elements
   */    async isLoggedIn(): Promise<boolean> {
    try {
      console.log('Checking login status...');
      
      // Get current URL to determine where we are
      const currentUrl = this.page.url();
      console.log('Current URL while checking login:', currentUrl);
      
      // If we're already on a protected route (like /journeys), we're logged in
      if (currentUrl.includes('/journeys')) {
        console.log('Already on protected route - assuming logged in');
        return true;
      }

      // Try accessing journeys page
      console.log('Navigating to protected route to verify login...');
      await this.navigate('journeys');
      
      // Wait for any redirects and network activity
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      
      // Get URL after potential redirect
      const finalUrl = this.page.url();
      console.log('URL after navigation:', finalUrl);
      
      // If we're on login page, we're not logged in
      if (finalUrl.includes('/login')) {
        console.log('Redirected to login - user is not logged in');
        return false;
      }
      
      // If we stayed on journeys page, we're logged in
      const isOnJourneys = finalUrl.includes('/journeys');
      console.log(isOnJourneys ? 'Verified logged in - on journeys page' : 'Not on journeys page - assuming not logged in');
      return isOnJourneys;
      
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Logout the currently logged in user
   * Ensures we end up on the login page
   */
  async logout(): Promise<void> {
    try {
      // Click the logout button if available
      const logoutButton = this.page.getByRole('button', { name: /logout/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Wait for redirect to login page
        await this.page.waitForURL(/.*login/, { timeout: 5000 });
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}
