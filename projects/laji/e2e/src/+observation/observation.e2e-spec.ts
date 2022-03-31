import { ObservationPage } from './observation.po';
const observationPage = new ObservationPage();

describe('Observation list', () => {
  it('graphql works with all filters', async (done) => {
    await observationPage.navigateToViewWithAllFilters();
    expect(await observationPage.hasGraphqlErrors()).toBe(false);
    done();
  });
});
