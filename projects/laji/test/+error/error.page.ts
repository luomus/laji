import {Locator, Page} from '@playwright/test';

export class ErrorPage {

  errorDialog: Locator;

  constructor(page: Page) {
    this.errorDialog = page.locator('.toast-error');
  }

  isPresentErrorDialog() {
    return this.errorDialog.isVisible() as Promise<boolean>;
  }
}
