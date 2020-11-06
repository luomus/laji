import { browser, by, element } from 'protractor';

export class HomePage {

  private pageTitleElem = element(by.css('.home-main > h1'));

  navigateTo(lang = 'fi') {
    return browser.get('/' + (lang !== 'fi' ? lang : '')) as Promise<void>;
  }

  getPageTitle() {
    return this.pageTitleElem.getText() as Promise<string>;
  }
}
