import { SaveObservationsPage } from './save-observations.po';
import { DEFAULT_TEST_USER, TEST_USERS, UserPage } from '../+user/user.po';
import { ErrorPage } from '../+error/error.page';
import { ProjectFormPage } from '../+project-form/project-form.po';

describe('Save observations page', () => {
  let page: SaveObservationsPage;
  let projectPage: ProjectFormPage;
  let user: UserPage;
  let error: ErrorPage;
  let originalTimeout;

  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
  });

  beforeAll(async (done) => {
    page = new SaveObservationsPage();
    projectPage = new ProjectFormPage();
    user = new UserPage();
    error = new ErrorPage();

    await page.navigateTo();
    await user.login();
    done();
  });

  afterAll(async (done) => {
    await user.logout();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
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

  it('should open forms when clicking form buttons', async (done) => {
    const cnt = await page.countSimpleForms();
    for (let i = 0; i < cnt; i++) {
      const id = await page.getSimpleFormsIdByIdx(i);
      await page.clickSimpleFormByIdx(i);
      if (await projectPage.isMobileForm()) {
        expect(await projectPage.isTermsModalOpen()).toBe(true, 'No use terms visible when it should on ' + id);
        await projectPage.closeTermsDialog();
      } else if (!await projectPage.hasFormLink()) {
        expect(await projectPage.hasAboutText()).toBe(true, 'About page should be first thing visible for other than mobile forms ' + id);
      } else {
        expect(await projectPage.hasAboutText()).toBe(true, 'About page should be first thing visible for other than mobile forms ' + id);
        await projectPage.clickFormLink();
        if (!await projectPage.hasNamedPlace()) {
          expect(await page.isPresentLegInput()).toBe(true, 'No leg input found on ' + id);
          expect(await page.isPresentSubmitButton()).toBe(true, 'No submit button found on ' + id);
          expect(await page.getLegInputValue(TEST_USERS[DEFAULT_TEST_USER].nameWithGroup)).toBe(TEST_USERS[DEFAULT_TEST_USER].nameWithGroup, 'Leg value didn\'t match expected on ' + id);
          expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible on ' + id);
        }
      }
      await page.moveTo();
      expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when moving back to Notebook front page from ' + id);
    }
    done();
  });

});
