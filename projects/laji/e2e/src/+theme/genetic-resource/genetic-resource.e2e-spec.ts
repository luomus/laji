import { ErrorPage } from '../../+error/error.page';
import { GeneticResourcePage } from './genetic-resource.po';

describe('Genetic Resource page', () => {
  let page: GeneticResourcePage;
  let error: ErrorPage;

  beforeEach(() => {
    page = new GeneticResourcePage();
    error = new ErrorPage();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should not have non-graphql api errors', async (done) => {
    await page.navigateToMollusca();
    await page.waitUntilLoaded();
    expect(await page.hasNonGQLApiErrors()).toBe(false);
    done();
  });
});
