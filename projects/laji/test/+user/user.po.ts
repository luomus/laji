import { Page, expect } from '@playwright/test';

// use this when page is expected to be on the laji-auth page
export const lajiAuthLogin = async (page: Page) => {
  await page.locator('#local-login').click();
  await page.locator('[name="email"]').fill(process.env.E2E_USER);
  await page.locator('[name="password"]').fill(process.env.E2E_PASS);
  await page.locator('button.submit').click();
};

// use this when page is expected to be in laji.fi
export const lajiFiLogin = async (page: Page) => {
  await page.locator('#login-link').click(); // laji.fi login link
  await lajiAuthLogin(page);
};

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

  // first navigate to the app on a fresh page instance
  // eg. a fresh page instance has url "about:blank" in chromium
  if (!page.url().match(/http.*/)) {
    await page.goto('/');
  }

  if (page.url().match(/https?:\/\/(localhost|127.0.0.1)/)) {
    await lajiFiLogin(page);
  } else {
    await lajiAuthLogin(page);
  }
};

export const logout = async (page: Page) => {
  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};

export const expectToBeOnLajiAuthLogin = async (page: Page) => {
  await expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
};
