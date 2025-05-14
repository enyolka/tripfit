import { type Page } from '@playwright/test';
import { AuthHelper } from '../models/AuthHelper';

/**
 * Helper function to ensure user is authenticated
 * Uses .env.test credentials to log in if not already authenticated
 * Retries failed attempts up to 3 times with exponential backoff
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
    const auth = new AuthHelper(page);
    const maxRetries = 3;
    let attempt = 0;
    
    console.log('Setting up authentication...');

    // First check if we're already logged in
    if (await auth.isLoggedIn()) {
        console.log('User is already authenticated');
        return;
    }

    // If not logged in, try to log in with retries
    while (attempt < maxRetries) {
        try {
            attempt++;
            
            // Perform login
            console.log(`Login attempt ${attempt}/${maxRetries}...`);
            await auth.login();

            // After login, wait a moment and verify we're on the protected page
            await page.waitForTimeout(1000);
            
            if (await auth.isLoggedIn()) {
                console.log('Authentication successful and verified');
                return;
            }

            throw new Error('Login may have succeeded but could not verify protected route access');

        } catch (error) {
            console.error(`Auth attempt ${attempt} failed:`, error);

            // If we're out of retries, give up
            if (attempt >= maxRetries) {
                throw new Error(`Authentication failed after ${maxRetries} attempts: ${error}`);
            }

            // Wait with exponential backoff before retrying
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Retrying in ${delay/1000} seconds...`);
            await page.waitForTimeout(delay);
        }
    }

    // This should never be reached due to the error thrown in the loop
    throw new Error('Unexpected authentication failure');
}
