import { Page } from '@playwright/test';

export class ConfirmPO {
  public $message = this.page.locator('.laji-dialog-message');
  public $confirm = this.page.locator('.laji-dialog-confirm');
  public $cancel = this.page.locator('.laji-dialog-cancel');

  constructor(
    private page: Page
  ) {}
}
