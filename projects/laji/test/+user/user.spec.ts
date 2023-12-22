import test, { Page, expect } from '@playwright/test';
import { login, logout } from './user.po';

test.describe('User page', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await expect(page.locator('.toast-error'), 'Error dialog is present.').toBeHidden();
  });

  test('should login user', async () => {
    await login(page);
    await expect(page.locator('#logged-in-user')).toBeVisible();
  });

  test('should logout user', async () => {
    await logout(page);
    await page.locator('#logged-in-user').waitFor({ state: 'detached' });
    await expect(page.locator('#login-link')).toBeVisible();
  });
});
