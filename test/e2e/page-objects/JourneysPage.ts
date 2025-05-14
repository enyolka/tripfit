import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { NewJourneyModal } from './NewJourneyModal';

export class JourneysPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /**
     * Wait for page to be ready
     */
    async waitForReady() {
        await Promise.all([
            this.page.waitForSelector('button[data-testid="create-journey-button"]'),
            this.page.waitForSelector('[data-testid="journeys-grid"]'),
            this.page.waitForLoadState('networkidle')
        ]);
    }

    /**
     * Nawiguje do strony z listą podróży
     */
    async navigateToJourneys() {
        await this.goto('/journeys');
    }

    /**
     * Opens new journey modal
     */
    async openNewJourneyModal() {
        // Wait for button to be ready and click it
        const button = this.page.getByTestId('create-journey-button');
        await button.waitFor({ state: 'visible' });
        await button.click();

        // Wait for and return modal
        const modal = new NewJourneyModal(this.page);
        await modal.waitForModal();
        return modal;
    }

    /**
     * Checks if journey is visible in the list
     */
    async isJourneyVisible(journeyId: number) {
        return await this.page.getByTestId(`journey-item-${journeyId}`).isVisible();
    }

    /**
     * Gets all journeys from the list
     */
    async getJourneysList() {
        return this.page.getByTestId(/^journey-item-\d+$/);
    }

    /**
     * Checks if journeys grid is empty
     */
    async isJourneysGridEmpty() {
        const grid = this.page.getByTestId('journeys-grid');
        const journeys = await grid.getByTestId(/^journey-item-\d+$/).count();
        return journeys === 0;
    }

    /**
     * Clicks the delete button for a journey
     */
    async deleteJourney(journeyId: number) {
        const journey = this.page.getByTestId(`journey-item-${journeyId}`);
        await journey.getByRole('button', { name: 'Delete journey' }).click();
    }
}
