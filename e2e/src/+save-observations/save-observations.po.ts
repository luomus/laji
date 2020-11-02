import { browser, by, element } from 'protractor';
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

  getLegInputValue() {
    return this.legInput.getAttribute('value') as Promise<string>;
  }

  getSimpleFormsIdByIdx(idx: number) {
    return this.simpleForms.get(idx).getText() as Promise<string>;
  }
}
