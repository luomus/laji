import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo(lang = 'fi') {
    return browser.get('/' + (lang !== 'fi' ? lang : '')) as Promise<void>;
  }

  getPageTitle() {
    return element(by.id('main-title')).getText() as Promise<string>;
  }
}
