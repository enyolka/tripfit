import { type Page, expect } from '@playwright/test';
import { AuthHelper } from '../page-objects/auth/AuthHelper';

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

    try {
        // First check if we're already logged in - go to a protected route
        await page.goto('http://localhost:3000/journeys', { timeout: 10000 });
        await page.waitForLoadState('domcontentloaded');
        
        // Wait a moment for redirects
        await page.waitForTimeout(1000);
        
        // If we're still on the journeys page (not redirected to login), we're logged in
        const currentUrl = page.url();
        
        if (currentUrl.includes('/journeys')) {
            console.log('User is already authenticated (on journeys page)');
            return;
        }
        
        // Also check for user UI elements
        if (await auth.isLoggedIn()) {
            console.log('User is already authenticated (UI indicates logged in)');
            return;
        }
    } catch (e) {
        console.log('Not logged in, proceeding to login');
    }

    // If not logged in, try to log in with retries
    while (attempt < maxRetries) {
        try {
            attempt++;
            
            // Perform login
            console.log(`Login attempt ${attempt}/${maxRetries}...`);
            
            // Go directly to login page
            await page.goto('http://localhost:3000/login', { timeout: 10000 });
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(1000); // Give the page a moment to stabilize
            
            // Check if form exists
            const emailInput = page.locator('[name="email"], input[type="email"]');
            const emailCount = await emailInput.count();
            
            if (emailCount === 0) {
                console.log('Email input not found, might already be logged in');
                // Check if already logged in
                if (await auth.isLoggedIn()) {
                    console.log('User is already authenticated');
                    return;
                } else {
                    throw new Error('Email input not found and user not logged in');
                }
            }
            
            // Fill credentials - select first element to avoid strict mode violations
            await emailInput.first().fill(auth.testEmail);
            
            const passwordInput = page.locator('[name="password"], input[type="password"]');
            await passwordInput.first().fill(auth.testPassword);
            
            // Find and click submit button
            const submitButton = page.locator('button[type="submit"], button:has-text("Sign in")');
            
            // Click submit and handle navigation manually
            await submitButton.first().click();
            
            // Wait for navigation to complete - try multiple options
            try {
                // Method 1: Wait for protected URL
                await page.waitForURL(url => 
                    url.href.includes('/journeys') || 
                    url.href.includes('/dashboard'), 
                    { timeout: 5000 }
                );
            } catch (e) {
                // Method 2: Wait for page load and then check URL
                await page.waitForLoadState('networkidle', { timeout: 5000 });
            }
            
            // Check if login was successful by verifying we're on a protected page
            await page.waitForTimeout(2000); // Give the app state time to update after login
            
            const currentUrl = page.url();
            if (currentUrl.includes('/journeys') || currentUrl.includes('/dashboard')) {
                console.log('Authentication successful (URL verified)');
                return;
            }
            
            // Final check with UI elements
            if (await auth.isLoggedIn()) {
                console.log('Authentication successful (UI verified)');
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
