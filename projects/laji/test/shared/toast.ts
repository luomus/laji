import { Page } from '@playwright/test';

export class ToastPO {
  private $$closeBtns = this.page.locator('.toast-close-button');

  constructor(private page: Page) { }

  async closeAll() {
    (await this.$$closeBtns.all()).forEach(async ($btn) => {
      await $btn.click();
    });
  }
}
