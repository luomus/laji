import { TripFormPage } from './trip-form.po';
import { TemplatesView } from './tools.po';
import { expect, Page, test } from '@playwright/test';
import { loginWithPermanentToken } from '../+user/user.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Trip form template page', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let tripFormPage: TripFormPage;
  let templatesView: TemplatesView;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginWithPermanentToken(page);

    tripFormPage = new TripFormPage(page);
    templatesView = new TemplatesView(page);

    await tripFormPage.navigateToTemplate();
  });

  test.afterEach(async () => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('template form is shown', async () => {
    await tripFormPage.documentFormView.isTemplate();
  });

  test('should be able to fill in form with simple data', async () => {
    await tripFormPage.fillInSimpleForm();
    await expect(tripFormPage.$countryElem).toHaveValue('Suomi');
  });


  test('saving displays template naming form', async () => {
    await tripFormPage.documentFormView.save();
    await expect(tripFormPage.templateForm.$container).toBeVisible();
  });

  const name = Math.random().toString().substr(2, 8);

  test('saving template directs to Vihko template page', async () => {
    await tripFormPage.templateForm.$nameInput.fill(name);
    await tripFormPage.templateForm.$descriptionInput.fill('test desc');
    await tripFormPage.templateForm.$saveButton.click();
    await expect(templatesView.$container).toBeVisible();
  });

  test('template is shown in table', async () => {
    await expect(templatesView.datatable.getRowByCellContent(name).$container).toBeVisible();
  });

  test('template delete confirms', async () => {
    await templatesView.datatable.getRowByCellContent(name).$deleteButton.click();
    await expect(templatesView.datatable.getDeleteModal().$container).toBeVisible();
  });

  test('template can be deleted', async () => {
    const rowCount = await templatesView.datatable.$rows.count();
    await templatesView.datatable.getDeleteModal().$confirm.click();
    await expect(templatesView.datatable.$rows).toHaveCount(rowCount - 1);
  });
});
