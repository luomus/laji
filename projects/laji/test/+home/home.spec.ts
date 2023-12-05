import { test, expect } from '@playwright/test';
import { HomePage } from './home.po';
import { ErrorPage } from '../+error/error.page';

test.describe('Home page', () => {

  test.afterEach(async ({page}) => {
    const error = new ErrorPage(page);
    await expect(error.errorDialog).not.toBeVisible();
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
