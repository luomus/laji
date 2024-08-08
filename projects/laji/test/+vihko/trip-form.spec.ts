import { expect, Page, test } from '@playwright/test';
import { loginWithPermanentToken } from '../+user/user.po';
import { VihkoHomePage } from './home.po';
import { TripFormPage } from './trip-form.po';
import { NavPage } from '../shared/nav.po';
import { ConfirmPO } from '../shared/dialogs.po';
import { ERROR_DIALOG_SELECTOR } from '../+error/error.po';

test.describe('Trip form page', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let tripFormPage: TripFormPage;
  let vihkoHome: VihkoHomePage;
  let confirm: ConfirmPO;
  let nav: NavPage;
  let latestSavedDocEditLink: string;
  let latestUnsavedDocEditLink: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginWithPermanentToken(page);

    tripFormPage = new TripFormPage(page);
    vihkoHome = new VihkoHomePage(page);
    confirm = new ConfirmPO(page);
    nav = new NavPage(page);

    await vihkoHome.navigateTo();
    await vihkoHome.$content.waitFor();

    await vihkoHome.$latestSpinner.waitFor({state: 'hidden'});

    if (await vihkoHome.latestSaved.$container.isVisible()) {
      latestSavedDocEditLink = await (await vihkoHome.latestSaved.getLatestShortDoc()).getEditLink();
    }
    if (await vihkoHome.latestUnsaved.$container.isVisible()) {
      latestUnsavedDocEditLink = await (await vihkoHome.latestUnsaved.getLatestShortDoc()).getEditLink();
    }

    await tripFormPage.navigateTo();
  });

  test.afterEach(async () => {
    await expect(page.locator(ERROR_DIALOG_SELECTOR)).not.toBeVisible();
  });

  test('should be able to fill in form with simple data', async () => {
    await tripFormPage.fillInSimpleForm();
    await expect(tripFormPage.$countryElem).toHaveValue('Suomi');
  });

  test('should be able to save form with simple data', async () => {
    await tripFormPage.clickSavePrivate();
    await expect(tripFormPage.$toastElement).toContainText('Havainnot tallennettu!');
    await expect(tripFormPage.$overlayElem).toBeHidden();
  });

  test('vihko home page should show saved document', async () => {
    const editLink = await (await vihkoHome.latestSaved.getLatestShortDoc()).getEditLink();
    expect(editLink).not.toBe(undefined);
    expect(editLink).not.toBe(latestSavedDocEditLink);
    let unsavedEditLink: string;
    if (await vihkoHome.latestUnsaved.$container.isVisible()) {
      unsavedEditLink = await (await vihkoHome.latestUnsaved.getLatestShortDoc()).getEditLink()
    }
    expect(unsavedEditLink).toBe(latestUnsavedDocEditLink);
    latestSavedDocEditLink = editLink;
  });

  test('should allow clicking trip form after successful save', async () => {
    await tripFormPage.clickTripFormLink();
    await expect(tripFormPage.$pageTitleElem).toContainText('Retkilomake');
  });

  test.describe('when no local data', () => {
    test('doesn\'t confirm leave', async () => {
      await nav.moveToVihko();
      await expect(confirm.$message).not.toBeVisible();
    });
  });

  test.describe('when has local data', () => {
    test.describe('in app navigation custom dialog', () => {
      test.beforeAll(async () => {
        await tripFormPage.navigateTo();
        await tripFormPage.fillInSimpleForm();
        await expect(tripFormPage.$countryElem).toHaveValue('Suomi');
      });

      test.describe('confirm', () => {
        test.beforeEach(async () => {
          await nav.moveToVihko();
        });

        test('confirm is shown and dismiss stays on page', async () => {
          await expect(confirm.$message).toBeVisible();
          await confirm.$cancel.click();
          await expect(tripFormPage.$pageTitleElem).toContainText('Retkilomake');
        });

        test('confirm leaves page', async () => {
          await confirm.$confirm.click();
          await expect(vihkoHome.$content).toBeVisible();
        });
      });

      test('after leaving unsaved doc, vihko home page unsaved docs list displays new unsaved doc', async () => {
        const tmpEditLink = await (await vihkoHome.latestUnsaved.getLatestShortDoc()).getEditLink();
        expect(tmpEditLink).not.toBe(undefined);
        expect(tmpEditLink).not.toBe(latestUnsavedDocEditLink);
        expect(latestSavedDocEditLink).toBe(
          await (await vihkoHome.latestSaved.getLatestShortDoc()).getEditLink()
        );
      });
    });
  });
});
