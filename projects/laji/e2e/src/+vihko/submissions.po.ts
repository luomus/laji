import { browser, $ } from 'protractor';

export class SubmissionsPage {
  async navigateTo() {
    return browser.get('/vihko/ownSubmissions') as Promise<void>;
  }

  private $datatable = $('laji-own-datatable');
  datatable = {
    $container: this.$datatable,
    $$rows: this.$datatable.$$('datatable-row-wrapper'),
    getRow: (idx: number) => {
      const $container = this.$datatable.$$('datatable-row-wrapper').get(idx);
      return {
        $container,
        $$buttons: $container.$$('.btn'),
        $viewButton: $container.$('.view-button'),
        $editButton: $container.$('.edit-button'),
        $templateButton: $container.$('.template-button'),
        $downloadButton: $container.$('.download-button'),
        $deleteButton: $container.$('.delete-button'),
      }
    }
  }
}
