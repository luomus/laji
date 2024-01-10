import { test, expect } from '@playwright/test';
import { login, logout } from '../+user/user.po';
import { ObservationPage } from './observation.po';
import { MapPageObject } from '@luomus/laji-map/test-export/test-utils';

test.describe('Observation list', () => {
  let observationPage: ObservationPage;

  test.beforeEach(async ({ page }) => {
    observationPage = new ObservationPage(page);
  });

  test('graphql works with all filters', async () => {
    await observationPage.navigateToViewWithAllFilters();
    expect(await observationPage.hasGraphqlErrors()).toBe(false);
  });

  test.describe('search button', () => {
    test.beforeEach(async () => {
      await observationPage.navigateTo('');
    });

    test('is disabled at start', async () => {
      await expect(observationPage.$searchBtn).toBeDisabled();
    });

    test('is not disabled when there are new filters', async () => {
      await observationPage.$occurrenceCountFinlandMax.fill((2).toString());
      await expect(observationPage.$searchBtn).not.toBeDisabled();
    });

    test('does not update filters before it is clicked', async () => {
      await observationPage.$occurrenceCountFinlandMax.fill((2).toString());
      expect(await observationPage.getOccurrenceCountFinlandMax()).toBe('');
    });

    test('clicking it updates the filters', async () => {
      await observationPage.$occurrenceCountFinlandMax.fill((2).toString());
      await observationPage.search();
      expect(await observationPage.getOccurrenceCountFinlandMax()).toBe('2');
    });

    test('and changes tab to list', async () => {
      expect(await observationPage.tabs.list.isActive()).toBe(true);
    });
  });

  test.describe('active filters remove', () => {
    test.beforeEach(async () => {
      await observationPage.navigateTo('list');
    });

    test('removes a normal filter', async () => {
      await observationPage.$occurrenceCountFinlandMax.fill((2).toString());
      await observationPage.search();
      await observationPage.removeFromActiveFilters('occurrenceCountFinlandMax');
      expect(await observationPage.getOccurrenceCountFinlandMax()).toBe('');
    });

    test('removes a coordinate filter that have not been applied yet', async () => {
      await observationPage.placePanel.open();
      await observationPage.$drawRectangleBtn.click();
      await observationPage.drawRectangle();
      await observationPage.removeFromActiveFilters('coordinates');
      await expect(observationPage.$searchBtn).toBeDisabled();
    });
  });

  test.describe('place search', () => {

    test.beforeEach(async () => {
      // await logout(page);
      await observationPage.navigateTo('list');
      await observationPage.placePanel.open();
    });

    test.describe('rectangle button click', () => {
      test.beforeEach(async () => {
        await observationPage.$drawRectangleBtn.click();
      });

      test('changes tab to map', async () => {
        expect(await observationPage.tabs.map.isActive()).toBe(true);
      });

      test('and drawing adds coordinates filter to query', async () => {
        await observationPage.drawRectangle();
        await observationPage.search();
        expect(await observationPage.hasWGS84CoordinatesFilter()).toBe(true);
      });

      test('coordinate intersect 0 by default', async () => {
        expect(await observationPage.getCoordinateIntersect()).toBe(0);
      });

      test('coordinate intersect can be updated', async () => {
        await observationPage.$coordinateIntersectMaxBtn.click();
        await observationPage.search();
        expect(await observationPage.getCoordinateIntersect()).toBe(1);
      });

      test.afterEach(async () => {
        await observationPage.navigateTo('list');
        await observationPage.placePanel.open();
      });
    });

    test.describe('polygon button', () => {
      test('disabled when logged out', async () => {
        await expect(observationPage.$drawPolygonBtn).toBeDisabled();
      });

      test('enabled when logged in', async ({ page }) => {
        await login(page);
        await page.locator('#navbar').getByRole('link', { name: 'Selaa havaintoja' }).click();
        await observationPage.placePanel.open();
        expect(await observationPage.$drawPolygonBtn.getAttribute('disabled')).not.toBe('true');
      });

      test.describe('click', () => {
        test.beforeEach(async ({ page }) => {
          await login(page);
          await page.locator('#navbar').getByRole('link', { name: 'Selaa havaintoja' }).click();
          await observationPage.placePanel.open();
          await observationPage.$drawPolygonBtn.click();
        });

        test('changes tab to map', async () => {
          expect(await observationPage.tabs.map.isActive()).toBe(true);
        });

        test('and drawing adds polygon filter to query', async () => {
          await observationPage.zoomClose();
          await observationPage.drawPolygon();
          await observationPage.search();
          expect(await observationPage.hasPolygonFilter()).toBe(true);
        });
      });

      test.afterEach(async () => {
        await observationPage.navigateTo('list');
        await observationPage.placePanel.open();
      });
    });

    test.describe('YKJ grid button click', () => {
      let control: MapPageObject['controls']['coordinateInput'];

      test.beforeEach(async () => {
        control = observationPage.map.controls.coordinateInput;
        await observationPage.$enterYkjBtn.click();
      });

      test('changes tab to map', async () => {
        expect(await observationPage.tabs.map.isActive()).toBe(true);
      });

      test('opens YKJ modal', async () => {
        await expect(control.$container).toBeVisible();
      });

      test('and entering YKJ rectangle filter to query', async () => {
        await control.enterLatLng(666, 333);
        await control.$submit.click();
        await observationPage.search();
        expect(await observationPage.hasYKjCoordinatesFilter()).toBe(true);
      });

      test('coordinate intersect 1 by default', async () => {
        expect(await observationPage.getCoordinateIntersect()).toBe(1);
      });

      test('coordinate intersect can be updated', async () => {
        await observationPage.$coordinateIntersectMinBtn.click();
        await observationPage.search();
        expect(await observationPage.getCoordinateIntersect()).toBe(0);
      });
    });

    // Depends on previous describe block's state
    // (there's a coordinate filter and // the coordinates intersection control is visible)
    test.describe('coordinates intersect', () => {
      test('can be some other value than min/max', async () => {
        await observationPage.placePanel.open();
        await observationPage.$drawRectangleBtn.click();
        await observationPage.drawRectangle();
        // ^ added
        await observationPage.updateCoordinateIntersectControlValue(0.3);
        await observationPage.search();
        expect(await observationPage.getCoordinateIntersect()).toBe(0.3);
      });
    });
  });

  test.describe('date search', () => {
    test.beforeEach(async () => {
      await observationPage.navigateTo('');
      await observationPage.timePanel.open();
    });

    const dateAsISO8601 = (date: Date) => date.toISOString().match(/^[^T]+/)[0];

    test('time start accepts date without zeros and updates query', async () => {
      await observationPage.dateBegin.type('1.1.2022');
      await observationPage.search();
      expect(await observationPage.getTimeStart()).toBe('2022-01-01');
      expect(await observationPage.getTimeEnd()).toBe('');
    });

    test('time start accepts date with zeros and updates query', async () => {
      await observationPage.dateBegin.type('01.01.2022');
      await observationPage.search();
      expect(await observationPage.getTimeStart()).toBe('2022-01-01');
      expect(await observationPage.getTimeEnd()).toBe('');
    });

    test('time end updates query', async () => {
      await observationPage.dateEnd.type('1.1.2023');
      await observationPage.search();
      expect(await observationPage.getTimeEnd()).toBe('2023-01-01');
    });


    test.describe('calendar', () => {
      test('calendar shows when toggled', async () => {
        await observationPage.dateEnd.calendar.toggle();
        await expect(observationPage.dateEnd.calendar.$getContainer()).toBeVisible();
      });

      test('calendar displays selected year', async () => {
        await observationPage.dateEnd.type('01.01.2023');
        await observationPage.dateEnd.calendar.toggle();
        await expect(observationPage.dateEnd.calendar.getDate()).toContainText('2023');
      });

      test('calendar displays current year', async () => {
        await observationPage.dateEnd.calendar.toggle();
        expect(await observationPage.dateEnd.calendar.getYear()).toBe('' + new Date().getFullYear());
      });

      test('calendar clicking day selects it', async () => {
        await observationPage.dateEnd.calendar.toggle();
        await observationPage.dateEnd.calendar.selectToday();
        await observationPage.search();
        expect(await observationPage.getTimeEnd()).toBe(dateAsISO8601(new Date()));
      });
    });

    test('today btn clears old values and updates to only today', async () => {
      await observationPage.$today.click();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await observationPage.search();
      expect(await observationPage.getTimeStart()).toBe(dateAsISO8601(yesterday));
      expect(await observationPage.getTimeEnd()).toBe('');
    });

    test.describe('preselected value', () => {
      test.beforeEach(async () => {
        await observationPage.navigateTo('list', { time: '2022-01-22/' });
      });

      test('causes time panel to be open', async () => {
        expect(await observationPage.timePanel.isOpen()).toBe(true);
      });

      test('shows value from input properties', async () => {
        await expect(observationPage.dateBegin.$container.locator('input')).toHaveValue('22.1.2022');
      });
    });
  });
});
