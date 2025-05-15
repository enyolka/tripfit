import { test, expect } from "@playwright/test";
import { JourneysPage } from "../page-objects/JourneysPage";
import type { JourneyData, NewJourneyModal } from "../page-objects/NewJourneyModal";
import { ensureAuthenticated } from "../helpers/auth.helper";
import { AuthHelper } from "../page-objects/auth/AuthHelper";

test.describe("Journey Management", () => {
    let journeysPage: JourneysPage;
    let auth: AuthHelper;

    // Test data - journey examples for reuse
    const barcelonaJourney: JourneyData = {
        destination: "Barcelona",
        departureDate: "2025-06-15",
        returnDate: "2025-06-22",
        activities: [
            { name: "Beach", level: 1 },
            { name: "Sightseeing", level: 2 },
            { name: "Local Cuisine", level: 3 },
        ],
    };

    const parisJourney: JourneyData = {
        destination: "Paris",
        departureDate: "2025-06-15",
        returnDate: "2025-06-22",
        activities: [
            { name: "Sightseeing", level: 2 },
            { name: "Museums", level: 3 },
        ],
    };

    // Setup before each test
    test.beforeEach(async ({ page }) => {
        // Arrange - initialize page objects
        journeysPage = new JourneysPage(page);
        auth = new AuthHelper(page);

        // Ensure user is authenticated
        await ensureAuthenticated(page);

        // Navigate to journeys page
        await journeysPage.navigateToJourneys();

        // Wait for the journeys page to be ready
        await journeysPage.waitForReady();
    });

    // Cleanup after each test
    test.afterEach(async ({ context }) => {
        // Clean up browser context
        await context.clearCookies();
        
        // No need to logout, as each test gets a new browser context
    });

    test("should create a new journey with detailed steps", async ({ page }) => {
        // Arrange - open modal
        let modal: NewJourneyModal;
        await test.step("Open new journey modal", async () => {
            modal = await journeysPage.openNewJourneyModal();
            await expect(page.getByTestId("new-journey-modal")).toBeVisible();
        });

        // Act - fill and submit form
        await test.step("Fill journey form", async () => {
            await modal.fillJourneyForm(barcelonaJourney);
        });

        await test.step("Submit journey form", async () => {
            await modal.submitJourney();
            await modal.waitForModalClose();
        });

        // Assert - verify journey appears in list
        await test.step("Verify journey appears in list", async () => {
            await page.getByTestId(/^journey-item-/).first().waitFor();
            
            const journeyTexts = await page.getByTestId(/^journey-item-/).allTextContents();
            const hasDestination = journeyTexts.some(text => text.includes(barcelonaJourney.destination));
            expect(hasDestination).toBe(true);
        });
    });


    test("should cancel journey creation", async () => {
        // Arrange
        const initialJourneysEmpty = await journeysPage.isJourneysGridEmpty();

        // Act
        const modal = await journeysPage.openNewJourneyModal();
        await modal.cancel();
        await modal.waitForModalClose();

        // Assert
        const stillEmpty = await journeysPage.isJourneysGridEmpty();
        expect(stillEmpty).toBe(initialJourneysEmpty);
    });

    test("should validate required fields", async ({ page }) => {
        // Arrange
        const modal = await journeysPage.openNewJourneyModal();

        // Act - submit empty form
        await test.step("Submit empty form", async () => {
            await modal.submitJourney();
            
            // Assert
            // Check inputs are still visible
            await expect(page.getByTestId("destination-input")).toBeVisible();
            await expect(page.getByTestId("departure-date-input")).toBeVisible();
            await expect(page.getByTestId("return-date-input")).toBeVisible();

            // Check for validation errors
            const errorCount = await page
                .getByTestId(/error|warning|validation/)
                .count();
            
            // If no specific test IDs for errors, fall back to classes
            if (errorCount === 0) {
                const classErrorCount = await page
                    .locator(".field-warning, .validation-message, [data-error], .text-red-500, .error-text")
                    .count();
                expect(classErrorCount).toBeGreaterThan(0);
            } else {
                expect(errorCount).toBeGreaterThan(0);
            }
        });
    });

    test("should handle API errors gracefully", async ({ page }) => {
        // Arrange
        const modal = await journeysPage.openNewJourneyModal();

        // Mock API to return error
        await page.route("/api/journeys", async (route) => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({ error: "Internal Server Error" }),
            });
        });

        // Act
        await modal.fillJourneyForm(barcelonaJourney);
        await modal.submitJourney();
        
        // Assert
        await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId("error-message")).toContainText(/failed|error/i);
        await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();
    });

    test("should manage activities dynamically", async ({ page }) => {
        // Arrange
        const modal = await journeysPage.openNewJourneyModal();
        
        await test.step("Add and remove activities", async () => {
            // Wait for activity inputs to be available
            await page.getByTestId(/^activity-name-input-/).first().waitFor({
                state: "attached",
                timeout: 5000,
            });

            // Get initial count of activities
            const initialCount = await page.getByTestId(/^activity-name-input-/).count();

            // Act - add activities
            await modal.addActivity();
            await expect(page.getByTestId(/^activity-name-input-/)).toHaveCount(initialCount + 1);

            await modal.addActivity();
            await expect(page.getByTestId(/^activity-name-input-/)).toHaveCount(initialCount + 2);

            // Act - remove activity
            await modal.removeActivity(0);
            await expect(page.getByTestId(/^activity-name-input-/)).toHaveCount(initialCount + 1);
        });
    });
});
