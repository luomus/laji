import { browser, by, element } from 'protractor';

export class MapPage {

  closeTile = element(by.css('img[src="https://proxy.laji.fi/osm/4/9/4.png"]'));

  navigateToMapWithObservationData() {
    return browser.get('/map?target=Arion+vulgaris&invasive=true&color=a900aa') as Promise<void>;
  }

  isZoomedIn() {
    return this.closeTile.isPresent() as Promise<boolean>;
  }
}
