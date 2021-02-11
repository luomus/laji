import { ErrorPage } from '../+error/error.page';
import { UserPage } from '../+user/user.po';
import { TripFormPage } from './trip-form.po';
import { ConfirmPO } from '../shared/dialogs.po';
import { VihkoHomePage } from './home.po';
import { isDisplayed, waitForVisibility, waitForInvisibility } from '../../helper';
import { browser } from 'protractor';
import { NavPage } from '../shared/nav.po';

describe('Trip form page', () => {
  const page = new TripFormPage();
  const user = new UserPage();
  const error = new ErrorPage();
  const confirm = new ConfirmPO();
  const vihkoHome = new VihkoHomePage();
  const nav = new NavPage();

  beforeAll(async (done) => {
    await user.handleNavigationWithExternalLogin(() => page.navigateTo());
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

  it('should allow clicking trip form after successful save', async (done) => {
    await page.clickTripFormLink();
    expect(await page.getPageTitle()).toContain('Retkilomake', 'Form title should be visible after clicking the form link');
    done();
  });

  describe('when no local data', () => {
    it('discard isn\'t shown', async (done) => {
      expect(await page.hasDiscardLocalData()).toBe(false, 'discard local data was visible');
      done();
    });

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

    describe('discard', () => {
      it('is shown', async (done) => {
        await page.navigateTo();
        expect(await page.hasDiscardLocalData()).toBe(true, 'didn\'t display discard local data button');
        done();
      });

      it('click removes local data', async (done) => {
        await page.discardLocalData();
        await waitForInvisibility(page.countryElem);
        expect(await isDisplayed(page.countryElem)).toBe(false, 'Country was shown');
        done();
      });

      it('doesn\'t confirm leave after discard', async (done) => {
        await nav.moveToVihko();
        expect(await isDisplayed(confirm.$message)).toBe(false, 'confirm dialog was shown');
        done();
      });
    });
  });
});
