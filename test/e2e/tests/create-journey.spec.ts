import { test, expect } from '@playwright/test';
import { JourneysPage } from '../page-objects/JourneysPage';
import type { JourneyData } from '../page-objects/NewJourneyModal';
import { ensureAuthenticated } from '../helpers/auth.helper';
import { AuthHelper } from '../models/AuthHelper';

test.describe('Create Journey', () => {
    let journeysPage: JourneysPage;
    let auth: AuthHelper;

    const newJourney: JourneyData = {
        destination: 'Barcelona',
        departureDate: '2025-06-15',
        returnDate: '2025-06-22',
        activities: [
            { name: 'Beach', level: 1 },
            { name: 'Sightseeing', level: 2 },
            { name: 'Local Cuisine', level: 3 }
        ]
    };

    test.beforeEach(async ({ page }) => {
        // Create page objects
        journeysPage = new JourneysPage(page);
        auth = new AuthHelper(page);

        // Ensure user is authenticated
        await ensureAuthenticated(page);

        // Wait for the journey page to be ready
        await page.waitForSelector('button[data-testid="create-journey-button"]', {
            state: 'visible',
            timeout: 5000
        });
    });

    test.afterEach(async ({ context }) => {
        // Clear context after each test
        await context.clearCookies();
        
        // Attempt to logout if still logged in
        if (auth && await auth.isLoggedIn()) {
            await auth.logout();
        }
    });

    test('should create a new journey and display it on the list', async ({ page }) => {
        await test.step('Take initial screenshot', async () => {
            await expect(page).toHaveScreenshot('journeys-list-empty.png');
        });

        const modal = await test.step('Open new journey modal', async () => {
            const modal = await journeysPage.openNewJourneyModal();
            await expect(page.getByTestId('new-journey-modal')).toBeVisible();
            await expect(page).toHaveScreenshot('new-journey-modal.png');
            return modal;
        });
            
        await test.step('Fill journey form', async () => {
            await modal.fillJourneyForm(newJourney);
            await expect(page).toHaveScreenshot('filled-journey-form.png');
        });

        await test.step('Submit journey form', async () => {
            await modal.submitJourney();
            await modal.waitForModalClose();
        });

        await test.step('Verify journey appears in list', async () => {
            const journeysList = await journeysPage.getJourneysList();
            await expect(journeysList).toContainText(newJourney.destination);
            await expect(page).toHaveScreenshot('journeys-list-with-item.png');
        });
    });

    test('should validate required fields', async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();
        
        await test.step('Submit empty form', async () => {
            await modal.submitJourney();
            
            // Verify error messages
            await expect(page.getByTestId('destination-error')).toBeVisible();
            await expect(page.getByTestId('departure-date-error')).toBeVisible();
            await expect(page.getByTestId('return-date-error')).toBeVisible();
            
            await expect(page).toHaveScreenshot('journey-form-validation.png');
        });
    });

    test('should handle API errors gracefully', async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();
        
        // Mock API to return error
        await page.route('/api/journeys', async route => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' })
            });
        });
        
        await modal.fillJourneyForm(newJourney);
        await modal.submitJourney();
        
        // Verify error handling
        await expect(page.getByTestId('error-message')).toBeVisible();
        await expect(page.getByTestId('error-message')).toContainText('Failed to create journey');
        await expect(page).toHaveScreenshot('journey-form-api-error.png');
    });

    test('should manage activities dynamically', async ({ page }) => {
        const modal = await journeysPage.openNewJourneyModal();
        
        await test.step('Add and remove activities', async () => {
            // Add first activity
            await modal.addActivity();
            await expect(page.getByTestId('activity-name-input-0')).toBeVisible();
            
            // Add second activity
            await modal.addActivity();
            await expect(page.getByTestId('activity-name-input-1')).toBeVisible();
            
            // Remove first activity
            await modal.removeActivity(0);
            await expect(page.getByTestId('activity-name-input-0')).not.toBeVisible();
            
            await expect(page).toHaveScreenshot('journey-form-activities.png');
        });
    });
});
