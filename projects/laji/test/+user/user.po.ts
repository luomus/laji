import { Page } from '@playwright/test';

const getLoginUrlWithToken = (returnPath = '') =>
  `http://localhost:3000/user/login?token=${process.env.PERSON_TOKEN}&next=${returnPath}`;

export const login = async (page: Page) => {
  const currentPath = new URL(page.url()).pathname;
  await page.goto(getLoginUrlWithToken(currentPath));
};

export const logout = async (page: Page) => {
  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};
