import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { VihkoHomePage } from '../+vihko/home.po';
import { MobileFormPage } from '../+vihko/mobile-form.po';

const FORM_WITH_SIMPLE = 'JX.519';
const FORM_WITH_MOBILE = 'MHL.51';
const FORM_NO_SIMPLE_NO_NAMED_PLACES = 'MHL.6';

const projectFormPage = new ProjectFormPage();
const userPage = new UserPage();
const vihkoHomePage = new VihkoHomePage();
const mobileFormPage = new MobileFormPage();

describe('Project form', () =>  {
  describe('when logged out', () => {
    describe('and has mobile option,', () => {
      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_MOBILE);
        await userPage.logout();
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

      it('shows login button', async (done) => {
        expect(await projectFormPage.mobileAboutPage.$loginButton.isDisplayed()).toBe(true);
        done();
      });
    });
  });

  describe('when logged in', () => {

    beforeAll(async (done) => {
      await projectFormPage.navigateTo(FORM_WITH_SIMPLE);
      await userPage.login();
      done();
    });

    describe('and has simple option,', () => {

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

    describe('and has mobile option,', () => {
      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_MOBILE);
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
});
