import { browser, by, element } from 'protractor';

export class ToolsPage {

  public readonly importLink = element(by.css('a[href$="/import"]'));
  public readonly toolsLink = element(by.css('a[href$="/tools"]'));

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
    return browser.get('/vihko/tools') as Promise<void>;
  }

}
