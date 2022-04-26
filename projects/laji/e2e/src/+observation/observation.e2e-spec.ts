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
        expect(await page.hasCoordinatesFilter()).toBe(true);
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

      afterAll(async (done) => {
        await page.navigateTo('list');
        await page.placePanel.open();
        done();
      });
    });

    describe('polygon button', () => {
      it('disabled when logged out', async (done) => {
        expect(await page.$drawPolygonBtn.getAttribute('disabled')).toBe('true');
        done();
      });

      it('enabled when logged in', async (done) => {
        await user.login();
        expect(await page.$drawPolygonBtn.getAttribute('disabled')).not.toBe('true');
        done();
      });

      describe('click', () => {
        beforeAll(async (done) => {
          await page.placePanel.open();
          await page.$drawPolygonBtn.click();
          done();
        });

        it('changes tab to map', async (done) => {
          await browser.wait(EC.visibilityOf(page.map.$getElement()));
          expect(await page.tabs.map.isActive()).toBe(true);
          done();
        });

        it('and drawing adds polygon filter to query', async (done) => {
          await page.zoomClose();
          await page.drawPolygon();
          expect(await page.hasPolygonFilter()).toBe(true);
          done();
        });

        it('coordinate intersect 0 by default', async (done) => {
          expect(await page.getPolygonIntersect()).toBe(0);
          done();
        });

        it('coordinate intersect can be updated', async (done) => {
          await page.$coordinateIntersectMaxBtn.click();
          expect(await page.getPolygonIntersect()).toBe(1);
          done();
        });
      });
    });
  });
});
