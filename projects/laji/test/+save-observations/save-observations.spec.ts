import { test, expect } from '@playwright/test';
import { SaveObservationsPage } from './save-observations.po';
import { loginWithPermanentToken } from '../+user/user.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Save observations page', () => {
  let saveObservationsPage: SaveObservationsPage;

  test.beforeEach(async ({ page }) => {
    saveObservationsPage = new SaveObservationsPage(page);

    await saveObservationsPage.navigateTo();
    await loginWithPermanentToken(page);
  });

  test.afterEach(async () => {
    await expect(saveObservationsPage.page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('should show list of forms', async () => {
    expect(await saveObservationsPage.simpleForms.count()).toBeGreaterThan(26);
  });

  test('should open form when clicking form button', async () => {
    const fungiAtlasID = 'JX.652';
    await saveObservationsPage.clickFormById(fungiAtlasID);
    await expect(saveObservationsPage.page.locator('.sidebar')).toBeVisible();
  });
});
