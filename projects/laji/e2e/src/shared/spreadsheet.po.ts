import { browser, by, element, protractor } from 'protractor';

export class SpreadsheetPage {

  private fileInputElem = element.all(by.css('input[type="file"]'));
  private errorElem = element.all(by.css('.datatable-body .label.label-danger'));
  private warningElem = element.all(by.css('.datatable-body .label.label-warning'));
  private countTrueElement = element(by.css('option[value="true"]'));
  private countFalseElement = element(by.css('option[value="false"]'));
  private rowNoneElement = element(by.css('option[value="none"]'));
  private nextValueElement = element(by.css(':not([disabled]).next-value-map'));
  private completedElements = element.all(by.css('.completed.link'));
  private docCountElements = element(by.css('.doc-count'));
  private dataTableCellElements = element.all(by.css('.datatable-body-cell-label'));
  private saveWithoutPublishingElement = element(by.css('.no-public'));

  isPresentFileInput() {
    return this.fileInputElem.first().isPresent();
  }

  uploadFile(file: string) {
    return this.fileInputElem.first().sendKeys(file);
  }

  getActiveStep() {
    return this.completedElements.count().then(cnt => cnt + 1);
  }

  async isNextValueMapButtonClickable() {
    const EC = protractor.ExpectedConditions;
    const nextElementReady = EC.elementToBeClickable(this.nextValueElement);
    await browser.wait(nextElementReady, 10000);
    return this.nextValueElement.isDisplayed();
  }

  clickNextValueMapButton() {
    return this.nextValueElement.click();
  }

  async getErrorCount() {
    await this.waitForDataTableData();

    return this.errorElem.count() as Promise<number>;
  }

  async getWarningCount() {
    await this.waitForDataTableData();

    return this.warningElem.count() as Promise<number>;
  }

  getDocumentCountText() {
    return this.docCountElements.getText().then(v => v.replace(/[^0-9]+/, ''));
  }

  async selectOnlyRowsWithNumber() {
    await this.countTrueElement.click();
    await browser.waitForAngularEnabled(true);
  }

  async selectRowsWithoutNumber() {
    await this.countFalseElement.click();
    await browser.waitForAngularEnabled(true);
  }

  async selectEachRowAsOwnDocument() {
    await this.rowNoneElement.click();
    await browser.waitForAngularEnabled(true);
  }

  countCellWithValue(value) {
    return (this.dataTableCellElements.getText() as Promise<any>).then(values => values.filter(v => v === value).length);
  }

  clickSaveWithoutPublishing() {
    return this.saveWithoutPublishingElement.click();
  }

  private async waitForDataTableData() {
    const EC = protractor.ExpectedConditions;
    const nextElementReady = EC.presenceOf(this.dataTableCellElements.first());
    await browser.wait(nextElementReady, 30000);
  }

}
