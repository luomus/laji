// import { by, element } from 'protractor';

import {Locator, Page} from "@playwright/test";

export class ErrorPage {

  errorDialog: Locator;

  constructor(page: Page) {
    this.errorDialog = page.locator('.toast-error');
  }


  // private errorDialog = element(by.css('.toast-error'));
  //
  isPresentErrorDialog() {
    return this.errorDialog.isPresent() as Promise<boolean>;
  }
}
