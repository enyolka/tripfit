import { type Page, type Locator } from "@playwright/test";

/**
 * Base Page Object Model class
 * Provides common methods and properties for all page objects
 */
export class BasePage {
    readonly page: Page;
    readonly baseUrl: string;

    /**
     * Creates a new BasePage instance
     *
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        this.page = page;
        this.baseUrl = "http://localhost:3000";
    }

    /**
     * Navigate to the specified path
     *
     * @param path - Path to navigate to (relative to baseUrl)
     */
    async navigateTo(path = ""): Promise<void> {
        await this.page.goto(`${this.baseUrl}/${path}`);
    }

    async waitForNavigation(): Promise<void> {
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Get a locator for an element
     *
     * @param selector - CSS selector or other supported selector
     */
    getLocator(selector: string): Locator {
        return this.page.locator(selector);
    }

    /**
     * Get a locator for an element using test ID
     *
     * @param testId - Test ID attribute value
     */
    getByTestId(testId: string | RegExp): Locator {
        return this.page.getByTestId(testId);
    }

    /**
     * Wait for network requests to finish
     */
    async waitForNetworkIdle(): Promise<void> {
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Wait for a specific test ID to be visible
     *
     * @param testId - Test ID attribute value
     * @param timeout - Timeout in milliseconds
     */
    async waitForTestIdVisible(testId: string | RegExp, timeout?: number): Promise<void> {
        await this.page.getByTestId(testId).waitFor({
            state: "visible",
            timeout,
        });
    }
}
