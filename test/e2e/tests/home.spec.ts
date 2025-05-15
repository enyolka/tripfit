import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/HomePage";

test.describe("Home Page", () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        // Navigate to the home page before each test
        // Arrange
        homePage = new HomePage(page);

        // Act
        await homePage.goto();
    });

    test("should navigate to login page when login button is clicked", async ({ page }) => {
        // Act
        await homePage.clickLogin();

        // Assert
        await expect(page).toHaveURL(/.*login/);
    });

    test("should navigate to register page when register button is clicked", async ({ page }) => {
        // Act
        await homePage.clickRegister();

        // Assert
        await expect(page).toHaveURL(/.*register/);
    });

    test("should have navigation links", async () => {
        // Act
        const navLinks = await homePage.getNavigationLinksText();

        // Assert
        expect(navLinks.length).toBeGreaterThan(0);
    });
});
