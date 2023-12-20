import { expect, test } from '@playwright/test';
import { ErrorPage } from '../../+error/error.page';
import { GeneticResourcePage } from './genetic-resource.po';

test.describe('Genetic Resource page', () => {
  test.afterEach(async ({page}) => {
    const error = new ErrorPage(page);
    await expect(error.errorDialog).not.toBeVisible();
  });

  test('should not have non-graphql api errors', async ({page}) => {
    const geneticResourcePage = new GeneticResourcePage(page);

    await geneticResourcePage.navigateToMollusca();
    await geneticResourcePage.waitUntilLoaded();

    expect(geneticResourcePage.hasNonGQLApiErrors).toBe(false);
  });
});
