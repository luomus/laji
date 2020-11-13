import { browser, by, element, protractor } from 'protractor';
import { MapPage } from '../+map/map.po';

export class TripFormPage {

  private readonly todayButton = element(by.buttonText('Tänään'));
  private readonly savePrivateButton = element(by.buttonText('Tallenna julkaisematta'));
  private readonly tripFormLink = element(by.linkText('Retki'));
  private readonly countryElem = element(by.id('root_gatherings_0_country'));
  private readonly toastElement = element(by.id('toast-container'));
  private readonly pageTitleElem = element(by.css('.form-header h3'));
  private readonly overlayElem = element(by.css('.laji-form.blocking-loader'));

  private readonly mapPage = new MapPage();

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
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
    await browser.actions().mouseDown(this.savePrivateButton).perform();
    await browser.sleep(1000);
    await browser.actions().mouseUp(this.savePrivateButton).perform();

    return this.savePrivateButton.click();
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

  async hasOverlayPresent() {
    return this.overlayElem.isPresent();
  }
}
