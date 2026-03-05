import { Page } from '@playwright/test';
import { TaxonNamePO } from './taxon-name.po';

export class TaxonPage {
  header = new TaxonNamePO(this.page.locator('laji-info-card-header h1'));

  constructor(private page: Page) { }
}
