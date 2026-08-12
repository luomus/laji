import { Page } from '@playwright/test';
import { NavPage } from '../shared/nav.po';

export class SaveObservationsPage {

  /** Forms that don't have namedPlaced feature on them */
  simpleForms = this.page.locator('.survey-box');

  constructor(public page: Page) { }

  async navigateTo() {
    await this.page.goto('/save-observations');
  }

  async moveTo(): Promise<void> {
    await new NavPage(this.page).moveToSaveObservation();
  }

  async clickFormById(id: string) {
    await this.page.locator(`[href="/project/${id}"]`).click();
  }
}
