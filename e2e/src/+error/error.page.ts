import { by, element } from 'protractor';

export class ErrorPage {

  private errorDialog = element(by.css('.toast-error'));

  isPresentErrorDialog() {
    return this.errorDialog.isPresent() as Promise<boolean>;
  }
}
