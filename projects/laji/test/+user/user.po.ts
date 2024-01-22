import { Page } from '@playwright/test';

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
  await page.goto(page.url());
  await page.locator('#login-link').click(); // laji.fi login link
  await page.locator('#local-login').click(); // laji-auth
  await page.locator('[name="email"]').fill(process.env.E2E_USER);
  await page.locator('[name="password"]').fill(process.env.E2E_PASS);
  await page.locator('button.submit').click();

  await page.locator('#logged-in-user').waitFor({timeout: 15000});
};

export const logout = async (page: Page) => {
  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};
