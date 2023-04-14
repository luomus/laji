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

  describe('search button', () => {
    beforeAll(async (done) => {
      await page.navigateTo('');
      done();
    });

    it('is disabled at start', async (done) => {
      expect(await page.$searchBtn.getAttribute('disabled')).toBe('true');
      done();
    });

    it('does not update filters before it is clicked', async (done) => {
      await page.$occurrenceCountFinlandMax.sendKeys(2);
      expect(await page.getOccurrenceCountFinlandMax()).toBe('');
      done();
    });

    it('clicking it updates the filters', async (done) => {
      expect(await page.$searchBtn.getAttribute('disabled')).not.toBe('true');
      await page.search();
      expect(await page.getOccurrenceCountFinlandMax()).toBe('2');
      done();
    });

    it('and changes tab to list', async (done) => {
      expect(await page.tabs.list.isActive()).toBe(true);
      done();
    });
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

      it('and drawing adds coordinates filter to query', async (done) => {
        await page.drawRectangle();
        await page.search();
        expect(await page.hasWGS84CoordinatesFilter()).toBe(true);
        done();
      });

      it('coordinate intersect 0 by default', async (done) => {
        expect(await page.getCoordinateIntersect()).toBe(0);
        done();
      });

      it('coordinate intersect can be updated', async (done) => {
        await page.$coordinateIntersectMaxBtn.click();
        await page.search();
        expect(await page.getCoordinateIntersect()).toBe(1);
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
          await page.search();
          expect(await page.hasPolygonFilter()).toBe(true);
          done();
        });
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
        await page.search();
        expect(await page.hasYKjCoordinatesFilter()).toBe(true);
        done();
      });

      it('coordinate intersect 1 by default', async (done) => {
        expect(await page.getCoordinateIntersect()).toBe(1);
        done();
      });

      it('coordinate intersect can be updated', async (done) => {
        await page.$coordinateIntersectMinBtn.click();
        await page.search();
        expect(await page.getCoordinateIntersect()).toBe(0);
        done();
      });
    });

    // Depends on previous describe block's state
    // (there's a coordinate filter and // the coordinates intersection control is visible)
    describe('coordinates intersect', () => {
      it('can be some other value than min/max', async (done) => {
        await page.updateCoordinateIntersectControlValue(0.3);
        await page.search();
        expect(await page.getCoordinateIntersect()).toBe(0.3);
        done();
      });
    });
  });

  describe('date search', () => {
    beforeAll(async (done) => {
      await page.timePanel.open();
      done();
    });

    const dateAsISO8601 = (date: Date) => date.toISOString().match(/^[^T]+/)[0];

    it('time start accepts date without zeros and updates query', async (done) => {
      await page.dateBegin.type('1.1.2022');
      await page.search();
      expect(await page.getTimeStart()).toBe('2022-01-01');
      expect(await page.getTimeEnd()).toBe('');
      done();
    });

    it('time start accepts date with zeros and updates query', async (done) => {
      await page.dateBegin.type('01.01.2022');
      await page.search();
      expect(await page.getTimeStart()).toBe('2022-01-01');
      expect(await page.getTimeEnd()).toBe('');
      done();
    });

    it('time end updates query', async (done) => {
      await page.dateEnd.type('1.1.2023');
      await page.search();
      expect(await page.getTimeStart()).toBe('2022-01-01');
      expect(await page.getTimeEnd()).toBe('2023-01-01');
      done();
    });


    describe('calendar', () => {
      it('calendar shows when toggled', async (done) => {
        await page.dateEnd.calendar.toggle();

        expect(await isDisplayed(page.dateEnd.calendar.$getContainer())).toBe(true);
        done();
      });

      it('calendar displays selected year', async (done) => {
        expect(await page.dateEnd.calendar.getYear()).toBe('2023');
        done();
      });

      it('calendar displays current year', async (done) => {
        await page.dateEnd.clear();
        await page.dateEnd.calendar.toggle();

        expect(await page.dateEnd.calendar.getYear()).toBe('' + new Date().getFullYear());
        done();
      });

      it('calendar clicking day selects it', async (done) => {
        await page.dateEnd.calendar.selectToday();
        await page.search();
        expect(await page.getTimeEnd()).toBe(dateAsISO8601(new Date()));
        done();
      });
    });

    it('today btn clears old values and updates to only today', async (done) => {
      await page.$today.click();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await page.search();
      expect(await page.getTimeStart()).toBe(dateAsISO8601(yesterday));
      expect(await page.getTimeEnd()).toBe('');
      done();
    });

    describe('preselected value', () => {
      beforeAll(async (done) => {
        await page.navigateTo('list', {time: '2022-01-22/'});
        done();
      });

      it('causes time panel to be open', async (done) => {
        expect(await page.timePanel.isOpen()).toBe(true);
        done();
      });

      it('shows value from input properties', async (done) => {
        expect(await page.dateBegin.getInputValue()).toBe('22.1.2022');
        done();
      });
    });
  });
});
