import { browser, $, $$ } from 'protractor';

export class ProjectFormPage {

  public readonly $formLink = $('[href$="/form"]');
  private aboutElem = $('laji-about');
  private mobileLabel = $('[dismisslabel="haseka.terms.mobileFormDismiss"]');
  private closeButton = $('.btn.btn-md.btn-primary.btn-block.use-button');
  private modalBody = $('body.modal-open');

  navigateTo(id, subPage = '') {
    return browser.get(`/project/${id}${subPage}`) as Promise<void>;
  }

  hasFormLink() {
    return this.$formLink.isPresent();
  }

  hasNamedPlace() {
    return new NamedPlacesView().$container.isPresent();
  }

  hasAboutText() {
    return this.aboutElem.isPresent();
  }

  clickFormLink() {
    return this.$formLink.click();
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

export class NamedPlacesView { // tslint:disable-line max-classes-per-file
  public readonly $container = $('laji-named-place');
  public readonly $list = this.$container.$('laji-np-list');
  public readonly $$listItems = this.$list.$$('datatable-body-row');
  public readonly $viewer = $$('.np-info').filter($elem => $elem.isDisplayed()).first();
  public readonly $useButton = this.$viewer.$('.lu-btn.primary');
}

export class DocumentFormView { // tslint:disable-line max-classes-per-file
  public readonly $form = $('laji-form .laji-form');
  $findLajiFormNode = (locator: string) => this.$form.$(`#_laji-form_0_root_${locator.replace(/\./g, '_')}`);
}
