import { type Page } from "@playwright/test";
import { BasePage } from "../core/BasePage";

/**
 * AuthHelper class for managing authentication in E2E tests
 * Uses test credentials from .env.test
 */
export class AuthHelper extends BasePage {
    readonly testEmail: string;
    readonly testPassword: string;
    readonly loginForm: { email: string; password: string; submit: string };

    /**
     * Creates a new AuthHelper instance
     *
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        super(page);
        const testEmail = process.env.E2E_USERNAME;
        const testPassword = process.env.E2E_PASSWORD;

        if (!testEmail || !testPassword) {
            throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
        }

        this.testEmail = testEmail;
        this.testPassword = testPassword;

        // Update selectors to be more specific and resilient
        this.loginForm = {
            email: '[name="email"], input[type="email"]',
            password: '[name="password"], input[type="password"]',
            submit: 'button[type="submit"], button:has-text("Sign in")',
        };
    }

    /**
     * Navigate to login page
     */
    async navigateToLogin(): Promise<void> {
        await this.navigateTo("login");
    }
    /**
     * Login using test credentials from .env.test
     */
    async login(): Promise<void> {
        try {
            // Navigate to login page if not already there
            const currentUrl = this.page.url();
            if (!currentUrl.includes("/login")) {
                await this.navigateToLogin();

                // Wait for page to load completely
                await this.page.waitForLoadState("domcontentloaded");
                await this.page.waitForTimeout(1000); // Give the page a moment to stabilize
            }

            // Wait for form to be ready - look for email field as indicator
            const emailInput = this.page.locator(this.loginForm.email);
            await emailInput.waitFor({ state: "visible", timeout: 10000 });

            // Fill login form
            await emailInput.fill(this.testEmail);

            const passwordInput = this.page.locator(this.loginForm.password);
            await passwordInput.waitFor({ state: "visible" });
            await passwordInput.fill(this.testPassword);

            // Submit form and wait for response
            const submitButton = this.page.locator(this.loginForm.submit);
            await submitButton.waitFor({ state: "visible" });

            // Create a navigation promise to track navigation
            const navigationPromise = this.page.waitForURL(
                (url) => url.href.includes("/journeys") || url.href.includes("/dashboard"),
                { timeout: 20000 }
            );

            await submitButton.click();

            // Wait for the navigation to complete
            await navigationPromise;

            // Wait for the page to stabilize
            await this.page.waitForLoadState("domcontentloaded");
            await this.page.waitForTimeout(2000); // Give the app state time to update after login
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }
    /**
     * Check if user is logged in
     */
    async isLoggedIn(): Promise<boolean> {
        try {
            // Check for indicators that user is logged in
            const profileIndicators = [
                'button:has-text("Log out")',
                'button:has-text("Logout")',
                '[data-testid="user-avatar"]',
                '[data-testid="user-menu"]',
            ];

            // Try each indicator
            for (const selector of profileIndicators) {
                if ((await this.page.locator(selector).count()) > 0) {
                    const isVisible = await this.page.locator(selector).first().isVisible();
                    if (isVisible) {
                        return true;
                    }
                }
            }

            // Special case for profile link which appears in both desktop and mobile menus
            try {
                // Use a more specific selector to target only the desktop nav profile link
                const desktopProfileLink = this.page.locator('nav >> a[href="/profile"]:not(#mobile-menu *)').first();
                if ((await desktopProfileLink.count()) > 0 && (await desktopProfileLink.isVisible())) {
                    return true;
                }
            } catch (e) {
                // Ignore errors from this specific check
                console.error(e);
            }

            return false;
        } catch (error) {
            console.error("Error checking login status:", error);
            return false;
        }
    } /**
     * Logout the user
     * Note: For testing purposes, we don't need to actually log out
     * as each test runs in a fresh browser context anyway.
     * This is a stub implementation that can be extended if needed.
     */
    async logout(): Promise<void> {
        try {
            console.log("Skipping logout for test efficiency - each test has a fresh context");
            // In Playwright, each test typically gets a fresh browser context,
            // so explicit logout is often not necessary between tests
            return;

            /*
      // The code below is commented out as we prefer to let each test start with a fresh context
      // rather than trying to explicitly log out, which can be flaky in SPAs
      
      // Try different logout button selectors with case insensitive text
      const logoutSelectors = [
        'button:text-is("Log out")',
        'button:text-is("Log Out")',
        'button:text-is("Logout")',
        '[data-testid="logout-button"]'
      ];
      
      // Check if user menu needs to be opened first
      const userMenuSelector = '[data-testid="user-menu"]';
      const userMenu = this.page.locator(userMenuSelector);
      if (await userMenu.count() > 0 && await userMenu.isVisible()) {
        await userMenu.click();
        await this.page.waitForTimeout(500); // Wait for menu animation
      }
      
      // Try each logout selector
      let loggedOut = false;
      for (const selector of logoutSelectors) {
        const logoutBtns = this.page.locator(selector);
        const count = await logoutBtns.count();
        
        if (count > 0) {
          // We'll try the first button that is visible
          for (let i = 0; i < count; i++) {
            const logoutBtn = logoutBtns.nth(i);
            if (await logoutBtn.isVisible()) {
              await logoutBtn.click();
              
              // Wait for logout to complete (can be detected by URL change or UI change)
              await this.page.waitForTimeout(2000);
              
              loggedOut = true;
              break;
            }
          }
          
          if (loggedOut) break;
        }
      }
      
      if (!loggedOut) {
        console.warn('Could not find logout button');
        return;
      }
      */
        } catch (error) {
            console.error("Error during logout:", error);
            // Don't throw the error as logout is not critical for tests to continue
        }
    }
}
