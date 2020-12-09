import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { VihkoHomePage } from '../+vihko/home.po';
import { MobileFormPage } from '../+vihko/mobile-form.po';
import { SaveObservationsPage } from '../+save-observations/save-observations.po';
import { browser } from 'protractor';

const FORM_WITH_SIMPLE_HAS_NO_CATEGORY = 'JX.519';
const FORM_WITH_SIMPLE_HAS_CATEGORY = 'MHL.25';
const FORM_WITH_MOBILE = 'MHL.51';
const FORM_NO_SIMPLE_NO_NAMED_PLACES = 'MHL.6';
const FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION = 'MHL.3';
const FORM_NAMED_PLACES_LOOSE_ACCESS_RESTRICTION = 'MHL.1';
const FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION = 'MHL.45';
const FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION_NO_PERMISSION = 'MHL.45';

const projectFormPage = new ProjectFormPage();
const userPage = new UserPage();
const vihkoHomePage = new VihkoHomePage();
const mobileFormPage = new MobileFormPage();
const saveObservationsPage = new SaveObservationsPage();

async function expectLandsOnExternalLogin(form, subPage?) {
  await browser.waitForAngularEnabled(false);
  await projectFormPage.navigateTo(form, subPage);
  expect(await userPage.isOnExternalLoginPage()).toBe(true, 'Wasn\'t on external login page');
  await browser.waitForAngularEnabled(true);
}

describe('Project form', () =>  {

  describe('when logged out', () => {

    beforeAll(async (done) => {
      // If this is the first test suite that is ran,
      // we need to navigate to some page before logging out is possible.
      try {
        await userPage.logout();
      } catch (e) {
        await projectFormPage.navigateTo(FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION);
        await userPage.logout();
      }
      done();
    });

    describe('and has named places and no access restriction', () => {
      it('/form page redirects to named places view', async (done) => {
        await projectFormPage.navigateTo(FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION, '/form');
        expect(await projectFormPage.namedPlacesView.$container.isDisplayed()).toBe(true);
        done();
      });
    });

    describe('and has named places and loose access restriction', () => {
      it('/form page redirects to named places view', async (done) => {
        await projectFormPage.navigateTo(FORM_NAMED_PLACES_LOOSE_ACCESS_RESTRICTION, '/form');
        expect(await projectFormPage.namedPlacesView.$container.isDisplayed()).toBe(true);
        done();
      });
    });

    describe('and has named places and strict access restriction', () => {
      it('/form page redirects to login', async (done) => {
        await expectLandsOnExternalLogin(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION, '/form');
        done();
      });
    });

    describe('and has simple option,', () => {
      it('form page redirects to login', async (done) => {
        await expectLandsOnExternalLogin(FORM_WITH_SIMPLE_HAS_NO_CATEGORY);
        done();
      });
    });

    describe('and has mobile option,', () => {

      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_MOBILE);
        done();
      });

      it('doesn\'t display terms', async (done) => {
        expect(await projectFormPage.mobileAboutPage.$terms.isDisplayed()).toBe(false);
        done();
      });

      it('shows login button', async (done) => {
        expect(await projectFormPage.mobileAboutPage.$loginButton.isDisplayed()).toBe(true);
        done();
      });

      it('navigating to /form redirects to login', async (done) => {
        await expectLandsOnExternalLogin(FORM_WITH_SIMPLE_HAS_NO_CATEGORY, '/form');
        done();
      });
    });

    describe('not simple not mobile no places no multiform', () => {
      it('/form page redirects to login', async (done) => {
        await expectLandsOnExternalLogin(FORM_NO_SIMPLE_NO_NAMED_PLACES, '/form');
        done();
      });

      it('after login is on form page', async (done) => {
        await userPage.doExternalLogin();
        expect(await projectFormPage.documentFormView.$container.isDisplayed()).toBe(true);
        done();
      });
    });
  });

  describe('when logged in', () => {

    describe('and has simple option,', () => {

      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_SIMPLE_HAS_NO_CATEGORY);
        await userPage.login();
        done();
      });

      it('displays form', async (done) => {
        expect(await projectFormPage.documentFormView.$form.isDisplayed()).toBe(true);
        done();
      });

      it('doesn\'t display sidebar', async (done) => {
        expect (await projectFormPage.$sidebar.isPresent()).toBe(false);
        done();
      });

      it('and has no category, canceling document save redirects to Vihko home page if no history', async (done) => {
        await projectFormPage.documentFormView.$cancel.click();
        expect (await vihkoHomePage.$content.isDisplayed()).toBe(true);
        done();
      });

    });

    it('and has simple option and has category, canceling document save redirects to save observations page if no history', async (done) => {
      await projectFormPage.navigateTo(FORM_WITH_SIMPLE_HAS_CATEGORY);
      await projectFormPage.documentFormView.$cancel.click();
      expect (await saveObservationsPage.pageIsDisplayed()).toBe(true);
      done();
    });

    describe('and has mobile option,', () => {

      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_MOBILE);
        done();
      });

      it('shows terms', async (done) => {
        expect(await projectFormPage.mobileAboutPage.$terms.isDisplayed()).toBe(true);
        done();
      });

      it('terms can be accepted', async (done) => {
        await projectFormPage.mobileAboutPage.$termsAcceptButton.click();
        expect(await projectFormPage.mobileAboutPage.$terms.isDisplayed()).toBe(false);
        done();
      });

      it('displays about page', async (done) => {
        expect(await projectFormPage.hasAboutText()).toBe(true);
        done();
      });

      it('doesn\'t display sidebar', async (done) => {
        expect (await projectFormPage.$sidebar.isPresent()).toBe(false);
        done();
      });

      it('use button goes to document form page', async (done) => {
        await projectFormPage.mobileAboutPage.$useButton.click();
        expect (await projectFormPage.documentFormView.$container.isDisplayed()).toBe(true);
        done();
      });

      it('canceling document save redirects to about page if no history', async (done) => {
        await mobileFormPage.fillAsEmpty();
        await mobileFormPage.documentFormView.$cancel.click();
        expect(await projectFormPage.hasAboutText()).toBe(true);
        done();
      });
    });

    describe('and doesn\'t have simple option,', () => {

      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_NO_SIMPLE_NO_NAMED_PLACES);
        done();
      });

      it('displays about page', async (done) => {
        expect(await projectFormPage.hasAboutText()).toBe(true);
        done();
      });

      it('displays sidebar', async (done) => {
        expect (await projectFormPage.$sidebar.isDisplayed()).toBe(true);
        done();
      });

      it('canceling document save redirects to about page if no history', async (done) => {
        await projectFormPage.navigateTo(`${FORM_NO_SIMPLE_NO_NAMED_PLACES}/form`);
        await projectFormPage.documentFormView.$cancel.click();
        expect(await projectFormPage.hasAboutText()).toBe(true);
        done();
      });
    });
  });

  describe('and has named places and strict access restriction and no form permission', () => {
    it('/form page redirects to about', async (done) => {
      await projectFormPage.navigateTo(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION_NO_PERMISSION, '/form');
      expect(await projectFormPage.hasAboutText()).toBe(true);
      done();
    });
  });
});
