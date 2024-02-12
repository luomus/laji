import { expect, test } from '@playwright/test';
import { GeneticResourcePage } from './genetic-resource.po';
import { ERROR_DIALOG_SELECTOR } from '../../+error/error.po';

test.describe('Genetic Resource page', () => {
  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('should not have non-graphql api errors', async ({page}) => {
    const geneticResourcePage = new GeneticResourcePage(page);

    await geneticResourcePage.navigateToMollusca();
    await geneticResourcePage.waitUntilLoaded();

    expect(geneticResourcePage.pageHasNonGQLApiErrors()).toBe(false);
  });
});
