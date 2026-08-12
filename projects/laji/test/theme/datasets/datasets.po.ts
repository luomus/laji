import { Page } from '@playwright/test';

export class DatasetsPage {
  public $cmsContent = this.page.locator('.laji-page');
  public $datasetsContainer = this.page.locator('.dataset-items');
  public $datasetLinks = this.$datasetsContainer.locator('a');

  constructor(
    private page: Page
  ) {}

  navigateTo() {
    return this.page.goto('/theme/datasets');
  }
}
