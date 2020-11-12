import { browser, $, $$, protractor } from 'protractor';
import { DocumentFormView } from '../+project-form/project-form.po';

const EC = protractor.ExpectedConditions;

export class MobileFormPage {

  imageModal = new ImageModal();
  mapModal = new MapModal();
  documentFormView = new DocumentFormView();

  async fillInSimpleForm() {
    await this.fillAsEmpty();
    const $taxon = this.documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxon');
    await $taxon.$('input').sendKeys('kettu');
    await $taxon.$('input').sendKeys(protractor.Key.ENTER);
    await browser.wait(EC.visibilityOf($taxon.$('.glyphicon-ok')));
    const $date = this.documentFormView.$findLajiFormNode('gatherings.0.dateBegin');
    const scrollToDate = `document.querySelector("#${await $date.$('input').getAttribute('id')}").scrollIntoView()`;
    await browser.driver.executeScript(scrollToDate);
    await $date.$('.today').click();
  }

  async fillAsEmpty() {
    await this.imageModal.$cancel.click();

    await browser.wait(EC.visibilityOf(this.mapModal.$cancel));
    await this.mapModal.$cancel.click();
  }
}

class ImageModal { // tslint:disable-line max-classes-per-file
  $container = $('.media-add-modal');
  $cancel = this.$container.$('.cancel');
}

class MapModal { // tslint:disable-line max-classes-per-file
  $buttonsContainer = $('.floating-buttons-container');
  $cancel = this.$buttonsContainer.$$('button').last();
}

