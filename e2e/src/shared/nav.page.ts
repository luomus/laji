import { by, element } from 'protractor';

export class NavPage {

  private vihkoLink = element(by.css('a[href="/vihko"]'));

  moveToVihko(): void {
    this.vihkoLink.click();
  }
}
