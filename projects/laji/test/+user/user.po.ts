import { Page, expect } from '@playwright/test';

export const login = async (page: Page) => {
  const currentPath = new URL(page.url()).pathname;

  // use PERSON_TOKEN based login if possible
  if (process.env.PERSON_TOKEN) {
    await page.goto(
      `http://localhost:3000/user/login?token=${process.env.PERSON_TOKEN}&next=${currentPath}`
    );
    return;
  }

  // fallback to manual login

  // there are three cases:
  //  not yet in app -> navigate to the app
  //  in the app -> click login link -> external login
  //  in external login -> continue login process

  // first navigate to the app on a fresh page instance
  // eg. a fresh page instance has url "about:blank" in chromium
  if (!page.url().match(/http.*/)) {
    await page.goto('/');
  }

  // in the app -> navigate to external login
  await page.waitForLoadState();
  if (await page.locator('#login-link').isVisible()) {
    await page.locator('#login-link').click(); // laji.fi login link
  }

  await page.locator('#local-login').click(); // laji-auth login
  await page.locator('[name="email"]').fill(process.env.E2E_USER);
  await page.locator('[name="password"]').fill(process.env.E2E_PASS);
  await page.locator('button.submit').click();
};

export const logout = async (page: Page) => {
  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};

export const expectToBeOnExternalLoginPage = async (page: Page) => {
  await expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
};
