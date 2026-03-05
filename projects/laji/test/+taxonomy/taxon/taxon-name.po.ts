import { Locator } from '@playwright/test';

export class TaxonNamePO {
  $container = this.locator.locator('laji-taxon-name');
  $scientificName = this.locator.locator('.scientific-name');
  $vernacularName = this.locator.locator('.vernacular-name');
  $colloquialVernacularName = this.locator.locator('.colloquial-vernacular-name');

  constructor(private locator: Locator) { }
}
