/* eslint-disable max-classes-per-file */
import { browser, $, $$, ExpectedConditions, ElementFinder } from 'protractor';
import { ConfirmPO } from '../shared/dialogs.po';
import { getAddressWithLang } from '../../helper';
import { SubmissionsPage as GenericSubmissionsPage } from '../+vihko/submissions.po';
const fiTranslations = require('../../../src/i18n/fi.json');
const enTranslations = require('../../../src/i18n/en.json');
const svTranslations = require('../../../src/i18n/sv.json');

const EC = ExpectedConditions;

const confirmDialog = new ConfirmPO();

export class ProjectFormPage {

  public readonly $formLink = $('[href$="/form"]');
  public readonly $templateLink = $('[href$="/templates"]');
  public readonly $sidebar = $('.sidebar');
  public readonly $disabled = $('laji-project-form-disabled');
  private mobileLabel = $('[dismisslabel="haseka.terms.mobileFormDismiss"]');
  private closeButton = $('.btn.btn-md.btn-primary.btn-block.use-button');
  private modalBody = $('body.modal-open');

  public readonly documentFormView = new DocumentFormView();
  public readonly namedPlacesView = new NamedPlacesView();
  public readonly namedPlacesFormPage = new DocumentFormView();
  public readonly aboutPage = new AboutPage();
  public readonly mobileAboutPage = new MobileAboutPage();
  public readonly namedPlaceLinker = new NamedPlaceLinker();
  public readonly templatePage = new TemplatePage();
  public readonly submissionsPage = new SubmissionsPage();

  navigateTo(id, subPage = '', lang?: 'fi' | 'en' | 'sv') {
    return browser.get(getAddressWithLang(`/project/${id}${subPage}`, lang)) as Promise<void>;
  }

  hasFormLink() {
    return this.$formLink.isPresent();
  }

  hasNamedPlace() {
    return new NamedPlacesView().$container.isPresent();
  }

  hasAboutText() {
    return this.aboutPage.$aboutContent.isPresent();
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

export class NamedPlacesView {
 public readonly $container = $('laji-named-places');

  public readonly $list = this.$container.$('laji-np-list');
  public readonly $$listItems = this.$list.$$('datatable-body-row');
  public readonly $listActiveItem = this.$list.$('datatable-body-row.active');

  public readonly $tabs = this.$container.$('lu-tabs');
  public readonly $listTab = this.$tabs.$$('li').first();
  public readonly $mapTab = this.$tabs.$$('li').last();

  public readonly $map = this.$container.$('laji-np-map');

  public readonly municipalityFilter = new AreaFilter('ML.municipality');
  public readonly birdAssociationAreaFilter = new AreaFilter('ML.birdAssociationArea');

  public readonly $viewer = $$('.np-info').filter($elem => $elem.isDisplayed()).first();
  public readonly getNameInViewer = () => this.$viewer.$('h3').getText();
  public readonly $useButton = this.$viewer.$('.lu-btn.primary');
  public readonly $addButton = this.$container.$('.choose-label .lu-btn.secondary');
  public readonly $deleteButton = this.$viewer.$('#np-delete');
  public readonly $editButton = this.$viewer.$('#np-edit');
  public readonly $modal = this.$container.$('laji-np-info .modal.in');
  public readonly $modalCloseButton = this.$modal.$('.modal-header lu-button');

  async delete() {
    await this.$deleteButton.click();
    await confirmDialog.$confirm.click();
  }
}

class AreaFilter {
  $select: ElementFinder;
  constructor(selector: string) {
    this.$select = $(`laji-area-select[ng-reflect-field="${selector}"]`);
  }

  async selectByIdx(idx: number) {
    await this.$select.click();
    await this.$select.$$('option').get(idx).click();
  }
}

export class DocumentFormView {
  public readonly $container = $('laji-project-form-form');
  public readonly $form = $('laji-form .laji-form');
  public readonly $cancel = $('laji-form-footer .btn-danger');
  public readonly $save = $('laji-form-footer .btn-success');
  public readonly $savePrivate = $('laji-form-footer .btn-default');
  public readonly $blockingLoader = $('.laji-form.blocking-loader');
  public readonly $openNamedPlaceLinker = this.$container.$('#link-to-np');

  getContextId = async () => (await this.$form.$('.rjsf > .form-group').getAttribute('id')).match(/\d+/)[0];

  $findLajiFormNode = async (locator: string) => {
    const contextId = await this.getContextId();
    return this.$form.$(`#_laji-form_${contextId}_root_${locator.replace(/\./g, '_')}`);
  }

  async save() {
    await this.$save.click();
    await browser.wait(EC.invisibilityOf(this.$blockingLoader));
  }

  async savePrivate() {
    await this.$savePrivate.click();
    await browser.wait(EC.invisibilityOf(this.$blockingLoader));
  }

  async isTemplate() {
    const label = await this.$save.getText();
    return [fiTranslations, enTranslations, svTranslations].some(translations => translations['haseka.form.saveTemplate'] === label);
  }
}

class NamedPlaceLinker {
  public readonly $container = $('laji-named-place-linker');
  public readonly namedPlacesView = new NamedPlacesView();
}

class AboutPage {
  public readonly $aboutContent = $('laji-about');
  public readonly $loginButton = $('.login-button');
}

class MobileAboutPage extends AboutPage {
  public readonly $useButton = $('.use-button');
  public readonly $terms = $('laji-project-form-terms');
  public readonly $termsAcceptButton = this.$terms.$('button');
}

class TemplatePage {
  public readonly datatable = new GenericSubmissionsPage().datatable;
}

class SubmissionsPage {
  $container = $('laji-submissions');
}

class DisabledPage {
  public $container = $('laji-project-form-disabled')
}
