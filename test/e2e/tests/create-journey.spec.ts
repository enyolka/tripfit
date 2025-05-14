import { test, expect } from "@playwright/test";
import { JourneysPage } from "../page-objects/JourneysPage";
import type { JourneyData } from "../page-objects/NewJourneyModal";
import { ensureAuthenticated } from "../helpers/auth.helper";
import { AuthHelper } from "../models/AuthHelper";

test.describe("Create Journey", () => {
    let journeysPage: JourneysPage;
    let auth: AuthHelper;

    const newJourney: JourneyData = {
        destination: "Barcelona",
        departureDate: "2025-06-15",
        returnDate: "2025-06-22",
        activities: [
            { name: "Beach", level: 1 },
            { name: "Sightseeing", level: 2 },
            { name: "Local Cuisine", level: 3 },
        ],
    };

    test.beforeEach(async ({ page }) => {
        // Create page objects
        journeysPage = new JourneysPage(page);
        auth = new AuthHelper(page);

        // Ensure user is authenticated
        await ensureAuthenticated(page);

        // Wait for the journey page to be ready
        await page.waitForSelector('button[data-testid="create-journey-button"]', {
            state: "visible",
            timeout: 5000,
        });
    });

    test.afterEach(async ({ context }) => {
        // Clear context after each test
        await context.clearCookies();
        // Attempt to logout if still logged in
        if (auth && (await auth.isLoggedIn())) {
            await auth.logout();
        }
    });

    test("should create a new journey and display it on the list", async ({ page }) => {
        const modal = await test.step("Open new journey modal", async () => {
            const modal = await journeysPage.openNewJourneyModal();
            await expect(page.getByTestId("new-journey-modal")).toBeVisible();
            return modal;
        });

        await test.step("Fill journey form", async () => {
            await modal.fillJourneyForm(newJourney);
        });

        await test.step("Submit journey form", async () => {
            await modal.submitJourney();
            await modal.waitForModalClose();
        });

        await test.step("Verify journey appears in list", async () => {
            // Wait for journey list to load
            await page.waitForSelector('[data-testid^="journey-item-"]');

            // Check if any of the journey items contain the expected destination
            const journeyTexts = await page.locator('[data-testid^="journey-item-"]').allTextContents();
            const hasDestination = journeyTexts.some((text) => text.includes(newJourney.destination));
            expect(hasDestination).toBe(true);
        });
    });

    test("should validate required fields", async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();

        await test.step("Submit empty form", async () => {
            await modal.submitJourney(); // Verify validation errors are visible
            await expect(page.getByTestId("destination-input")).toBeVisible();
            await expect(page.getByTestId("departure-date-input")).toBeVisible();
            await expect(page.getByTestId("return-date-input")).toBeVisible();

            // Check for validation warnings - look for error messages
            const errorCount = await page
                .locator(".field-warning, .validation-message, [data-error], .text-red-500, .error-text")
                .count();
            expect(errorCount).toBeGreaterThan(0);
        });
    });

    test("should handle API errors gracefully", async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();

        // Mock API to return error
        await page.route("/api/journeys", async (route) => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({ error: "Internal Server Error" }),
            });
        });
        await modal.fillJourneyForm(newJourney);
        await modal.submitJourney();
        // Wait for and verify the error message from JourneysView is displayed
        await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId("error-message")).toContainText(/failed|error/i);
        await expect(page.locator("button", { hasText: "Retry" })).toBeVisible();
    });
    test("should manage activities dynamically", async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();
        await test.step("Add and remove activities", async () => {
            // Wait for modal to be fully loaded and stable
            await page.waitForTimeout(500); // Small delay to ensure modal is fully rendered

            // Wait for activity inputs to be available in the DOM
            await page.waitForSelector('[data-testid^="activity-name-input-"]', {
                state: "attached",
                timeout: 5000,
            });

            // Make sure we have a consistent starting point - we expect at least one activity by default
            // If no activities exist yet, wait a bit more to ensure they're loaded
            let initialCount = await page.getByTestId(/activity-name-input-\d+/).count();

            console.log(`Starting with ${initialCount} activities`);

            // Add first activity
            await modal.addActivity();
            await page.waitForTimeout(200); // Small delay to ensure state update
            await expect(page.getByTestId(/activity-name-input-\d+/)).toHaveCount(initialCount + 1);

            // Add second activity
            await modal.addActivity();
            await page.waitForTimeout(200); // Small delay to ensure state update
            await expect(page.getByTestId(/activity-name-input-\d+/)).toHaveCount(initialCount + 2);

            // Remove first activity
            await modal.removeActivity(0);
            await page.waitForTimeout(200); // Small delay to ensure state update
            await expect(page.getByTestId(/activity-name-input-\d+/)).toHaveCount(initialCount + 1);
        });
    });
});
