import { test, expect } from "@playwright/test";
import { JourneysPage } from "../page-objects/JourneysPage";
import type { JourneyData } from "../page-objects/NewJourneyModal";
import { ensureAuthenticated } from "../helpers/auth.helper";
import { AuthHelper } from "../models/AuthHelper";

test.describe("Journey Management", () => {
    let journeysPage: JourneysPage;
    let auth: AuthHelper;
    test.beforeEach(async ({ page }) => {
        journeysPage = new JourneysPage(page);
        auth = new AuthHelper(page);

        // Ensure user is authenticated before navigating to journeys
        await ensureAuthenticated(page);

        // Navigate to journeys page
        await journeysPage.navigateToJourneys();

        // Wait for the journeys page to be ready
        await journeysPage.waitForReady();
    });

    test.afterEach(async ({ context }) => {
        // Clear context after each test
        await context.clearCookies();

        // Attempt to logout if still logged in
        if (auth && (await auth.isLoggedIn())) {
            await auth.logout();
        }
    });

    test("should create a new journey", async ({ page }) => {
        // Arrange
        const newJourney: JourneyData = {
            destination: "Paris",
            departureDate: "2025-06-15",
            returnDate: "2025-06-22",
            activities: [
                { name: "Sightseeing", level: 2 },
                { name: "Museums", level: 3 },
            ],
        };

        // Act
        const modal = await journeysPage.openNewJourneyModal();
        await modal.fillJourneyForm(newJourney);
        await modal.submitJourney();
        await modal.waitForModalClose();

        // Assert
        await page.waitForSelector('[data-testid^="journey-item-"]');

        // Check if any of the journey items contain the expected destination
        const journeyTexts = await page.locator('[data-testid^="journey-item-"]').allTextContents();
        const hasDestination = journeyTexts.some((text) => text.includes(newJourney.destination));
        expect(hasDestination).toBe(true);
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
});
