import { DEFAULT_TEST_USER, TEST_USERS, UserPage } from './user.po';
import { ErrorPage } from '../+error/error.page';

describe('User page', () => {
  let page: UserPage;
  let error: ErrorPage;

  beforeAll(() => {
    page = new UserPage();
    error = new ErrorPage();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should login user', async (done) => {
    await page.navigateTo();
    await page.login();
    expect(await page.getLoggedInUsersName()).toEqual(TEST_USERS[DEFAULT_TEST_USER].name);
    done();
  });

  it('should logout user', async (done) => {
    await page.logout();
    expect(await page.isPresentLoggedInUsersName()).toBeFalsy();
    done();
  });
});
