import { browser, by, element, promise as wdpromise } from 'protractor';

export class MapPage {

  closeTile = element(by.css('img[src="https://proxy.laji.fi/osm/4/9/4.png"]'));

  navigateToMapWithObservationData(): wdpromise.Promise<void> {
    return browser.get('/map?target=Arion+vulgaris&invasive=true&color=a900aa');
  }

  isZoomedIn(): wdpromise.Promise<boolean> {
    return this.closeTile.isPresent();
  }
}
