import { by, element } from 'protractor';

export class NavPage {

  private vihkoLink = element(by.css('a[href="/vihko"]'));
  private saveObservationLink = element(by.css('a[href="/save-observations"]'));

  moveToSaveObservation(): void {
    this.saveObservationLink.click();
  }

  moveToVihko(): void {
    this.vihkoLink.click();
  }
}
