import { test, expect } from '@playwright/test';
import { MapPage } from './map.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Map page', () => {

  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('should zoom in to data on the map', async ({page}) => {
    const mapPage = new MapPage(page);
    await mapPage.navigateToMapWithObservationData();
    await expect(mapPage.$closeTile).toBeVisible();
  });
});
