import { ErrorPage } from '../+error/error.page';
import { UserPage } from '../+user/user.po';
import { TripFormPage } from './trip-form.po';
import { TemplatesView } from './tools.po';
import { isDisplayed, waitForVisibility } from '../../helper';

  describe('Trip form template page', () => {

  const user = new UserPage();
  const page = new TripFormPage();
  const error = new ErrorPage();
  const templatesView = new TemplatesView();

    beforeAll(async (done) => {
      await user.handleNavigationWithExternalLogin(() => page.navigateToTemplate());
      done();
    });

    afterEach(async (done) => {
      expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
      done();
    });

    it('template form is shown', async (done) => {
      page.documentFormView.isTemplate();
      done();
    });

    it('should be able to fill in form with simple data', async (done) => {
      await page.fillInSimpleForm();
      expect(await page.getCountryName()).toBe('Suomi', 'Country should be autofilled with Suomi');
      done();
    });


    it('saving displays template naming form', async (done) => {
      await page.documentFormView.save();
      expect(await isDisplayed(page.templateForm.$container)).toBe(true);
      done();
    });

    const name = Math.random().toString().substr(2, 8);

    it('saving template directs to Vihko template page', async (done) => {
      await page.templateForm.$nameInput.sendKeys(name);
      await page.templateForm.$descriptionInput.sendKeys('test desc');
      await page.templateForm.$saveButton.click();
      await waitForVisibility(templatesView.$container);
      expect(await isDisplayed(templatesView.$container)).toBe(true);
      done();
    });

    let row;

    it('template is shown in table', async (done) => {
      for (let idx = 0; idx <  await templatesView.datatable.$$rows.count(); idx++) {
        const iteratedRow = templatesView.datatable.getRow(idx);
        const cell = iteratedRow.$container.$(`span[title="${name}"]`);
        if (await isDisplayed(cell)) {
          row = iteratedRow;
          break;
        }
      }
      expect(!!row).toBe(true, 'template datatable didn\'t have added templates name visible');
      done();
    });

    it('template delete confirms', async (done) => {
      await row.$deleteButton.click();
      expect(await isDisplayed(templatesView.datatable.getDeleteModal().$container)).toBe(true);
      done();
    });

    it('template can be deleted', async (done) => {
      const rowCount = await templatesView.datatable.$$rows.count();
      await templatesView.datatable.getDeleteModal().$confirm.click();
      expect(await templatesView.datatable.$$rows.count()).not.toBe(rowCount);
      done();
    });
  });
