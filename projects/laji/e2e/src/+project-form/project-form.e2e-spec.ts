import { DocumentFormView, NamedPlacesView, ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { VihkoHomePage } from '../+vihko/home.po';
import { MobileFormPage } from '../+vihko/mobile-form.po';

const FORM_WITH_INCLUDE_UNITS = 'MHL.33';
const FORM_WITH_NAMED_PLACES = 'MHL.33';
const FORM_WITH_INCLUDE_UNITS_NP = 'MNP.37866';
const FORM_WITH_SIMPLE = 'JX.519';
const FORM_WITH_MOBILE = 'MHL.51';
const FORM_NO_SIMPLE_NO_NAMED_PLACES = 'MHL.6';

const projectFormPage = new ProjectFormPage();
const namedPlacesView = new NamedPlacesView();
const documentFormView = new DocumentFormView();
const userPage = new UserPage();
const vihkoHomePage = new VihkoHomePage();
const mobileFormPage = new MobileFormPage();

describe('Project form', () => {

  describe('when logged in', () => {

    beforeAll(async (done) => {
      await projectFormPage.navigateTo(FORM_WITH_SIMPLE);
      await userPage.login();
      done();
    });

    describe('and has simple option,', () => {

     it('displays form', async (done) => {
       expect(await documentFormView.$form.isDisplayed()).toBe(true);
       done();
     });

     it('doesn\'t display sidebar', async (done) => {
       expect (await projectFormPage.$sidebar.isPresent()).toBe(false);
       done();
     });

      it('and has no category, canceling document save redirects to Vihko home page if no history', async (done) => {
        await documentFormView.$cancel.click();
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

      it('canceling document save redirects to about page if no history', async (done) => {
        await projectFormPage.navigateTo(`${FORM_WITH_MOBILE}/form`);
        await mobileFormPage.fillAsEmpty();
        await documentFormView.$cancel.click();
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
        await documentFormView.$cancel.click();
        expect(await projectFormPage.hasAboutText()).toBe(true);
        done();
      });
    });

    describe('named places', () => {


      describe('', () => {
        beforeAll(async(done) => {
          await projectFormPage.navigateTo(FORM_WITH_NAMED_PLACES);
          done();
        });

        it('view can be navigated to and is displayed', async (done) => {
          await projectFormPage.$formLink.click();
          expect(await namedPlacesView.$container.isDisplayed()).toBe(true);
          done();
        });

        describe('list', () => {
          it('is displayed', async (done) => {
            expect(await namedPlacesView.$list.isDisplayed()).toBe(true);
            done();
          });

          it('has places', async (done) => {
            expect(await namedPlacesView.$$listItems.count()).not.toBe(0);
            done();
          });

          it('item click activates place', async (done) => {
            await namedPlacesView.$$listItems.first().click();
            expect(await namedPlacesView.$viewer.isDisplayed()).toBe(true);
            done();
          });
        });

        it('use button displays document form', async (done) => {
          await namedPlacesView.$useButton.click();
          expect(await documentFormView.$form.isDisplayed()).toBe(true);
          done();
        });
      });

      it('named place with includeUnits option has unit', async (done) => {
        const np = FORM_WITH_INCLUDE_UNITS_NP;
        await projectFormPage.navigateTo(FORM_WITH_INCLUDE_UNITS, `/form/places/${np}`);
        const $taxon = documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxonID');
        expect((await $taxon.$('input').getAttribute('value')).length).toBeGreaterThan(0, 'didn\'t have taxon');
        done();
      });

      it('canceling document save redirects to about named place view no history', async (done) => {
        await documentFormView.$cancel.click();
        expect(await namedPlacesView.$container.isDisplayed()).toBe(true);
        done();
      });
    });
  });
});
