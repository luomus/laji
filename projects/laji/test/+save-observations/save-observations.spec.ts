import { test, expect } from '@playwright/test';
import { SaveObservationsPage } from './save-observations.po';
import { login } from '../+user/user.po';
import { ErrorPage } from '../+error/error.page';

test.describe('Save observations page', () => {
  let saveObservationsPage: SaveObservationsPage;
  let error: ErrorPage;

  test.beforeEach(async ({ page }) => {
    saveObservationsPage = new SaveObservationsPage(page);
    error = new ErrorPage(page);

    await saveObservationsPage.navigateTo();
    await login(page);
  });

  test.afterEach(async () => {
    expect(await error.isPresentErrorDialog()).toBe(false);
  });

  test('should show list of forms', async () => {
    await expect(saveObservationsPage.simpleForms).toHaveCount(27);
  });

  test('should open form when clicking form button', async () => {
    const fungiAtlasID = 'JX.652';
    await saveObservationsPage.clickFormById(fungiAtlasID);
    await expect(saveObservationsPage._page.locator('.sidebar')).toBeVisible();
  });
});
