import { Page } from '@playwright/test';

export class ToastPO {
  private $$closeBtns = this.page.locator('.toast-close-button');

  constructor(private page: Page) { }

  async closeAll() {
    for (const el of await this.$$closeBtns.elementHandles()) {
      try {
        await el.click();
      } catch (e) {}
    }
  }
}
