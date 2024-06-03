import { Page } from '@playwright/test';

export class SpreadsheetPage {
  public $fileInput = this.page.locator('input[type="file"]:not(#user-mapping)');
  public $error = this.page.locator('.datatable-body .label.label-danger');
  public $warning = this.page.locator('.datatable-body .label.label-warning');
  public $countFilterSelect = this.page.locator('select[name="count-handling"]');
  public $nextValue = this.page.locator(':not([disabled]).next-value-map');
  public $completed = this.page.locator('.completed.link');
  private $docCounts = this.page.locator('.doc-count');
  private $dataTableCells = this.page.locator('.datatable-body-cell-label');
  public $saveWithoutPublishing = this.page.locator('.no-public');

  constructor(
    private page: Page
  ) {}

  async uploadFile(file: string) {
    return this.$fileInput.setInputFiles(file);
  }

  async waitForDataTableData() {
    await this.$dataTableCells.first().waitFor({state: 'visible'});
  }

  async getDocumentCountText() {
    const countText = await this.$docCounts.innerText();
    return countText.replace(/[^0-9]+/, '');
  }

  async countCellWithValue(value: string) {
    const values = await this.$dataTableCells.allInnerTexts();
    return values.filter(v => v === value).length;
  }
}
