import { browser, by, element } from 'protractor';
import { SubmissionsPage } from './submissions.po';

export class ToolsPage {

  public readonly $importLink = element(by.css('a[href$="/import"]'));
  public readonly $toolsLink = element(by.css('a[href$="/tools"]'));
  public readonly $templateLink = element(by.css('a[href$="/vihko/templates"]'));

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
    return browser.get('/vihko/tools') as Promise<void>;
  }

  templatesDatatable = new SubmissionsPage().datatable;
}
