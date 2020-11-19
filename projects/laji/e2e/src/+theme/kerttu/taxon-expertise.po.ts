import {browser, by, element, protractor} from 'protractor';

export class KerttuTaxonExpertisePage {
  private finnishBirdSongRecognitionSkillLevelOptions = element(by.id('finnishBirdSongRecognitionSkillLevel')).all(by.tagName('option'));
  private birdwatchingActivityLevelOptions = element(by.id('birdwatchingActivityLevel')).all(by.tagName('option'));
  private selectAllTaxonsCheckbox = element(by.css('datatable-header .datatable-checkbox input'));

  private savingStatus = element.all(by.className('saving-status')).first();

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
    return browser.get('/theme/kerttu/expertise') as Promise<void>;
  }

  async checkThatEverythingIsFilled() {
    const successText = await this.savingStatus.getText();

    await this.finnishBirdSongRecognitionSkillLevelOptions.last().click();
    await this.birdwatchingActivityLevelOptions.last().click();
    const isSelected = await this.selectAllTaxonsCheckbox.isSelected();
    if (!isSelected) {
      await this.selectAllTaxonsCheckbox.click();
    }

    try {
      const successEC = protractor.ExpectedConditions;
      const savingComplete = successEC.textToBePresentInElement(this.savingStatus, successText);
      await browser.wait(savingComplete, 5000);
    } catch (e) {}
  }
}
