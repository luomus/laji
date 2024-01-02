import { Locator, Page } from '@playwright/test';

export class SubmissionsPage {
  private $datatable = (this.$container ? this.$container : this.page).locator('laji-own-datatable');

  constructor(
    private page: Page,
    private $container?: Locator
  ) {}

  navigateTo() {
    return this.page.goto('/vihko/ownSubmissions');
  }

  datatable = {
    $container: this.$datatable,
    $rows: this.$datatable.locator('datatable-row-wrapper'),
    waitUntilLoaded: () => this.$datatable.locator('.spinner').waitFor({state: 'hidden'}),
    getRow: (idx: number) => {
      const $container = this.$datatable.locator('datatable-row-wrapper').nth(idx);
      return {
        $container,
        $buttons: $container.locator('.btn'),
        $viewButton: $container.locator('.view-button'),
        $editButton: $container.locator('.edit-button'),
        $templateButton: $container.locator('.template-button'),
        $downloadButton: $container.locator('.download-button'),
        $deleteButton: $container.locator('.delete-button'),
      }
    },
    $deleteModalContainer: this.page.locator('.datatable-delete-modal'),
    getDeleteModal: () => ({
      $container: this.datatable.$deleteModalContainer,
      $confirm: this.datatable.$deleteModalContainer.locator('.btn-danger')
    })
  }
}
