import { MapPage } from './map.po';
import { ErrorPage } from '../+error/error.page';

describe('Map page', () => {
  let page: MapPage;
  let error: ErrorPage;

  beforeEach(() => {
    page = new MapPage();
    error = new ErrorPage();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should zoom in to data on the map', async (done) => {
    await page.navigateToMapWithObservationData();
    expect(await page.isZoomedIn()).toBe(true, 'Map was not zoomed to data');
    done();
  });
});
