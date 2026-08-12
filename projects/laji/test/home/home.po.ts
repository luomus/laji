import { Locator, Page } from '@playwright/test';

export class HomePage {

  private page: Page;
  public $pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$pageTitle = page.locator('.home-main > h1');
  }

  navigateTo(lang = 'fi') {
    return this.page.goto('/' + (lang !== 'fi' ? lang : ''));
  }

  // getPageTitle() {
  //   return this.$pageTitle.textContent();
  // }
}
