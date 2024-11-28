import { Page } from '@playwright/test';
import { MapPageObject } from '@luomus/laji-map/test-export/test-utils';

export class TripFormPage {
  private $todayButton = this.page.locator('button  >> text="Tänään"');
  private $tripFormLink = this.page.locator('a >> text="Retkilomake"');
  public $countryElem = this.page.locator('#root_gatherings_0_country');
  public $toastElement = this.page.locator('#toast-container');
  public $pageTitleElem = this.page.locator('.form-header h3');
  public $overlayElem = this.page.locator('.laji-form.blocking-loader');
  public documentFormView = new DocumentFormView(this.page);
  public templateForm = new TemplateFormView(this.page);

  private mapPage = new MapPageObject(this.page, this.page.locator('.laji-map'));

  constructor(
    private page: Page
  ) {}

  navigateTo() {
    return this.page.goto('/vihko/JX.519');
  }

  navigateToTemplate() {
    return this.page.goto('/vihko/template/JX.519');
  }

  async fillInSimpleForm() {
    await this.$todayButton.click();
    await this.mapPage.drawMarker();
  }

  async clickSavePrivate() {
    await this.documentFormView.savePrivate();
  }

  clickTripFormLink() {
    return this.$tripFormLink.click();
  }
}

export class DocumentFormView {
  public readonly $container = this.page.locator('laji-project-form-form');
  public readonly $form = this.page.locator('laji-form .laji-form');
  public readonly $cancel = this.page.locator('laji-form-footer .btn-danger');
  public readonly $save = this.page.locator('laji-form-footer .btn-success');
  public readonly $savePrivate = this.page.locator('laji-form-footer .btn-default');
  public readonly $blockingLoader = this.page.locator('.laji-form.blocking-loader');
  public readonly $openNamedPlaceLinker = this.$container.locator('#link-to-np');

  constructor(
    private page: Page
  ) {}

  getContextId = async () => (await this.$form.locator('.rjsf > .form-group').getAttribute('id')).match(/\d+/)[0];

  $findLajiFormNode = async (locator: string) => {
    const contextId = await this.getContextId();
    return this.$form.locator(`#_laji-form_${contextId}_root_${locator.replace(/\./g, '_')}`);
  }

  async savePrivate() {
    await this.$savePrivate.click();
    await this.$blockingLoader.waitFor({state: 'hidden'});
  }

  async save() {
    await this.$save.click();
    await this.$blockingLoader.waitFor({state: 'hidden'});
  }

  async isTemplate() {
    const label = await this.$save.innerText();
    return ['Tallenna esitäytetyksi lomakkeeksi.', 'Save as template.', 'Spara som mall.'].includes(label);
  }
}

class TemplateFormView {
  $container = this.page.locator('.template-form');
  $nameInput = this.page.locator('#templateName');
  $descriptionInput = this.page.locator('#templateDescription');
  $saveButton = this.$container.locator('.template-save');

  constructor(
    private page: Page
  ) {}
}
