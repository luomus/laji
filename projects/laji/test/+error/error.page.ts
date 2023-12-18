import { Page } from '@playwright/test';

export class ErrorPage {
  errorDialog = this.page.locator('.toast-error');

  constructor(private page: Page) { }

  async isPresentErrorDialog() {
    return await this.errorDialog.isVisible();
  }
}
