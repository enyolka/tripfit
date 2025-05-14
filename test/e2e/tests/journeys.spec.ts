import { test, expect } from '@playwright/test';
import { JourneysPage } from '../page-objects/JourneysPage';
import type { JourneyData } from '../page-objects/NewJourneyModal';

test.describe('Journey Management', () => {
    let journeysPage: JourneysPage;

    test.beforeEach(async ({ page }) => {
        journeysPage = new JourneysPage(page);
        await journeysPage.navigateToJourneys();
    });

    test('should create a new journey', async () => {
        // Arrange
        const newJourney: JourneyData = {
            destination: 'Paris',
            departureDate: '2025-06-15',
            returnDate: '2025-06-22',
            activities: [
                { name: 'Sightseeing', level: 2 },
                { name: 'Museums', level: 3 }
            ]
        };

        // Act
        const modal = await journeysPage.openNewJourneyModal();
        await modal.fillJourneyForm(newJourney);
        await modal.submitJourney();
        await modal.waitForModalClose();

        // Assert
        const journeysList = await journeysPage.getJourneysList();
        await expect(journeysList).toContainText(newJourney.destination);
    });

    test('should cancel journey creation', async () => {
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
