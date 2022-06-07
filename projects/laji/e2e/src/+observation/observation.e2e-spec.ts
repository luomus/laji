import { browser } from 'protractor';
import { UserPage } from '../+user/user.po';
import { EC, isDisplayed } from '../../helper';
import { ObservationPage } from './observation.po';
const page = new ObservationPage();
const user = new UserPage();

describe('Observation list', () => {
  it('graphql works with all filters', async (done) => {
    await page.navigateToViewWithAllFilters();
    await page.waitUntilLoaded();
    expect(await page.hasGraphqlErrors()).toBe(false);
    done();
  });

  describe('place search', () => {
    beforeAll(async (done) => {
      await user.logout();
      await page.navigateTo('list');
      await page.placePanel.open();
      done();
    });

    describe('rectangle button click', () => {
      beforeAll(async (done) => {
        await page.$drawRectangleBtn.click();
        done();
      });

      it('changes tab to map', async (done) => {
        expect(await page.tabs.map.isActive()).toBe(true);
        done();
      });

      it('and drawing adds polygon filter to query', async (done) => {
        await page.drawRectangle();
        expect(await page.hasWGS84CoordinatesFilter()).toBe(true);
        done();
      });

      it('coordinate intersect 0 by default', async (done) => {
        expect(await page.getCoordinateIntersect()).toBe(0);
        done();
      });

      it('coordinate intersect can be updated', async (done) => {
        await page.$coordinateIntersectMaxBtn.click();
        expect(await page.getCoordinateIntersect()).toBe(1);
        done();
      });

      afterAll(async (done) => {
        await page.navigateTo('list');
        await page.placePanel.open();
        done();
      });
    });

    describe('YKJ grid button click', () => {
      const control = page.map.getCoordinateInputControl();

      beforeAll(async (done) => {
        await page.$enterYkjBtn.click();
        done();
      });

      it('changes tab to map', async (done) => {
        expect(await page.tabs.map.isActive()).toBe(true);
        done();
      });

      it('opens YKJ modal', async (done) => {
        expect(isDisplayed(await control.$getContainer())).toBe(true);
        done();
      });

      it('and entering YKJ rectangle filter to query', async (done) => {
        await control.enterLatLng(666, 333);
        await control.$getSubmit().click();
        expect(await page.hasYKjCoordinatesFilter()).toBe(true);
        done();
      });

      it('coordinate intersect 1 by default', async (done) => {
        expect(await page.getCoordinateIntersect()).toBe(1);
        done();
      });

      it('coordinate intersect can be updated', async (done) => {
        await page.$coordinateIntersectMinBtn.click();
        expect(await page.getCoordinateIntersect()).toBe(0);
        done();
      });
    });

    // Depends on previous describe block's state
    // (there's a coordinate filter and // the coordinates intersection control is visible)
    describe('coordinates intersect', () => {
      it('can be some other value than min/max', async (done) => {
        await page.updateCoordinateIntersectControlValue(0.3);
        expect(await page.getCoordinateIntersect()).toBe(0.3);
        done();
      });
    });
  });
});
