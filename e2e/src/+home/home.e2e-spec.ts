import { HomePage } from './home.po';
import { ErrorPage } from '../+error/error.page';

describe('Home page', () => {
  let page: HomePage;
  let error: ErrorPage;

  beforeEach(() => {
    page = new HomePage();
    error = new ErrorPage();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should display title in finnish', async (done) => {
    await page.navigateTo();
    expect(await page.getPageTitle()).toEqual('Suomen Lajitietokeskus');
    done();
  });

  it('should display title in english', async (done) => {
    await page.navigateTo('en');
    expect(await page.getPageTitle()).toEqual('Finnish Biodiversity Information Facility');
    done();
  });

  it('should display title in swedish', async (done) => {
    await page.navigateTo('sv');
    expect(await page.getPageTitle()).toEqual('Finlands Artdatacenter');
    done();
  });
});
