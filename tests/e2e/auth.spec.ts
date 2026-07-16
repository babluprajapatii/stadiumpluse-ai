import { test, expect } from "@playwright/test";

test.describe("StadiumPulse AI E2E Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Supabase Auth & REST calls to run fully offline/deterministic
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "test-user-uuid",
            email: "fan@stadium.com",
            email_confirmed_at: "2026-07-16T12:00:00Z",
            user_metadata: { role: "fan", name: "Jamie O." },
          },
        }),
      });
    });

    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-uuid",
          email: "newuser@stadium.com",
          email_confirmed_at: "2026-07-16T12:00:00Z",
          user_metadata: { role: "fan", name: "New User" },
        }),
      });
    });

    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-uuid",
          name: "Jamie O.",
          email: "fan@stadium.com",
          role: "fan",
          is_verified: true,
          member_since: "2026-07-16T12:00:00Z",
          last_login: "2026-07-16T12:00:00Z",
        }),
      });
    });

    await page.route("**/rest/v1/settings*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user_id: "test-user-uuid",
          theme: "system",
          language: "en",
          high_contrast: false,
          font_size: "medium",
          reduced_motion: false,
        }),
      });
    });

    await page.route("**/rest/v1/notifications*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "not_1",
            user_id: "test-user-uuid",
            type: "system",
            title: "Welcome",
            message: "Welcome to StadiumPulse AI!",
            priority: "MEDIUM",
            created_at: "2026-07-16T12:00:00Z",
          },
        ]),
      });
    });

    await page.route("**/rest/v1/activity_logs*", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });
  });

  test("Register, Login, Role Routing, Settings, Notifications, and Logout", async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto("/");
    await expect(page).toHaveTitle(/StadiumPulse AI/i);

    // Verify presence of CTA links
    const getStartedLink = page.getByRole("link", { name: /Get Started/i }).first();
    await expect(getStartedLink).toBeVisible();

    // 2. Go to Register Page
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Create Account");

    // Fill form and click submit (mock signup route will intercept)
    await page.fill('input[id="name"]', "New User");
    await page.fill('input[id="email"]', "newuser@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.fill('input[id="confirmPassword"]', "Password123!");
    await page.click('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Should see Verification Pending
    await expect(page.locator("h2")).toContainText("Verification Pending");
    
    // Simulate link click (triggers redirect to verified view and then login)
    await page.click("text=Simulate Link Click");
    await expect(page.locator("h2")).toContainText("Account Verified");

    // Click Proceed to Sign In
    await page.click("text=Proceed to Sign In");
    await expect(page).toHaveURL(/\/login/);

    // 3. Login Flow
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Should redirect to /fan dashboard via middleware + AuthProvider cookie
    await expect(page).toHaveURL(/\/fan/);
    await expect(page.locator("h1")).toContainText("Jamie O.");

    // 4. Verify Notifications Page
    await page.goto("/notifications");
    await expect(page.locator("h1")).toContainText("Notifications Center");

    // 5. Verify Settings Page
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Account Settings");

    // 6. Sign out via Sidebar
    await page.goto("/fan");
    // Open logout confirm dialog
    await page.click("text=Logout");
    // Click confirm button
    await page.click('button.bg-destructive:has-text("Logout")');

    // Should redirect to landing page
    await expect(page).toHaveURL(/\//);
  });
});
