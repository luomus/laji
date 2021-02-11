import { browser, by, element, protractor } from 'protractor';
import { MapPage } from '../+map/map.po';
import { DocumentFormView } from '../+project-form/project-form.po';
import { isDisplayed } from '../../helper';

export class TripFormPage {

  private readonly todayButton = element(by.buttonText('Tänään'));
  private readonly tripFormLink = element(by.linkText('Retki'));
  public readonly countryElem = element(by.id('root_gatherings_0_country'));
  private readonly toastElement = element(by.id('toast-container'));
  private readonly pageTitleElem = element(by.css('.form-header h3'));
  private readonly overlayElem = element(by.css('.laji-form.blocking-loader'));
  private readonly documentFormView = new DocumentFormView();

  private readonly mapPage = new MapPage();

  async navigateTo() {
    return browser.get('/vihko/JX.519') as Promise<void>;
  }

  async fillInSimpleForm() {
    await this.todayButton.click();
    await this.mapPage.map.drawMarker();

    const EC = protractor.ExpectedConditions;
    const countryFetched = EC.textToBePresentInElementValue(this.countryElem, 'Suomi');
    await browser.wait(countryFetched, 5000);
  }

  async getCountryName() {
    return this.countryElem.getAttribute('value');
  }

  async clickSavePrivate() {
    await this.documentFormView.savePrivate();
  }

  getToasterText() {
    return this.toastElement.getText();
  }

  clickTripFormLink() {
    return this.tripFormLink.click();
  }

  getPageTitle() {
    return this.pageTitleElem.getText();
  }

  hasOverlayPresent() {
    return this.overlayElem.isPresent();
  }

  hasDiscardLocalData() {
    return isDisplayed(this.documentFormView.$discardLocalDataBtn);
  }

  discardLocalData() {
    return this.documentFormView.$discardLocalDataBtn.click();
  }
}
