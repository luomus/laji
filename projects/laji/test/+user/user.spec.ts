import test, { Page, expect } from '@playwright/test';
import { login, logout } from './user.po';

test.describe('User page', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    expect(page.locator('.toast-error'), 'Error dialog is present.').not.toBeVisible();
  });

  test('should login user', async () => {
    await login(page);
    expect(page.locator('#logged-in-user')).toBeVisible();
  });

  test('should logout user', async () => {
    await logout(page);
    await page.locator('#logged-in-user').waitFor({ state: 'detached' });
    expect(await page.locator('#login-link').isVisible()).toBe(true);
  });
});
