import { Page } from '@playwright/test';
import { getAddressWithLang } from '../shared/utils';
import { NavPage } from '../shared/nav.po';

export class VihkoHomePage {
  public $content = this.page.locator('.haseka-home');
  public $latestSpinner = this.page.locator('#haseka-latest .spinner');
  public latestSaved = latestDocumentsView(this.page, '.vihko-latest-saved');
  public latestUnsaved = latestDocumentsView(this.page, '.vihko-latest-unsaved', true);

  private navPage = new NavPage(this.page);

  constructor(
    private page: Page
  ) {}

  navigateTo(lang?: 'fi' | 'en' | 'sv') {
    return this.page.goto(getAddressWithLang('/vihko/home', lang));
  }

  async clickFormById(id: string) {
    const lang = await this.navPage.getLang();
    return this.page.locator(`[href="${getAddressWithLang(`/project/${id}`, lang)}"`).click();
  }
}

const latestDocumentsView = (page: Page, selector: string, orderReverse = false) => {
  const $container = page.locator(selector);
  const $shortDocs = $container.locator('laji-short-document');
  const getShortDoc = (idx: number) => {
    return {
      getEditLink: () => $shortDocs.nth(idx).locator('a').getAttribute('href')
    };
  };
  return {
    $container,
    $shortDocs,
    getShortDoc,
    getLatestShortDoc: async () => getShortDoc(orderReverse ? 0 : await $shortDocs.count() - 1)
  };
};
