import { browser, by, element, protractor } from 'protractor';
import { NavPage } from '../shared/nav.page';

export class SaveObservationsPage {

  /** Forms that don't have namedPlaced feature on them */
  private simpleForms = element.all(by.css('.survey-box'));
  private legInput = element(by.id('root_gatheringEvent_0_leg'));
  private submitButton = element(by.css('.btn.btn-success.btn-sm'));

  async navigateTo() {
    return browser.get('/save-observations') as Promise<void>;
  }

  async moveTo(): Promise<void> {
    await new NavPage().moveToSaveObservation();
    await browser.waitForAngularEnabled(true);
  }

  clickSimpleFormByIdx(idx: number) {
    return this.simpleForms.get(idx).click();
  }

  countSimpleForms() {
    return this.simpleForms.count() as Promise<number>;
  }

  isPresentSubmitButton() {
    return this.submitButton.isPresent() as Promise<boolean>;
  }

  isPresentLegInput() {
    return this.legInput.isPresent() as Promise<boolean>;
  }

  async getLegInputValue(waitForText?: string) {
    if (waitForText) {
      const EC = protractor.ExpectedConditions;
      const hasValue = EC.textToBePresentInElementValue(this.legInput, waitForText);
      await browser.wait(hasValue, 1000);
    }
    return this.legInput.getAttribute('value') as Promise<string>;
  }

  async getSimpleFormsIdByIdx(idx: number) {
    const EC = protractor.ExpectedConditions;
    const hasForms = EC.presenceOf(this.simpleForms.first());
    await browser.wait(hasForms, 1000);
    return this.simpleForms.get(idx).getText() as Promise<string>;
  }
}
