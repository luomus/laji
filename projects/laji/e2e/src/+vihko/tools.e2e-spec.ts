import * as path from 'path';
import { ErrorPage } from '../+error/error.page';
import { UserPage } from '../+user/user.po';
import { SpreadsheetPage } from '../shared/spreadsheet.po';
import { ToolsPage } from './tools.po';

describe('Tools page', () => {
  let page: ToolsPage;
  let user: UserPage;
  let error: ErrorPage;
  let spreadsheet: SpreadsheetPage;

  beforeAll(async (done) => {
    user = new UserPage();
    page = new ToolsPage();
    error = new ErrorPage();
    spreadsheet = new SpreadsheetPage();
    await page.navigateTo();
    await user.login();
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should links should be visible on tools page', async (done) => {
    expect(await page.toolsLink.isDisplayed()).toBe(true, 'Tools link should be visible on tools page');
    expect(await page.importLink.isDisplayed()).toBe(true, 'Import link should be visible on tools page');
    done();
  });

  describe('Importing', () => {

    beforeAll(async (done) => {
      await page.importLink.click();
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
      expect(await spreadsheet.getDocumentCountText()).toBe('1', 'With default setting 1 document should be created');
      expect(await spreadsheet.countCellWithValue('2020-03-01')).toBe(3, 'There should be 3 elements in table with value 2020-03-01');
      done();
    });

    it('should be able to skip row with no numbers', async (done) => {
      await spreadsheet.selectOnlyRowsWithNumber();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(1, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('1', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able send each row as document', async (done) => {
      await spreadsheet.selectEachRowAsOwnDocument();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(1, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('2', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able send each row as document even with no count', async (done) => {
      await spreadsheet.selectRowsWithoutNumber();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(0, 'There should be a warning that the row is skipped');
      expect(await spreadsheet.getDocumentCountText()).toBe('3', 'Selecting to skip non count rows should not effect document count');
      done();
    });

    it('should be able save document', async (done) => {
      await spreadsheet.clickSaveWithoutPublishing();
      expect(await spreadsheet.getErrorCount()).toBe(0, 'There should not be errors when importing valid file');
      expect(await spreadsheet.getWarningCount()).toBe(0, 'There should be no warnings when importing file with valid data');
      done();
    });

  });

});
