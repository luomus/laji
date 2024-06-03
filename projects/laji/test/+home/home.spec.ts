import { test, expect } from '@playwright/test';
import { HomePage } from './home.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Home page', () => {

  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('should display title in finnish', async ({page}) => {
    const homePage = new HomePage(page);
    await homePage.navigateTo();
    expect(await homePage.$pageTitle.textContent()).toBe('Suomen Lajitietokeskus');
  });

  test('should display title in english', async ({page}) => {
    const homePage = new HomePage(page);
    await homePage.navigateTo('en');
    expect(await homePage.$pageTitle.textContent()).toBe('Finnish Biodiversity Information Facility');
  });

  test('should display title in swedish', async ({page}) => {
    const homePage = new HomePage(page);
    await homePage.navigateTo('sv');
    expect(await homePage.$pageTitle.textContent()).toBe('Finlands Artdatacenter');
  });
});
