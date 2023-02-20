import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { InvasiveSpeciesPlaceFormPage } from './invasive-species-place-form.po';
import { browser } from 'protractor';
import { isDisplayed } from '../../helper';

const FORM_WITH_INCLUDE_UNITS = 'MHL.33';
const FORM_WITH_NAMED_PLACES = 'MHL.33';
const FORM_WITH_MUNICIPALITY_FILTER = 'MHL.33';
const FORM_WITH_BIRD_ASSOCIATION_FILTER = 'MHL.3';
const FORM_WITH_INCLUDE_UNITS_NP = 'MNP.37866';
const FORM_WITH_NO_MAP_TAB = 'MHL.3';
const FORM_WITH_NO_FILTERS_EDITABLE_PLACES = 'MHL.59';

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

    it('has list and map tab', async (done) => {
      expect(await projectFormPage.namedPlacesView.$tabs.isDisplayed()).toBe(true, 'tabs not displayed');
      expect(await projectFormPage.namedPlacesView.$listTab.isDisplayed()).toBe(true, 'list tab not displayed');
      expect(await projectFormPage.namedPlacesView.$mapTab.isDisplayed()).toBe(true, 'map tab not displayed');
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

    describe('map', () => {
      it('tab is displayed', async (done) => {
        expect(await projectFormPage.namedPlacesView.$mapTab.isDisplayed()).toBe(true, 'map tab not displayed');
        done();
      });

      it('mab tab is hidden if $.options.namedPlaceOptions.hideMapTab is true', async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_NO_MAP_TAB, '/form');
        expect(await projectFormPage.namedPlacesView.$mapTab.isPresent()).toBe(false, 'map tab was displayed');
        done();
      });
    });

    describe('municipality filter', () => {
      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_MUNICIPALITY_FILTER, '/form');
        done();
      });

      it('displays all by default', async (done) => {
        expect(await projectFormPage.namedPlacesView.$$listItems.count()).not.toBe(0);
        done();
      });

      it('change filters places', async (done) => {
        const namedPlacesListCount = await projectFormPage.namedPlacesView.$$listItems.count();
        expect(await projectFormPage.namedPlacesView.municipalityFilter.$select.isDisplayed()).toBe(true, 'not displayed');
        await projectFormPage.namedPlacesView.municipalityFilter.selectByIdx(1);
        expect(await projectFormPage.namedPlacesView.$$listItems.count()).not.toBe(namedPlacesListCount);
        done();
      });
    });

    describe('bird association filter', () => {
      beforeAll(async (done) => {
        await projectFormPage.navigateTo(FORM_WITH_BIRD_ASSOCIATION_FILTER, '/form');
        done();
      });

      it('displays none by default', async (done) => {
        expect(await projectFormPage.namedPlacesView.$$listItems.count()).toBe(0);
        done();
      });

      it('change filters places', async (done) => {
        const namedPlacesListCount = await projectFormPage.namedPlacesView.$$listItems.count();
        expect(await projectFormPage.namedPlacesView.birdAssociationAreaFilter.$select.isDisplayed()).toBe(true, 'not displayed');
        await projectFormPage.namedPlacesView.birdAssociationAreaFilter.selectByIdx(1);
        expect(await projectFormPage.namedPlacesView.$$listItems.count()).not.toBe(namedPlacesListCount);
        done();
      });
    });
  });

  it('named place with includeUnits option has unit', async (done) => {
    await projectFormPage.navigateTo(FORM_WITH_INCLUDE_UNITS, `/form/${FORM_WITH_INCLUDE_UNITS}/places/${FORM_WITH_INCLUDE_UNITS_NP}`);
    const $taxon = await projectFormPage.documentFormView.$findLajiFormNode('gatherings.0.units.0.identifications.0.taxonID');
    expect((await $taxon.$('input').getAttribute('value')).length).toBeGreaterThan(0, 'didn\'t have taxon');
    done();
  });

  it('canceling document save redirects to about named place view no history', async (done) => {
    await projectFormPage.documentFormView.$cancel.click();
    expect(await projectFormPage.namedPlacesView.$container.isDisplayed()).toBe(true);
    done();
  });

  describe('navigation from named place edit ', () => {

    let url: string;
    beforeAll(async (done) => {
      await projectFormPage.navigateTo(FORM_WITH_NO_FILTERS_EDITABLE_PLACES, '/form/places');
      await projectFormPage.namedPlacesView.$$listItems.first().click();
      await projectFormPage.namedPlacesView.$editButton.click();
      await projectFormPage.namedPlacesFormPage.$cancel.click();
      url = await browser.getCurrentUrl();
      done();
    });

    it('navigates to named places view', async (done) => {
      expect(await isDisplayed(projectFormPage.namedPlacesView.$container)).toBe(true);
      done();
    });

    it('doesn\'t add filters that aren\'t in the UI', async (done) => {
      expect(url.match(/tags=/)).toBe(null);
      expect(url.match(/municipality=/)).toBe(null);
      expect(url.match(/birdAssociationArea=/)).toBe(null);
      done();
    });
  });

});
