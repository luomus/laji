import { Page } from '@playwright/test';

export class NavPage {

  private vihkoLink = this.page.locator('a[href$="/vihko"]');
  private saveObservationLink = this.page.locator('a[href$="/save-observations"]');
  private $lang = this.page.locator('.language-toggle span');

  constructor(private page: Page) { }

  moveToSaveObservation() {
    return this.saveObservationLink.click();
  }

  moveToVihko() {
    return this.vihkoLink.click();
  }

  async getLang(): Promise<('fi' | 'sv' | 'en')> {
    const text = (await this.$lang.textContent()).trim().toLowerCase();
    if (!['fi', 'sv', 'en'].includes(text)) {
      throw new Error('Couldn\'t get lang');
    }
    return text as ('fi' | 'sv' | 'en');
  }
}
