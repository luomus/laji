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

    beforeAll(async () => {
      await userPage.navigateTo();
      await userPage.login();
    });

    afterAll(async () => {
      await userPage.logout();
    });

    describe('named places', () => {

      beforeAll(async () => {
        await projectFormPage.navigateTo(FORM_WITH_NAMED_PLACES);
      });

      it('view can be navigated to and is displayed', async () => {
        await projectFormPage.$formLink.click();
        expect(await namedPlacesView.$container.isDisplayed()).toBe(true);
      });

      describe('list', () => {
        it('is displayed', async () => {
          expect(await namedPlacesView.$list.isDisplayed()).toBe(true);
        });

        it('has places', async () => {
          expect(await namedPlacesView.$$listItems.count()).not.toBe(0);
        });

        it('item click activates place', async () => {
          await namedPlacesView.$$listItems.first().click();
          expect(await namedPlacesView.$viewer.isDisplayed()).toBe(true);
        });
      });

      it('use button displays document form', async () => {
        await namedPlacesView.$useButton.click();
        expect(await documentFormView.$form.isDisplayed()).toBe(true);
      });
    });

    it('Named place with includeUnits option has unit', async () => {
      const np = FORM_WITH_INCLUDE_UNITS_NP;
      await projectFormPage.navigateTo(FORM_WITH_INCLUDE_UNITS, `/form/places/${np}`);
      const $taxon = documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxonID');
      expect((await $taxon.$('input').getAttribute('value')).length).toBeGreaterThan(0, 'didn\'t have taxon');
    });
  });
});
