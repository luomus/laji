import { test, expect } from '@playwright/test';
import { TaxonPage } from './taxon.po';
import { ERROR_DIALOG_SELECTOR } from '../../+error/error.po';

test.describe('Taxon page', () => {

  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test.describe('great tit in finnish', () => {

    let taxonPage: TaxonPage;

    test.beforeEach(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/taxon/MX.34567');
      taxonPage = new TaxonPage(page);
    });

    test.describe('great tit', () => {

      test('should show vernacular name', async () => {
        expect((await taxonPage.header.$vernacularName.textContent())?.trim()).toBe('Talitiainen');
      });

      test('should show scientific name', async () => {
        expect(await taxonPage.header.$scientificName.textContent()).toBe('Parus major');
      });

      test('should show colloquial name', async () => {
        expect(await taxonPage.header.$colloquialVernacularName.textContent()).toBe('talitintti');
      });
    });
  });

  test.describe('great tit in english', () => {

    let taxonPage: TaxonPage;

    test.beforeEach(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/en/taxon/MX.34567');
      taxonPage = new TaxonPage(page);
    });

    test('should show vernacular name', async () => {
      expect((await taxonPage.header.$vernacularName.textContent())?.trim()).toBe('Great Tit');
    });

    test('should show scientific name', async () => {
      expect(await taxonPage.header.$scientificName.textContent()).toBe('Parus major');
    });

    test('should not show colloquial name', async () => {
      await expect(taxonPage.header.$colloquialVernacularName).not.toBeVisible();
    });
  });
});
