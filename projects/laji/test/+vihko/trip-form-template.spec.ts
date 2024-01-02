import { ErrorPage } from '../+error/error.page';
import { TripFormPage } from './trip-form.po';
import { TemplatesView } from './tools.po';
import { expect, test } from '@playwright/test';
import { login } from '../+user/user.po';

test.describe('Trip form template page', () => {
  test.describe.configure({ mode: 'serial' });

  let tripFormPage: TripFormPage;
  let error: ErrorPage;
  let templatesView: TemplatesView;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);

    tripFormPage = new TripFormPage(page);
    error = new ErrorPage(page);
    templatesView = new TemplatesView(page);

    await tripFormPage.navigateToTemplate();
  });

  test.afterEach(async () => {
    await expect(error.errorDialog).not.toBeVisible();
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

  let row;

  test('template is shown in table', async () => {
    for (let idx = 0; idx <  await templatesView.datatable.$rows.count(); idx++) {
      const iteratedRow = templatesView.datatable.getRow(idx);
      const cell = iteratedRow.$container.locator(`span[title="${name}"]`);
      if (await cell.isVisible()) {
        row = iteratedRow;
        break;
      }
    }
    expect(!!row).toBe(true);
  });

  test('template delete confirms', async () => {
    await row.$deleteButton.click();
    await expect(templatesView.datatable.getDeleteModal().$container).toBeVisible();
  });

  test('template can be deleted', async () => {
    const rowCount = await templatesView.datatable.$rows.count();
    await templatesView.datatable.getDeleteModal().$confirm.click();
    await expect(templatesView.datatable.$rows).toHaveCount(rowCount - 1);
  });
});
