import { Page } from '@playwright/test';
import { NavPage } from '../shared/nav.po';

export class SaveObservationsPage {

  /** Forms that don't have namedPlaced feature on them */
  private simpleForms = this.page.locator('.survey-box');

  constructor(private page: Page) { }

  async navigateTo() {
    return this.page.goto('/save-observations');
  }

  async moveTo(): Promise<void> {
    await new NavPage(this.page).moveToSaveObservation();
  }

  clickFormById(id: string) {
    return this.page.locator(`[href="/project/${id}"`).click() as Promise<void>;
  }

  countSimpleForms() {
    return this.simpleForms.count() as Promise<number>;
  }

  async pageIsDisplayed() {
    return !!(await this.countSimpleForms());
  }
}
