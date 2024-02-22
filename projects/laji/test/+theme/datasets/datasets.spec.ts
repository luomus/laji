import { test, expect, Page } from '@playwright/test';
import { DatasetsPage } from "./datasets.po";
import { login } from '../../+user/user.po';

test.describe('Datasets page', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let datasetsPage: DatasetsPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
    datasetsPage = new DatasetsPage(page);
    await datasetsPage.navigateTo();
  });

  test('displays cms content', async () => {
    await expect(datasetsPage.$cmsContent).toBeVisible();
  });

  test('displays links to datasets', async () => {
    await expect(datasetsPage.$datasetLinks.first()).toBeVisible();
  });

  test('navigating to dataset link lands on project form page', async ({ baseURL }) => {
    await datasetsPage.$datasetLinks.first().click();
    await expect(page).toHaveURL(new RegExp('^' + baseURL + '\/project\/.*\/about$'));
    await expect(page.locator('laji-about')).toBeVisible();
  });
});
