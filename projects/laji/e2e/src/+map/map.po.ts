import { browser, $ } from 'protractor';
import { MapPageObject } from '@luomus/laji-map/test-export/test-utils';

export class MapPage {

  private readonly $closeTile = $('img[src="https://proxy.laji.fi/mml_wmts/maasto/wmts/1.0.0/maastokartta/default/ETRS-TM35FIN/15/24319/13521.png"]');
  public readonly map = new MapPageObject();

  navigateToMapWithObservationData() {
    // We're no longer zooming to data where there is data?
    // return browser.get('/map?target=Arion+vulgaris&invasive=true&color=a900aa') as Promise<void>;
    return browser.get('/map?coordinates=%2B61.578877%2B023.546876%2F') as Promise<void>;
  }

  isZoomedIn() {
    return this.$closeTile.isPresent() as Promise<boolean>;
  }
}
