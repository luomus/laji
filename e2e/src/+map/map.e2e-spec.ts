import { MapPage } from './map.po';
import { ErrorPage } from '../+error/error.page';

describe('Map page', () => {
  let page: MapPage;
  let error: ErrorPage;

  beforeEach(() => {
    page = new MapPage();
    error = new ErrorPage();
  });

  afterEach(() => {
    expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
  });

  it('should zoom in to data on the map', () => {
    page.navigateToMapWithObservationData();
    expect(page.isZoomedIn()).toBe(true, 'Map was not zoomed to data');
  });
});
