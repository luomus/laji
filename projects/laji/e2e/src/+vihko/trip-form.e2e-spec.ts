import { ErrorPage } from '../+error/error.page';
import { UserPage } from '../+user/user.po';
import { TripFormPage } from './trip-form.po';
import { ConfirmPO } from '../shared/dialogs.po';
import { VihkoHomePage } from './home.po';
import { isDisplayed, waitForVisibility } from '../../helper';
import { NavPage } from '../shared/nav.po';

describe('Trip form page', () => {
  const page = new TripFormPage();
  const user = new UserPage();
  const error = new ErrorPage();
  const confirm = new ConfirmPO();
  const vihkoHome = new VihkoHomePage();
  const nav = new NavPage();

  let latestSavedDocEditLink: string;
  let latestUnsavedDocEditLink: string;

  beforeAll(async (done) => {
    await vihkoHome.navigateTo();
    await user.login();
    await vihkoHome.latestSaved.waitUntilLoaded();
    await vihkoHome.latestUnsaved.waitUntilLoaded();
    try {
      latestSavedDocEditLink = await vihkoHome.latestSaved.getShortDoc(await vihkoHome.latestSaved.shortDocs$$.count() - 1).getEditLink();
    } catch (e) {
      // There are no saved docs
    }
    try {
      latestUnsavedDocEditLink = await vihkoHome.latestUnsaved.getShortDoc(0).getEditLink();
    } catch (e) {
      // There are no unsaved docs
    }
    await page.navigateTo();
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should be able to fill in form with simple data', async (done) => {
    await page.fillInSimpleForm();
    expect(await page.getCountryName()).toBe('Suomi', 'Country should be autofilled with Suomi');
    done();
  });

  it('should be able to save form with simple data', async (done) => {
    await page.clickSavePrivate();
    expect(await page.getToasterText()).toContain('Havainnot tallennettu!', 'Success toast should show success message');
    expect(await page.hasOverlayPresent()).toBe(false, 'Overlay was still present after successful save');
    done();
  });

  it('vihko home page should show saved document', async (done) => {
    await vihkoHome.latestSaved.waitUntilLoaded();
    expect(await vihkoHome.latestSaved.getShortDoc(await vihkoHome.latestSaved.shortDocs$$.count() - 1).getEditLink()).not.toBe(latestSavedDocEditLink);
    done();
  });

  it('should allow clicking trip form after successful save', async (done) => {
    await page.clickTripFormLink();
    expect(await page.getPageTitle()).toContain('Retkilomake', 'Form title should be visible after clicking the form link');
    done();
  });

  describe('when no local data', () => {
    it('doesn\'t confirm leave', async (done) => {
      await nav.moveToVihko();
      expect(await isDisplayed(confirm.$message)).toBe(false, 'confirm dialog was displayed');
      done();
    });
  });

  describe('when has local data', () => {
    describe('in app navigation custom dialog', () => {
      beforeAll(async (done) => {
        await page.navigateTo();
        await page.fillInSimpleForm();
        done();
      });

      describe('confirm', () => {
        beforeEach(async (done) => {
          await nav.moveToVihko();
          await waitForVisibility(confirm.$message);
          done();
        });

        it('confirm is shown and dismiss stays on page', async (done) => {
          expect(await isDisplayed(confirm.$message)).toBe(true, 'confirm dialog wasn\'t shown');
          await confirm.$cancel.click();
          expect(await page.getPageTitle()).toContain('Retkilomake', 'didn\'t stay on form page');
          done();
        });

        it('confirm leaves page', async (done) => {
          await confirm.$confirm.click();
          expect(await isDisplayed(vihkoHome.$content)).toBe(true, 'didn\'t land on Vihko home page');
          done();
        });
      });

      it('after leaving unsaved vihko home page unsaved docs displays new unsaved doc', async (done) => {
        await vihkoHome.latestUnsaved.waitUntilLoaded();
        expect(await vihkoHome.latestUnsaved.getShortDoc(0).getEditLink()).not.toBe(latestUnsavedDocEditLink);
        done();
      });
    });
  });
});
