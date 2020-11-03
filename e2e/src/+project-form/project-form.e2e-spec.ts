import { DocumentFormView, NamedPlacesView, ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';

const FORM_WITH_INCLUDE_UNITS = 'MHL.33';
const FORM_WITH_NAMED_PLACES = 'MHL.33';
const FORM_WITH_INCLUDE_UNITS_NP = 'MNP.37866';

const projectFormPage = new ProjectFormPage();
const namedPlacesView = new NamedPlacesView();
const documentFormView = new DocumentFormView();
const userPage = new UserPage();

describe('Project form', () => {

  describe('when logged in', () => {

    beforeAll(async (done) => {
      await userPage.navigateTo();
      await userPage.login();
      done();
    });

    afterAll(async (done) => {
      await userPage.logout();
      done();
    });

    describe('named places', () => {

      beforeAll(async (done) => {
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

    it('Named place with includeUnits option has unit', async (done) => {
      const np = FORM_WITH_INCLUDE_UNITS_NP;
      await projectFormPage.navigateTo(FORM_WITH_INCLUDE_UNITS, `/form/places/${np}`);
      const $taxon = documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxonID');
      expect((await $taxon.$('input').getAttribute('value')).length).toBeGreaterThan(0, 'didn\'t have taxon');
      done();
    });
  });
});
