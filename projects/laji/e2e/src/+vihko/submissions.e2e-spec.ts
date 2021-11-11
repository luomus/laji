import { SubmissionsPage } from './submissions.po'
import { UserPage } from '../+user/user.po';
import { isDisplayed } from '../../helper';

const userPage = new UserPage();
const submissionsPage = new SubmissionsPage();

describe('Vihko own submissions page', () => {

  beforeAll(async (done) => {
    await userPage.handleNavigationWithExternalLogin(() => submissionsPage.navigateTo());
    done();
  });

  it('displays submissions', async (done) => {
    expect(submissionsPage.datatable.$$rows.count()).not.toBe(0);
    done();
  });

  it('displays view button', async (done) => {
    expect(await isDisplayed(submissionsPage.datatable.getRow(0).$viewButton)).toBe(true);
    done();
  });

  it('displays edit button', async (done) => {
    expect(await isDisplayed(submissionsPage.datatable.getRow(0).$editButton)).toBe(true);
    done();
  });

  it('displays download button', async (done) => {
    expect(await isDisplayed(submissionsPage.datatable.getRow(0).$downloadButton)).toBe(true);
    done();
  });

  it('displays delete button', async (done) => {
    expect(await isDisplayed(submissionsPage.datatable.getRow(0).$deleteButton)).toBe(true);
    done();
  });

  it('doesn\'t display template button', async (done) => {
    expect(await isDisplayed(submissionsPage.datatable.getRow(0).$templateButton)).toBe(false)
    done();
  });

  it('displays only 4 buttons', async (done) => {
    expect(await submissionsPage.datatable.getRow(0).$$buttons.count()).toBe(4);
    done();
  });
});
