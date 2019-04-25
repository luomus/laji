import { HomePage } from './home.page';
import { ErrorPage } from '../+error/error.page';

describe('Home page', () => {
  let page: HomePage;
  let error: ErrorPage;

  beforeEach(() => {
    page = new HomePage();
    error = new ErrorPage();
  });

  afterEach(() => {
    expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
  });

  it('should display title in finnish', () => {
    page.navigateTo();
    expect(page.getPageTitle()).toEqual('Suomen Lajitietokeskus');
  });

  it('should display title in english', () => {
    page.navigateTo('en');
    expect(page.getPageTitle()).toEqual('Finnish Biodiversity Information Facility');
  });

  it('should display title in swedish', () => {
    page.navigateTo('sv');
    expect(page.getPageTitle()).toEqual('Finlands Artdatacenter');
  });
});
