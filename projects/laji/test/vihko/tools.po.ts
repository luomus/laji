import { Page } from '@playwright/test';
import { SubmissionsPage } from './submissions.po';

export class ToolsPage {
  public readonly $importLink = this.page.locator('lu-sidebar a[href$="/import"]');
  public readonly $toolsLink = this.page.locator('lu-sidebar a[href$="/tools"]');
  public readonly $templateLink = this.page.locator('lu-sidebar a[href$="/vihko/templates"]');

  constructor(
    private page: Page
  ) {}

  navigateTo() {
    return this.page.goto('/vihko/tools');
  }

  templatesDatatable = new TemplatesView(this.page).datatable;
}

export class TemplatesView {
  public readonly $container = this.page.locator('laji-templates');
  public readonly datatable = new SubmissionsPage(this.page, this.$container).datatable;

  constructor(
    private page: Page
  ) {}
}
