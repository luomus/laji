import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { InvasiveSpeciesPlaceFormPage } from './invasive-species-place-form.po';
import { browser } from 'protractor';

const FORM_WITH_INCLUDE_UNITS = 'MHL.33';
const FORM_WITH_NAMED_PLACES = 'MHL.33';
const FORM_WITH_INCLUDE_UNITS_NP = 'MNP.37866';

const projectFormPage = new ProjectFormPage();
const userPage = new UserPage();
const invasiveSpeciesFormPage = new InvasiveSpeciesPlaceFormPage();

describe('Project form when logged in', () => {
  beforeAll(async (done) => {
    await projectFormPage.navigateTo(FORM_WITH_NAMED_PLACES);
    await userPage.login();
    done();
  });
  describe('named places', () => {
    it('view can be navigated to and is displayed', async (done) => {
      await projectFormPage.$formLink.click();
      expect(await projectFormPage.namedPlacesView.$container.isDisplayed()).toBe(true);
      done();
    });

    describe('list', () => {
      it('is displayed', async (done) => {
        expect(await projectFormPage.namedPlacesView.$list.isDisplayed()).toBe(true);
        done();
      });

      it('has places', async (done) => {
        expect(await projectFormPage.namedPlacesView.$$listItems.count()).not.toBe(0);
        done();
      });

      it('item click activates place', async (done) => {
        await projectFormPage.namedPlacesView.$$listItems.first().click();
        expect(await projectFormPage.namedPlacesView.$viewer.isDisplayed()).toBe(true);
        expect(await projectFormPage.namedPlacesView.$listActiveItem.isDisplayed()).toBe(true);
        done();
      });
    });

     let urlBeforeUse;

     it('use button displays document form', async (done) => {
       urlBeforeUse = await browser.getCurrentUrl();
       await projectFormPage.namedPlacesView.$useButton.click();
       expect(await projectFormPage.documentFormView.$form.isDisplayed()).toBe(true);
       done();
     });

     it('canceling document save redirects goes back to prev page', async (done) => {
       await projectFormPage.documentFormView.$cancel.click();
       expect(await browser.getCurrentUrl()).toEqual(urlBeforeUse);
       done();
     });

     it('if modal is shown it can be closed', async(done) => {
       const isModal = await projectFormPage.namedPlacesView.$modal.isPresent()
         && await projectFormPage.namedPlacesView.$modal.isDisplayed();
       if (isModal) {
         await projectFormPage.namedPlacesView.$modalCloseButton.click();
       }
       expect(await projectFormPage.namedPlacesView.$modal.isPresent()).toBe(false);
       done();
     });

    it('add button directs to add page', async(done) => {
      await browser.sleep(10000);
      await projectFormPage.namedPlacesView.$addButton.click();
      done();
    });

    it('can be added', async(done) => {
      const random = '' + Math.random();
      await invasiveSpeciesFormPage.fillIn(random);
      await projectFormPage.documentFormView.save();
      const name = await projectFormPage.namedPlacesView.getNameInViewer();
      expect(name).toBe(random);
      done();
    });

    it('can be deleted', async (done) => {
      const count = await projectFormPage.namedPlacesView.$$listItems.count();
      await projectFormPage.namedPlacesView.delete();
      expect(await projectFormPage.namedPlacesView.$viewer.isPresent()).toBe(false);
      expect(await projectFormPage.namedPlacesView.$$listItems.count()).toBe(count - 1);
      done();
    });
  });

  it('named place with includeUnits option has unit', async (done) => {
    await projectFormPage.navigateTo(FORM_WITH_INCLUDE_UNITS, `/form/places/${FORM_WITH_INCLUDE_UNITS_NP}`);
    const $taxon = await projectFormPage.documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxonID');
    expect((await $taxon.$('input').getAttribute('value')).length).toBeGreaterThan(0, 'didn\'t have taxon');
    done();
  });

  it('canceling document save redirects to about named place view no history', async (done) => {
    await projectFormPage.documentFormView.$cancel.click();
    expect(await projectFormPage.namedPlacesView.$container.isDisplayed()).toBe(true);
    done();
  });
});
