import { browser, by, element } from 'protractor';
import { NavPage } from '../shared/nav.page';

export class ProjectFormPage {

  private aboutElem = element(by.css('laji-about'));
  private formLink = element(by.css('[href$="/form"]'));
  private mobileLabel = element(by.css('[dismisslabel="haseka.terms.mobileFormDismiss"]'));
  private closeButton = element(by.css('.btn.btn-md.btn-primary.btn-block.use-button'));
  private modalBody = element(by.css('body.modal-open'));
  private namedPlace = element(by.css('laji-named-place'));

  hasFormLink() {
    return this.formLink.isPresent();
  }

  hasNamedPlace() {
    return this.namedPlace.isPresent();
  }

  hasAboutText() {
    return this.aboutElem.isPresent();
  }

  clickFormLink() {
    return this.formLink.click();
  }

  isMobileForm() {
    return this.mobileLabel.isPresent();
  }

  isTermsModalOpen() {
    return this.modalBody.isPresent();
  }

  async closeTermsDialog() {
    await browser.waitForAngularEnabled(true);
    return this.closeButton.click();
  }
}
