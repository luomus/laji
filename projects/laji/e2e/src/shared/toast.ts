import { $$ } from 'protractor';

export class ToastPO {
  private $$closeBtns = $$('.toast-close-button');

  async closeAll() {
    this.$$closeBtns.each(($btn) => {
      $btn.click();
    });
  }
}
