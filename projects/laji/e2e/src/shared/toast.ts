import { $$ } from 'protractor';

export class ToastPO {
  private $$closeBtns = $$('.toast-close-button');

  async closeAll() {
    await this.$$closeBtns.each(async ($btn) => {
      await $btn.click();
    });
  }
}
