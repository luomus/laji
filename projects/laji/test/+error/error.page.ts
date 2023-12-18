// import { by, element } from 'protractor';

import {Locator, Page} from '@playwright/test';

export class ErrorPage {

  errorDialog = this.page.locator('.toast-error');

  constructor(private page: Page) { }

  // private errorDialog = element(by.css('.toast-error'));
  //
  async isPresentErrorDialog() {
    return await this.errorDialog.isVisible();
    // return this.errorDialog.isPresent() as Promise<boolean>;
  }
}
