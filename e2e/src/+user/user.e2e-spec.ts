import { UserPage } from './user.page';
import config from '../../config';
import { ErrorPage } from '../+error/error.page';

describe('User page', () => {
  let page: UserPage;
  let error: ErrorPage;

  beforeAll(() => {
    page = new UserPage();
    error = new ErrorPage();
  });

  afterEach(() => {
    expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
  });

  it('should login user', () => {
    page.login();
    page.navigateTo();
    expect(page.getLoggedInUser()).toEqual(config.person.name);
  });

  it('should logout user', () => {
    page.logout();
    page.navigateTo();
    expect(page.isPresentUsername()).toBeFalsy();
  });
});
