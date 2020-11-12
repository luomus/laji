import { browser, $ } from 'protractor';

export class VihkoHomePage {

  public readonly $content = $('.haseka-home');

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
    return browser.get('/vihko/home') as Promise<void>;
  }

}
