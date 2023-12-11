import test, { Page, expect } from '@playwright/test';

const LOGIN_URL_WITH_TOKEN = `http://localhost:3000/user/login?token=${process.env.PERSON_TOKEN}&next=`;

export const login = async (page: Page) => {
  await page.goto(LOGIN_URL_WITH_TOKEN);
};

export const logout = async (page: Page) => {
  await page.locator('#logged-in-user').click();
  await page.locator('a[href="/user/logout"]').click();
};

test.describe('User page', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    expect(await page.locator('.toast-error').isVisible(), 'Error dialog is present.').toBe(false);
  });

  test('should login user', async () => {
    await login(page);

    const usernameElem = page.locator('#logged-in-user');
    expect(await usernameElem.isVisible()).toBe(true);
  });

  test('should logout user', async () => {
    await logout(page);

    await page.locator('#logged-in-user').waitFor({ state: 'detached' });
    expect(await page.locator('#login-link').isVisible()).toBe(true);
  });
});
