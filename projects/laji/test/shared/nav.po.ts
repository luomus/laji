import { Page } from '@playwright/test';

export class NavPage {
  public $vihkoLink = this.page.locator('a[href$="/vihko"]');
  public $lang = this.page.locator('.language-toggle span');

  constructor(
    private page: Page
  ) {}

  moveToVihko() {
    return this.$vihkoLink.click();
  }

  async getLang(): Promise<('fi' | 'sv' | 'en')> {
    const text = (await this.$lang.innerText()).trim().toLowerCase();
    if (!['fi', 'sv', 'en'].includes(text)) {
      throw new Error('Couldn\'t get lang');
    }
    return text as ('fi' | 'sv' | 'en');
  }
}
