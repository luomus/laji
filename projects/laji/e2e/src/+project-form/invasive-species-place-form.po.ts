import { browser, $, $$, protractor } from 'protractor';
import { DocumentFormView } from './project-form.po';
import { MapPage } from '../+map/map.po';

const EC = protractor.ExpectedConditions;

export class InvasiveSpeciesPlaceFormPage {

  public readonly documentFormView = new DocumentFormView();
  private readonly map = new MapPage();

  async fillIn(name: string) {
    await this.map.map.drawRectangle();
    await (await this.documentFormView.$findLajiFormNode('name')).$('input')
      .sendKeys(name);
    const $taxon = await this.documentFormView.$findLajiFormNode('taxonIDs.0');
    await $taxon.$('input').sendKeys('kurtturuusu');
    await $taxon.$('input').sendKeys(protractor.Key.TAB);
    await browser.wait(EC.visibilityOf($taxon.$('.glyphicon-ok')));
  }
}
