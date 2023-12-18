import { Locator, Page } from '@playwright/test';
import { MapPageObject } from '@luomus/laji-map/test-export/test-utils';

export class MapPage {
  private page: Page;
  public $closeTile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$closeTile = page.locator('img[src="https://proxy.laji.fi/mml_wmts/maasto/wmts/1.0.0/maastokartta/default/ETRS-TM35FIN/15/24319/13521.png"]');
  }
  public readonly map = new MapPageObject();

  navigateToMapWithObservationData() {
    return this.page.goto('/map?coordinates=%2B61.578877%2B023.546876%2F');
  }

  isZoomedIn() {
    return this.$closeTile.isVisible();
  }
}
