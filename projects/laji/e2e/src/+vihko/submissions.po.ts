import { browser, $, ElementFinder } from 'protractor';
import {EC} from '../../helper';

export class SubmissionsPage {
  private $container: ElementFinder;
  private $datatable = $('laji-own-datatable');

  constructor($container?: ElementFinder) {
    this.$container = $container;
    const datatableSelector = 'laji-own-datatable';
    this.$datatable = this.$container ? this.$container.$(datatableSelector) : $(datatableSelector);
  }

  async navigateTo() {
    return browser.get('/vihko/ownSubmissions') as Promise<void>;
  }

  datatable = {
    $container: this.$datatable,
    $$rows: this.$datatable.$$('datatable-row-wrapper'),
    waitUntilLoaded: () => browser.wait(EC.invisibilityOf(this.$datatable.$('.spinner'))),
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
    },
    $deleteModalContainer: $('.datatable-delete-modal'),
    getDeleteModal: () => ({
      $container: this.datatable.$deleteModalContainer,
      $confirm: this.datatable.$deleteModalContainer.$('.btn-danger')
    })
  }
}
