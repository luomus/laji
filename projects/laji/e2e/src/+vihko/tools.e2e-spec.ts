import * as path from 'path';
import { ErrorPage } from '../+error/error.page';
import { ProjectFormPage } from '../+project-form/project-form.po';
import { UserPage } from '../+user/user.po';
import { isDisplayed, waitForVisibility } from '../../helper';
import { SpreadsheetPage } from '../shared/spreadsheet.po';
import { ToolsPage } from './tools.po';

describe('Tools page', () => {
  const page = new ToolsPage();
  const user = new UserPage();
  const error = new ErrorPage();
  const spreadsheet = new SpreadsheetPage();
  const formPage = new ProjectFormPage().documentFormView;

  beforeAll(async (done) => {
    await user.handleNavigationWithExternalLogin(() => page.navigateTo());
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should show links on tools page', async (done) => {
    await waitForVisibility(page.$toolsLink);
    expect(await page.$toolsLink.isDisplayed()).toBe(true, 'Tools link should be visible on tools page');
    expect(await page.$importLink.isDisplayed()).toBe(true, 'Import link should be visible on tools page');
    done();
  });

  describe('Importing', () => {

    beforeAll(async (done) => {
      expect(await isDisplayed(page.$templateLink)).toBe(true);
      await page.$importLink.click();
      done();
    });

    it('should show file import', async (done) => {
      expect(await spreadsheet.isPresentFileInput()).toBe(true, 'File input should be visible on import page');
      done();
    });

    it('should be able to upload valid file', async (done) => {
      await spreadsheet.uploadFile(path.resolve(__dirname, 'ValidRows(JX.519).xlsx'));
      expect(await spreadsheet.getActiveStep()).toBe(3, 'After uploading valid file we should see taxon linking next');
      done();
    });

    it('should be able to link all valid taxon names', async (done) => {
      expect(await spreadsheet.isNextValueMapButtonClickable()).toBe(true, 'Next button was not clickable in time');
      await spreadsheet.clickNextValueMapButton();
      expect(await spreadsheet.getActiveStep()).toBe(4, 'After uploading valid file we should see taxon linking next');
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getDocumentCountText()).toBe('2', 'With default setting 2 document should be created');
      expect(await spreadsheet.countCellWithValue('2020-03-01')).toBe(3, 'There should be 3 elements in table with value 2020-03-01');
      expect(await spreadsheet.countCellWithValue('TEST')).toBe(1, 'There should be one element in table with value TEST');
      done();
    });

    it('should be able to skip row with no numbers', async (done) => {
      await spreadsheet.selectOnlyRowsWithNumber();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(1, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('2', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able send each row as document', async (done) => {
      if (1 === 1) {
        console.log('Skipped since this option is no longer available for the user');
        done();
        return;
      }
      await spreadsheet.selectEachRowAsOwnDocument();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(1, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('3', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able send each row as document even with no count', async (done) => {
      if (1 === 1) {
        console.log('Skipped since this option is no longer available for the user');
        done();
        return;
      }
      await spreadsheet.selectRowsWithoutNumber();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(0, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('4', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able save document', async (done) => {
      await spreadsheet.selectRowsWithoutNumber();
      await spreadsheet.clickSaveWithoutPublishing();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(0, 'There should be no warnings when importing file with valid data');
      done();
    });

  });

  describe('Templates', () => {
    beforeAll(async (done) => {
      await page.navigateTo();
      await waitForVisibility(page.$templateLink);
      await page.$templateLink.click();
      done();
    });

    it('displays submissions table', async (done) => {
      expect(await isDisplayed(page.templatesDatatable.$container)).toBe(true);
      done();
    });

    it('at least one template shown', async (done) => {
      await page.templatesDatatable.waitUntilLoaded();
      expect(await isDisplayed(page.templatesDatatable.getRow(0).$container)).toBe(true);
      done();
    });

    it('displays template button', async (done) => {
      expect(await isDisplayed(page.templatesDatatable.getRow(0).$templateButton)).toBe(true);
      done();
    });

    it('displays delete button', async (done) => {
      expect(await isDisplayed(page.templatesDatatable.getRow(0).$deleteButton)).toBe(true);
      done();
    });

    it('displays only two buttons', async (done) => {
      expect(await page.templatesDatatable.getRow(0).$$buttons.count()).toBe(2);
      done();
    });

    it('template button directs to form page', async (done) => {
      await page.templatesDatatable.getRow(0).$templateButton.click();
      await waitForVisibility(formPage.$container);
      expect(await isDisplayed(formPage.$container)).toBe(true);
      done();
    });
  });

});
