import { VihkoPage } from './vihko.page';
import { UserPage } from '../+user/user.page';
import config from '../../config';
import { ErrorPage } from '../+error/error.page';

describe('Vihko page', () => {
  let page: VihkoPage;
  let user: UserPage;
  let error: ErrorPage;

  beforeAll(() => {
    page = new VihkoPage();
    user = new UserPage();
    error = new ErrorPage();
    user.login();
    page.navigateTo();
  });

  afterAll(() => {
    user.logout();
  });

  afterEach(() => {
    expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
  });

  it('should show list of forms', () => {
    expect(page.countSimpleForms()).toBeGreaterThan(5);
  });

  it('should open forms when clicking form buttons', async () => {
    const cnt = await page.countSimpleForms();
    for (let i = 0; i < cnt; i++) {
      const id = await page.getSimpleFormsIdByIdx(i);
      page.clickSimpleFormByIdx(i);
      expect(page.isPresentLegInput()).toBe(true, 'No leg input found on ' + id);
      expect(page.isPresentSubmitButton()).toBe(true, 'No submit button found on ' + id);
      expect(page.getLegInputValue()).toEqual(config.person.name, 'Leg value didn\'t match expected on ' + id);
      expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible on ' + id);
      page.moveTo();
      expect(error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when moving back to Notebook front page from ' + id);
    }
  });

});
