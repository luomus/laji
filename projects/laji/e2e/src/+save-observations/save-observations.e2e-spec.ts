import { SaveObservationsPage } from './save-observations.po';
import { UserPage } from '../+user/user.po';
import { ErrorPage } from '../+error/error.page';
import { ProjectFormPage } from '../+project-form/project-form.po';

describe('Save observations page', () => {
  let page: SaveObservationsPage;
  let projectPage: ProjectFormPage;
  let user: UserPage;
  let error: ErrorPage;

  beforeAll(async (done) => {
    page = new SaveObservationsPage();
    projectPage = new ProjectFormPage();
    user = new UserPage();
    error = new ErrorPage();

    await page.navigateTo();
    await user.login();
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should show list of forms', async (done) => {
    expect(await page.countSimpleForms()).toBeGreaterThan(5);
    done();
  });

  it('should open form when clicking form button', async (done) => {
    await page.clickFormById('JX.652');
    expect(await projectPage.$sidebar.isDisplayed()).toBe(true, 'landed on form page');
    done();
  });
});
