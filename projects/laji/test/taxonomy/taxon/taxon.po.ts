import { Locator, Page } from '@playwright/test';

export class TaxonPage {
  // header = this.getTaxonName(this.page.locator('laji-info-card-header h1'));
  header = this.getTaxonName(this.page.locator('laji-info-card-header h1'));
  // tree = new TaxonTreePO(this.page.locator('laji-taxon-tree'));

  constructor(private page: Page) { }

  $container = this.page;
  $taxonomy = this.page.locator('laji-taxon-taxonomy');

  getTaxonName(locator: Locator) {
    const $container = locator.locator('laji-taxon-name');
    return {
      $container,
      $scientificName: $container.locator('.scientific-name'),
      $vernacularName: $container.locator('.vernacular-name'),
      $colloquialVernacularName: $container.locator('.colloquial-vernacular-name')
    };
  }

  tree = {
    openBtn$: this.page.locator('lu-sidebar .open-btn'),
    $content: this.page.locator('.sidebar-content'),
  };

  breadcrumbs$ = this.page.locator('.taxon-breadcrumbs');

  // taxonomy = {
  //   openBtn$: this.page.locator('lu-tabs .open-btn'),
  //   $content: this.page.locator('laji-taxon-taxonomy'),
  // }
}
