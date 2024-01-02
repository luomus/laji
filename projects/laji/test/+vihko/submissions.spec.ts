import { SubmissionsPage } from './submissions.po'
import { test, expect } from '@playwright/test';
import { login } from '../+user/user.po';

test.describe('Trip form page', () => {
  test.describe.configure({mode: 'serial'});

  let submissionsPage: SubmissionsPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);
    submissionsPage = new SubmissionsPage(page);
    await submissionsPage.navigateTo();
    await submissionsPage.datatable.waitUntilLoaded();
  });

  test('displays submissions', async () => {
    await expect(submissionsPage.datatable.$rows).not.toHaveCount(0);
  });

  test('displays view button', async () => {
    await expect(submissionsPage.datatable.getRow(0).$viewButton).toBeVisible();
  });

  test('displays edit button', async () => {
    await expect(submissionsPage.datatable.getRow(0).$editButton).toBeVisible();
  });

  test('displays download button', async () => {
    await expect(submissionsPage.datatable.getRow(0).$downloadButton).toBeVisible();
  });

  test('displays delete button', async () => {
    await expect(submissionsPage.datatable.getRow(0).$deleteButton).toBeVisible();
  });

  test('doesn\'t display template button', async () => {
    await expect(submissionsPage.datatable.getRow(0).$templateButton).toBeHidden();
  });

  test('displays only 4 buttons', async () => {
    await expect(submissionsPage.datatable.getRow(0).$buttons).toHaveCount(4);
  });
});
