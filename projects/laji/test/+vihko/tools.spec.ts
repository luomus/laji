import * as path from 'path';
import { SpreadsheetPage } from '../shared/spreadsheet.po';
import { ToolsPage } from './tools.po';
import { expect, test } from '@playwright/test';
import { loginWithPermanentToken } from '../+user/user.po';
import { DocumentFormView, TripFormPage } from './trip-form.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Trip form page', () => {
  let toolsPage: ToolsPage;
  let spreadsheet: SpreadsheetPage;
  let formPage: DocumentFormView;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginWithPermanentToken(page);

    toolsPage = new ToolsPage(page);
    spreadsheet = new SpreadsheetPage(page);
    formPage = new TripFormPage(page).documentFormView;

    await toolsPage.navigateTo();
  });

  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });


  test('should show links on tools page', async () => {
    await expect(toolsPage.$toolsLink).toBeVisible();
    await expect(toolsPage.$importLink).toBeVisible();
  });


  test.describe('Importing', () => {
    test.describe.configure({mode: 'serial'});

    test.beforeAll(async () => {
      await toolsPage.$importLink.click();
    });

    test('should show file import', async () => {
      await expect(spreadsheet.$fileInput).toBeVisible();
    });

    // skip these for now, sometimes the metadata fetched with graphql has a wrong language for some reason and the tests fail
    test.skip('should be able to upload valid file', async () => {
      await spreadsheet.uploadFile(path.resolve(__dirname, 'ValidRows(JX.519).xlsx'));
      await expect(spreadsheet.$completed).toHaveCount(2);
    });

    test.skip('should be able to link all valid taxon names', async () => {
      await expect(spreadsheet.$nextValue).toBeVisible();
      await spreadsheet.$nextValue.click();
      await expect(spreadsheet.$completed).toHaveCount(3);
      await spreadsheet.waitForDataTableData();
      await expect(spreadsheet.$error).not.toBeVisible();
      expect(await spreadsheet.getDocumentCountText()).toBe('2');
      expect(await spreadsheet.countCellWithValue('2020-03-01')).toBe(3);
      expect(await spreadsheet.countCellWithValue('TEST')).toBe(1);
    });

    test.skip('should be able to skip row with no numbers', async () => {
      await spreadsheet.$countFilterSelect.selectOption('true');
      await spreadsheet.waitForDataTableData();
      await expect(spreadsheet.$error).toHaveCount(0);
      await expect(spreadsheet.$warning).toHaveCount(1);
      expect(await spreadsheet.getDocumentCountText()).toBe('2');
    });

    test.skip('should be able save document', async () => {
      await spreadsheet.$countFilterSelect.selectOption('false');
      await spreadsheet.$saveWithoutPublishing.click();
      await spreadsheet.waitForDataTableData();
      await expect(spreadsheet.$error).toHaveCount(0);
      await expect(spreadsheet.$warning).toHaveCount(0);
    });

  });

  test.describe('Templates', () => {
    test.describe.configure({mode: 'serial'});

    test.beforeAll(async () => {
      await toolsPage.navigateTo();
      await toolsPage.$templateLink.click();
    });

    test('displays submissions table', async () => {
      await expect(toolsPage.templatesDatatable.$container).toBeVisible();
    });

    test('at least one template shown', async () => {
      await toolsPage.templatesDatatable.waitUntilLoaded();
      await expect(toolsPage.templatesDatatable.getRowByIdx(0).$container).toBeVisible();
    });

    test('displays template button', async () => {
      await expect(toolsPage.templatesDatatable.getRowByIdx(0).$templateButton).toBeVisible();
    });

    test('displays delete button', async () => {
      await expect(toolsPage.templatesDatatable.getRowByIdx(0).$deleteButton).toBeVisible();
    });

    test('displays only two buttons', async () => {
      await expect(toolsPage.templatesDatatable.getRowByIdx(0).$buttons).toHaveCount(2);
    });

    test('template button directs to form page', async () => {
      await toolsPage.templatesDatatable.getRowByIdx(0).$templateButton.click();
      await expect(formPage.$container).toBeVisible();
    });
  });
});
