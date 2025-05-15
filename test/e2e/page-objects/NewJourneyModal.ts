import { BasePage } from "./core/BasePage";

export interface JourneyData {
    destination: string;
    departureDate: string;
    returnDate: string;
    activities?: {
        name: string;
        level: number;
    }[];
}

export class NewJourneyModal extends BasePage {
    /**
     * Waits for modal to be visible and ready
     */
    async waitForModal(): Promise<void> {
        await this.getByTestId("new-journey-modal").waitFor({ state: "visible" });
        await this.getByTestId("destination-input").waitFor({ state: "visible" });
        await this.getByTestId("departure-date-input").waitFor({ state: "visible" });
        await this.getByTestId("return-date-input").waitFor({ state: "visible" });
        await this.getByTestId("submit-journey-button").waitFor({ state: "visible" });
    }

    /**
     * Fills form with journey data
     *
     * @param data - Journey data to fill into the form
     */
    async fillJourneyForm(data: JourneyData): Promise<void> {
        await this.getByTestId("destination-input").fill(data.destination);
        await this.getByTestId("departure-date-input").fill(data.departureDate);
        await this.getByTestId("return-date-input").fill(data.returnDate);
        if (data.activities && data.activities.length > 0) {
            for (const [index, activity] of data.activities.entries()) {
                if (index > 0) {
                    await this.addActivity();
                }
                await this.getByTestId(`activity-name-input-${index}`).fill(activity.name);
                await this.getByTestId(`activity-level-input-${index}`).fill(activity.level.toString());
            }
        }
    }

    /**
     * Submits the journey form
     */
    async submitJourney(): Promise<void> {
        const submitButton = this.getByTestId("submit-journey-button");
        await submitButton.waitFor({ state: "visible" });
        await submitButton.click();
    }

    /**
     * Cancels journey creation
     */
    async cancel(): Promise<void> {
        const cancelButton = this.getByTestId("cancel-button");
        await cancelButton.waitFor({ state: "visible" });
        await cancelButton.click();
    }

    /**
     * Adds a new activity
     */
    async addActivity(): Promise<void> {
        const addButton = this.getByTestId("add-activity-button");
        await addButton.waitFor({ state: "visible" });
        await addButton.click();
    }

    /**
     * Removes an activity
     *
     * @param index - Index of the activity to remove
     */
    async removeActivity(index: number): Promise<void> {
        const removeButton = this.getByTestId(`remove-activity-button-${index}`);
        await removeButton.waitFor({ state: "visible" });
        await removeButton.click();
    }

    /**
     * Checks if submit is enabled
     */
    async isSubmitEnabled(): Promise<boolean> {
        const submitButton = this.getByTestId("submit-journey-button");
        await submitButton.waitFor({ state: "visible" });
        return submitButton.isEnabled();
    }

    /**
     * Waits for modal to close
     */
    async waitForModalClose(): Promise<void> {
        await this.getByTestId("new-journey-modal").waitFor({ state: "hidden" });
    }

    /**
     * Gets validation error for field
     */
    async getFieldError(fieldName: string) {
        const errorElement = this.page.getByTestId(`${fieldName}-error`);
        await errorElement.waitFor({ state: "visible" });
        return errorElement.textContent();
    }
}
