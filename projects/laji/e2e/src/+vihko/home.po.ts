import { browser, $ } from 'protractor';

export class VihkoHomePage {

  public readonly $content = $('.haseka-home');

  async navigateTo() {
    return browser.get('/vihko/home') as Promise<void>;
  }

  clickFormById(id: string) {
    return $(`[href="/project/${id}"`).click() as Promise<void>;
  }

}
