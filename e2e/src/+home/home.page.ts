import { browser, by, element, promise as wdpromise } from 'protractor';

export class HomePage {
  navigateTo(lang = 'fi'): wdpromise.Promise<void> {
    return browser.get('/' + (lang !== 'fi' ? lang : ''));
  }

  getPageTitle(): wdpromise.Promise<string> {
    return element(by.id('main-title')).getText();
  }
}
