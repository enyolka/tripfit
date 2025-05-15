import { type Page } from '@playwright/test';
import { BasePage } from './core/BasePage';
import { NewJourneyModal } from './NewJourneyModal';

/**
 * JourneysPage class representing the journeys listing page
 */
export class JourneysPage extends BasePage {
    /**
     * Creates a new JourneysPage instance
     * 
     * @param page - Playwright page object
     */
    constructor(page: Page) {
        super(page);
    }

    /**
     * Wait for page to be ready
     */
    async waitForReady(): Promise<void> {
        await Promise.all([
            this.getByTestId("create-journey-button").waitFor({ state: 'visible' }),
            this.getByTestId("journeys-grid").waitFor({ state: 'visible' }),
            this.waitForNetworkIdle()
        ]);
    }    /**
     * Navigate to journeys page
     */
    async navigateToJourneys(): Promise<void> {
        await this.navigateTo('journeys');
    }

    /**
     * Opens new journey modal
     * 
     * @returns NewJourneyModal instance
     */
    async openNewJourneyModal(): Promise<NewJourneyModal> {
        // Wait for button to be ready and click it
        const button = this.getByTestId('create-journey-button');
        await button.waitFor({ state: 'visible' });
        await button.click();

        // Wait for and return modal
        const modal = new NewJourneyModal(this.page);
        await modal.waitForModal();
        return modal;
    }

    /**
     * Checks if journey is visible in the list
     * 
     * @param journeyId - ID of the journey to check
     */
    async isJourneyVisible(journeyId: number): Promise<boolean> {
        return await this.getByTestId(`journey-item-${journeyId}`).isVisible();
    }

    /**
     * Gets all journeys from the list
     */
    async getJourneysList() {
        return this.getByTestId(/^journey-item-\d+$/);
    }

    /**
     * Checks if journeys grid is empty
     */
    async isJourneysGridEmpty(): Promise<boolean> {
        const grid = this.getByTestId('journeys-grid');
        const journeys = await grid.getByTestId(/^journey-item-\d+$/).count();
        return journeys === 0;
    }

    /**
     * Clicks the delete button for a journey
     * 
     * @param journeyId - ID of the journey to delete
     */
    async deleteJourney(journeyId: number): Promise<void> {
        const journey = this.getByTestId(`journey-item-${journeyId}`);
        await journey.getByRole('button', { name: 'Delete journey' }).click();
    }
}
