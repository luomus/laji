import { Page, expect, Response } from '@playwright/test';

// use this as default as it's faster than the manual login
export const loginWithPermanentToken = async (page: Page) => {
  if (!process.env.E2E_PERSON_TOKEN) {
    throw new Error('Missing E2E_PERSON_TOKEN');
  }

  const currentPath = new URL(page.url()).pathname;
  await page.goto(
    `http://localhost:3000/user/login?token=${process.env.E2E_PERSON_TOKEN}&next=${currentPath}`
  );

  await page.locator('#logged-in-user').waitFor({timeout: 15000});
};

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
  // first navigate to the app on a fresh page instance
  // e.g. a fresh page instance has url "about:blank" in chromium
  if (!page.url().match(/http.*/)) {
    await page.goto('/');
  }

  if (page.url().match(/https?:\/\/(localhost|127.0.0.1)/)) {
    await lajiFiLogin(page);
  } else {
    await lajiAuthLogin(page);
  }

  await page.locator('#logged-in-user').waitFor({timeout: 15000});
};

export const logout = async (page: Page) => {
  // get the person token by navigating to the front page and
  // looking for a request to the /api/person/<token> endpoint
  let token: string;
  page.on('response', (resp: Response) => {
    const match = resp.url().match(/^.*api\/person\/([^\/]+)$/);
    if (match) {
      token = match[1];
    }
  });
  await page.goto('/');

  if (token && token === process.env.PERSON_TOKEN) {
    throw Error('Can\'t log out when using the permanent person token');
  }

  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};

export const expectToBeOnLajiAuthLogin = async (page: Page) => {
  await expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
};
