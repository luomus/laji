import { by, element } from 'protractor';

export class ErrorPage {

  private errorDialog = element.all(by.css('.toast-error'));

  async isPresentErrorDialog(): Promise<boolean> {
    return await this.errorDialog.isPresent();
  }
}
