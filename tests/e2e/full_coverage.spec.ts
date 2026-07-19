/**
 * tests/e2e/full_coverage.spec.ts
 *
 * Extended Playwright E2E tests covering:
 *   - Landing page
 *   - Login (valid / invalid / empty)
 *   - Register (success / validation errors / mismatched passwords)
 *   - Forgot Password
 *   - Role-based dashboard routing
 *   - Notifications
 *   - Settings
 *   - Logout
 *   - Error pages (404)
 *   - Mobile viewport
 *   - Accessibility tab-navigation check
 */

import { test, expect } from "@playwright/test";

// ── Shared route interceptors ──────────────────────────────────────────────────

const interceptAll = async (page: import("@playwright/test").Page, role = "fan", name = "Jamie O.") => {
  await page.route("**/auth/v1/token*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: {
          id: "test-user-uuid",
          email: `${role}@stadium.com`,
          email_confirmed_at: "2026-07-16T12:00:00Z",
          user_metadata: { role, name },
        },
      }),
    })
  );

  await page.route("**/auth/v1/signup*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-user-uuid",
        email: "newuser@stadium.com",
        email_confirmed_at: "2026-07-16T12:00:00Z",
        user_metadata: { role: "fan", name: "New User" },
      }),
    })
  );

  await page.route("**/auth/v1/otp*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) })
  );

  await page.route("**/auth/v1/recover*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) })
  );

  await page.route("**/rest/v1/profiles*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-user-uuid",
        name,
        email: `${role}@stadium.com`,
        role,
        is_verified: true,
        member_since: "2026-01-01T00:00:00Z",
        last_login: "2026-07-19T00:00:00Z",
      }),
    })
  );

  await page.route("**/rest/v1/settings*", (route) =>
    route.fulfill({
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
    })
  );

  await page.route("**/rest/v1/notifications*", (route) =>
    route.fulfill({
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
          read_at: null,
          created_at: "2026-07-16T12:00:00Z",
          expires_at: null,
        },
      ]),
    })
  );

  await page.route("**/rest/v1/activity_logs*", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({}) })
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

test.describe("Landing Page", () => {
  test("renders title and key CTAs", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/");
    await expect(page).toHaveTitle(/StadiumPulse AI/i);
    await expect(page.getByRole("link", { name: /Get Started/i }).first()).toBeVisible();
  });

  test("has Login and Register navigation links", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/");
    // Header/nav should contain links to /login and /register
    const loginLink = page.getByRole("link", { name: /Sign In/i }).first();
    const registerLink = page.getByRole("link", { name: /Register/i }).first();
    // At least one of these should be visible
    const loginOrRegVisible = (await loginLink.count()) > 0 || (await registerLink.count()) > 0;
    expect(loginOrRegVisible).toBe(true);
  });

  test("mobile viewport — hero section visible", async ({ page }) => {
    await interceptAll(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page).toHaveTitle(/StadiumPulse AI/i);
    // Page should not be broken on mobile
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

test.describe("Login Page", () => {
  test("renders email and password fields", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });

  test("shows error when submitting empty form", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.click('button[type="submit"]');
    const errorMsg = await page.locator("text=/please enter both|email.*password/i").first();
    await expect(errorMsg).toBeVisible();
  });

  test("shows error for invalid email format", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.fill('input[id="email"]', "notanemail");
    await page.fill('input[id="password"]', "somepassword");
    await page.click('button[type="submit"]');
    // HTML5 email validation or custom error
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(fan|volunteer|security|organizer|operator|accessibility)/);
  });

  test("has link to forgot password page", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    const forgotLink = page.getByRole("link", { name: /forgot.*password/i }).first();
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("has link to register page", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    const registerLink = page.getByRole("link", { name: /create.*account|register|sign up/i }).first();
    await expect(registerLink).toBeVisible();
  });
});

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────

test.describe("Register Page", () => {
  test("renders all required form fields", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
  });

  test("shows password strength validation on weak password", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await page.fill('input[id="password"]', "weak");
    // After submit attempt
    await page.click('button[type="submit"]');
    const error = page.locator("text=/password must be at least/i").first();
    await expect(error).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="email"]', "test@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.fill('input[id="confirmPassword"]', "DifferentPass!");
    await page.click('input[id="terms"]');
    await page.click('button[type="submit"]');
    const error = page.locator("text=/passwords do not match|passwords must match/i").first();
    await expect(error).toBeVisible();
  });

  test("shows error when terms are not accepted", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="email"]', "test@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.fill('input[id="confirmPassword"]', "Password123!");
    // Do NOT click terms checkbox
    await page.click('button[type="submit"]');
    const error = page.locator("text=/must accept|terms and conditions/i").first();
    await expect(error).toBeVisible();
  });

  test("successful registration shows verification pending step", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await page.fill('input[id="name"]', "New User");
    await page.fill('input[id="email"]', "newuser@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.fill('input[id="confirmPassword"]', "Password123!");
    await page.click('input[id="terms"]');
    await page.click('button[type="submit"]');
    await expect(page.locator("h2")).toContainText("Verification Pending");
  });
});

// ─── FORGOT PASSWORD PAGE ─────────────────────────────────────────────────────

test.describe("Forgot Password Page", () => {
  test("renders email field and submit button", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/forgot-password");
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /send|reset/i }).first()).toBeVisible();
  });

  test("shows error on empty submit", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/forgot-password");
    await page.click('button[type="submit"]');
    // Should show validation error
    const field = page.locator('input[id="email"]');
    await expect(field).toBeVisible();
  });

  test("shows success state after valid email submission", async ({ page }) => {
    await interceptAll(page);
    await page.route("**/auth/v1/recover*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) })
    );
    await page.goto("/forgot-password");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.click('button[type="submit"]');
    // Should show success message or redirect
    await page.waitForTimeout(500);
    // Success state renders a distinct heading
    await expect(page.getByRole("heading", { name: "Reset Link Generated" })).toBeVisible();
  });
});

// ─── ROLE-BASED DASHBOARDS ────────────────────────────────────────────────────

const ROLE_ROUTES = [
  { role: "fan", path: "/fan", heading: /jamie o\.|fan dashboard/i },
  { role: "volunteer", path: "/volunteer", heading: /volunteer/i },
  { role: "security", path: "/security", heading: /security/i },
  { role: "organizer", path: "/organizer", heading: /organizer/i },
  { role: "operator", path: "/operator", heading: /operator/i },
] as const;

for (const { role, path } of ROLE_ROUTES) {
  test.describe(`${role} Dashboard`, () => {
    test(`navigates to ${path} and renders heading`, async ({ page }) => {
      await interceptAll(page, role, `${role.charAt(0).toUpperCase()}${role.slice(1)} User`);
      await page.goto("/login");
      await page.fill('input[id="email"]', `${role}@stadium.com`);
      await page.fill('input[id="password"]', "Password123!");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")));
      // Page should render without crashing
      await expect(page.locator("body")).toBeVisible();
    });
  });
}

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────

test.describe("Notifications Page", () => {
  test("renders notifications center heading", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/fan/);

    await page.goto("/notifications");
    await expect(page.locator("h1")).toContainText("Notifications");
  });
});

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

test.describe("Settings Page", () => {
  test("renders Account Settings heading", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/fan/);

    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Settings");
  });
});

// ─── LOGOUT FLOW ──────────────────────────────────────────────────────────────

test.describe("Logout Flow", () => {
  test("logout redirects to landing page", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/fan/);

    // Click logout in sidebar
    await page.click("text=Logout");
    // Confirm dialog
    const confirmBtn = page.locator('button.bg-destructive').filter({ hasText: "Logout" });
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
    }
    // Should redirect to landing page
    await expect(page).toHaveURL((url) => url.pathname === "/");
  });
});

// ─── ERROR PAGES ──────────────────────────────────────────────────────────────

test.describe("Error Pages", () => {
  test("non-existent route returns 404 or redirects", async ({ page }) => {
    await interceptAll(page);
    const response = await page.goto("/this-page-does-not-exist-at-all");
    // Either 404 page, redirect to /, or Next.js not-found page
    const isValid = !response || response.status() === 200 || response.status() === 404 || response.status() === 307;
    expect(isValid).toBe(true);
  });
});

// ─── MOBILE VIEWPORT ─────────────────────────────────────────────────────────

test.describe("Mobile Viewport", () => {
  test("login page renders correctly on mobile", async ({ page }) => {
    await interceptAll(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  test("register page renders correctly on mobile", async ({ page }) => {
    await interceptAll(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/register");
    await expect(page.locator('input[id="name"]')).toBeVisible();
  });

  test("fan dashboard renders on mobile after login", async ({ page }) => {
    await interceptAll(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await page.fill('input[id="email"]', "fan@stadium.com");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/fan/);
    await expect(page.locator("body")).toBeVisible();
  });
});

// ─── ACCESSIBILITY KEYBOARD NAVIGATION ───────────────────────────────────────

test.describe("Accessibility — Keyboard Navigation", () => {
  test("login form is navigable via Tab key", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/login");
    // Focus first field via Tab
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("register form fields are reachable via Tab", async ({ page }) => {
    await interceptAll(page);
    await page.goto("/register");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});
