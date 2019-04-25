import { browser, by, element, promise as wdpromise } from 'protractor';
import { NavPage } from '../shared/nav.page';

export class VihkoPage {

  /** Forms that don't have namedPlaced feature on them */
  private simpleForms = element.all(by.css('.form.btn'));
  private legInput = element(by.id('root_gatheringEvent_0_leg'));
  private submitButton = element(by.css('.btn.btn-success.btn-sm'));

  navigateTo(): void {
    browser.get('/vihko');
  }

  moveTo(): void {
    new NavPage().moveToVihko();
  }

  clickSimpleFormByIdx(idx: number): void {
    this.simpleForms.get(idx).click();
  }

  countSimpleForms(): wdpromise.Promise<number> {
    return this.simpleForms.count();
  }

  isPresentSubmitButton(): wdpromise.Promise<boolean> {
    return this.submitButton.isPresent();
  }

  isPresentLegInput(): wdpromise.Promise<boolean> {
    return this.legInput.isPresent();
  }

  getLegInputValue(): wdpromise.Promise<string> {
    return this.legInput.getAttribute('value');
  }

  getSimpleFormsIdByIdx(idx: number): wdpromise.Promise<string> {
    return this.simpleForms.get(idx).getText();
  }
}
