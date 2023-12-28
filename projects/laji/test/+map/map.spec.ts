import { test, expect } from '@playwright/test';
import { MapPage } from './map.po';
import { ErrorPage } from '../+error/error.page';

test.describe('Map page', () => {

  test.afterEach(async ({page}) => {
    const error = new ErrorPage(page);
    await expect(error.errorDialog).not.toBeVisible();
  });

  test('should zoom in to data on the map', async ({page}) => {
    const mapPage = new MapPage(page);
    await mapPage.navigateToMapWithObservationData();
    await expect(mapPage.$closeTile).toBeVisible();
  });
});
