import { test, expect } from '@playwright/test';
import { TaxonPage } from './taxon.po';
import { ERROR_DIALOG_SELECTOR } from '../../+error/error.po';

test.describe('Taxon page', () => {

  test.afterEach(async ({page}) => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test.describe('great tit in finnish', () => {

    let taxonPage: TaxonPage;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/taxon/MX.34567');
      taxonPage = new TaxonPage(page);
    });

    test.describe('header', () => {
      test('should show vernacular name', async () => {
        await expect((taxonPage.header.$vernacularName)).toContainText('Talitiainen');
      });

      test('should show scientific name', async () => {
        await expect((taxonPage.header.$scientificName)).toContainText('Parus major');
      });

      test('should show colloquial name', async () => {
        await expect((taxonPage.header.$colloquialVernacularName)).toContainText('talitintti');
      });
    });

    test.describe('tree', () => {
      test.beforeAll(async () => {
        await taxonPage.tree.openBtn$.click();
      });

      test('opens when clicked', async () => {
        await expect(taxonPage.tree.$content).toBeVisible();
      });

      test('displays vernacular name', async () => {
        await expect((taxonPage.getTaxonName(taxonPage.tree.$content.locator('a').nth(1)).$vernacularName)).toContainText('Aitotumaiset');
      });

      test('displays scientific name', async () => {
        await expect((taxonPage.getTaxonName(taxonPage.tree.$content.locator('a').nth(1)).$scientificName)).toContainText('Eucarya');
      });
    });

    test.describe('breadcrumbs', () => {
      test('displays vernacular name', async () => {
        await expect((taxonPage.getTaxonName(taxonPage.breadcrumbs$.locator('a').nth(5)).$vernacularName)).toContainText('Talitiaiset');
      });

      test('displays scientific name', async () => {
        await expect((taxonPage.getTaxonName(taxonPage.breadcrumbs$.locator('a').nth(1)).$scientificName)).toContainText('Chordata');
      });
    });
  });

  test.describe('great tit in english', () => {

    let taxonPage: TaxonPage;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/en/taxon/MX.34567');
      taxonPage = new TaxonPage(page);
    });

    test.describe('header', () => {

      test('should show vernacular name', async () => {
        await expect((taxonPage.header.$vernacularName)).toContainText('Great Tit');
      });

      test('should show scientific name', async () => {
        await expect((taxonPage.header.$scientificName)).toContainText('Parus major');
      });

      test('should not show colloquial name', async () => {
        await expect(taxonPage.header.$colloquialVernacularName).not.toBeVisible();
      });
    });

    test.describe('tree', () => {
      test.beforeAll(async () => {
        await taxonPage.tree.openBtn$.click();
      });

      test('opens when clicked', async () => {
        await expect(taxonPage.tree.$content).toBeVisible();
      });

      test('should not show vernacular name because no english translation', async () => {
        await expect(taxonPage.getTaxonName(taxonPage.tree.$content.locator('a').nth(1)).$vernacularName).not.toBeVisible();
      });

      test('displays scientific name', async () => {
        await expect(taxonPage.getTaxonName(taxonPage.tree.$content.locator('a').nth(0)).$scientificName).toContainText('Biota');
      });
    });

    test.describe('breadcrumbs', () => {
      test('should not show vernacular name when no english translation', async () => {
        await expect(taxonPage.getTaxonName(taxonPage.breadcrumbs$.locator('a').nth(5)).$vernacularName).not.toBeVisible();
      });

      test('displays scientific name', async () => {
        await expect((taxonPage.getTaxonName(taxonPage.breadcrumbs$.locator('a').nth(0)).$scientificName)).toContainText('Animalia');
      });
    });
  });


  test.describe('smooth newt synonyms', () => {
    let taxonPage: TaxonPage;
    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('/taxon/MX.200936');
      taxonPage = new TaxonPage(page);
      const $taxonomyTab = taxonPage.$container.locator('lu-tabs').getByText('Taksonomia');
      await $taxonomyTab.click();
    });

    test('taxonomy tab is visible', async () => {
      const $taxonomyTab = taxonPage.$container.locator('lu-tabs').getByText('Taksonomia');
      await expect($taxonomyTab).toBeVisible();
    });

    test('taxonomy tab can be opened', async () => {
      const $taxonomyTab = taxonPage.$container.locator('lu-tabs').getByText('Taksonomia');
      await $taxonomyTab.click();
      await expect(taxonPage.$taxonomy).toBeVisible();
    });


    test('displays synonym vernacular name', async () => {
      const taxonName = taxonPage.getTaxonName(taxonPage.$taxonomy);
      await expect((taxonName.$vernacularName)).toContainText('Vesilisko');
      await expect((taxonName.$scientificName)).toContainText('Lissotriton vulgaris');
    });
  });
});
