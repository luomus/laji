import { test, expect } from '@playwright/test';
import { loginWithPermanentToken } from '../+user/user.po';
import { ObservationPage } from './observation.po';
import { MapPageObject } from '@luomus/laji-map/test-export/test-utils';

test.describe('Observation list', () => {
  let observationPage: ObservationPage;

  test.beforeEach(async ({ page }) => {
    observationPage = new ObservationPage(page);
  });

  test('graphql works with all filters', async () => {
    await observationPage.navigateToViewWithAllFilters();
    expect(observationPage.pageHasGraphQLApiErrors()).toBe(false);
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
      await expect(observationPage.page).toHaveURL(/^(?:(?!occurrenceCountFinlandMax).)*$/);
    });

    test('clicking it updates the filters', async () => {
      await observationPage.$occurrenceCountFinlandMax.fill((2).toString());
      await observationPage.search();
      await expect(observationPage.page).toHaveURL(/.*occurrenceCountFinlandMax=2.*/);
    });

    test('and changes tab to list', async () => {
      await expect(observationPage.page.locator('.obs-filter-list')).toHaveAttribute('class', /.*active.*/);
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
      await expect(observationPage.page).toHaveURL(/^(?:(?!occurrenceCountFinlandMax).)*$/);
    });

    test('removes a coordinate filter that have not been applied yet', async () => {
      await observationPage.placePanel.open();
      await observationPage.$drawRectangleBtn.click();
      await observationPage.$mapSpinner.waitFor({ state: 'hidden' });
      await observationPage.drawRectangle();
      await observationPage.removeFromActiveFilters('coordinates');
      await expect(observationPage.$searchBtn).toBeDisabled();
    });
  });

  test.describe('place search', () => {

    test.beforeEach(async () => {
      await observationPage.navigateTo('list');
      await observationPage.placePanel.open();
    });

    test.describe('rectangle button click', () => {
      test.beforeEach(async () => {
        await observationPage.$drawRectangleBtn.click();
      });

      test('changes tab to map', async () => {
        await expect(observationPage.page.locator('.obs-filter-map')).toHaveAttribute('class', /.*active.*/);
      });

      test('and drawing adds coordinates filter to query', async () => {
        await observationPage.$mapSpinner.waitFor({ state: 'hidden' });
        await observationPage.drawRectangle();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*WGS84:.*/);
      });

      test('coordinate intersect 0 by default', async () => {
        await observationPage.$mapSpinner.waitFor({ state: 'hidden' });
        await observationPage.drawRectangle();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*WGS84:0.*/);
      });

      test('coordinate intersect can be updated', async () => {
        await observationPage.$mapSpinner.waitFor({ state: 'hidden' });
        await observationPage.drawRectangle();
        await observationPage.search();
        await observationPage.$coordinateIntersectMaxBtn.click();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*WGS84:1.*/);
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

      test('enabled when logged in', async () => {
        await loginWithPermanentToken(observationPage.page);
        await observationPage.page.locator('#navbar').getByRole('link', { name: 'Selaa havaintoja' }).click();
        await observationPage.placePanel.open();
        await expect(observationPage.$drawPolygonBtn).not.toBeDisabled();
      });

      test.describe('click', () => {
        test.beforeEach(async () => {
          await loginWithPermanentToken(observationPage.page);
          await observationPage.page.locator('#navbar').getByRole('link', { name: 'Selaa havaintoja' }).click();
          await observationPage.placePanel.open();
          await observationPage.$drawPolygonBtn.click();
        });

        test('changes tab to map', async () => {
          await expect(observationPage.page.locator('.obs-filter-map')).toHaveAttribute('class', /.*active.*/);
        });

        // needs fixing, fails sometimes
        test.skip('and drawing adds polygon filter to query', async () => {
          await observationPage.zoomClose();
          await observationPage.drawPolygon();
          await observationPage.search();
          await expect(observationPage.page).toHaveURL(/.*?.*polygonId=\d+/);
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
        await expect(observationPage.page.locator('.obs-filter-map')).toHaveAttribute('class', /.*active.*/);
      });

      test('opens YKJ modal', async () => {
        await expect(control.$container).toBeVisible();
      });

      test('and entering YKJ rectangle filter to query', async () => {
        // await expect(control.$container).toBeVisible();
        await control.$container.waitFor({ state: 'visible' });
        await control.enterLatLng(666, 333);
        await control.$submit.click();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*YKJ:.*/);
      });

      test('coordinate intersect 1 by default', async () => {
        // await expect(control.$container).toBeVisible();
        await control.$container.waitFor({ state: 'visible' });
        await control.enterLatLng(666, 333);
        await control.$submit.click();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*YKJ:1.*/);
      });

      test('coordinate intersect can be updated', async () => {
        // await expect(control.$container).toBeVisible();
        await control.$container.waitFor({ state: 'visible' });
        await control.enterLatLng(666, 333);
        await control.$submit.click();
        await observationPage.search();
        await observationPage.$coordinateIntersectMinBtn.click();
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*YKJ:0.*/);
      });
    });

    test.describe('coordinates intersect', () => {
      test('can be some other value than min/max', async () => {
        const control = observationPage.map.controls.coordinateInput;
        await observationPage.$enterYkjBtn.click();
        await control.enterLatLng(666, 333);
        await control.$submit.click();
        await observationPage.updateCoordinateIntersectControlValue(0.3);
        await observationPage.search();
        await expect(observationPage.page).toHaveURL(/.*YKJ:0.3.*/);
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
      await expect(observationPage.page).toHaveURL(/.*time=2022-01-01%2F*/);
    });

    test('time start accepts date with zeros and updates query', async () => {
      await observationPage.dateBegin.type('01.01.2022');
      await observationPage.search();
      await expect(observationPage.page).toHaveURL(/.*time=2022-01-01%2F*/);
    });

    test('time end updates query', async () => {
      await observationPage.dateEnd.type('1.1.2023');
      await observationPage.search();
      await expect(observationPage.page).toHaveURL(/.*time=%2F2023-01-01*/);
    });


    test.describe('calendar', () => {
      test('calendar shows when toggled', async () => {
        // await page.locator('.observation-time-container laji-datepicker.time-end').locator('.calendar-toggle').click();
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
        await expect(observationPage.dateEnd.calendar.getDate()).toContainText('' + new Date().getFullYear());
      });

      // calendar alignment issue needs to be fixed, skip until then
      test.skip('calendar clicking day selects it', async () => {
        await observationPage.dateEnd.calendar.toggle();
        await observationPage.dateEnd.calendar.selectToday();
        await observationPage.search();
        const regex = new RegExp(`.*time=%2F${dateAsISO8601(new Date())}*`);
        await expect(observationPage.page).toHaveURL(regex);
      });
    });

    test('today btn clears old values and updates to only today', async () => {
      await observationPage.$today.click();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await observationPage.search();
      const regex = new RegExp(`.*time=${dateAsISO8601(yesterday)}%2F*`);
      await expect(observationPage.page).toHaveURL(regex);
    });

    test.describe('preselected value', () => {
      test.beforeEach(async () => {
        await observationPage.navigateTo('list', { time: '2022-01-22/' });
      });

      test('causes time panel to be open', async () => {
        await expect(observationPage.page.locator('.laji-panel-time .is-open')).toBeVisible();
      });

      test('shows value from input properties', async () => {
        await expect(observationPage.dateBegin.$container.locator('input')).toHaveValue('22.1.2022');
      });
    });
  });
});
