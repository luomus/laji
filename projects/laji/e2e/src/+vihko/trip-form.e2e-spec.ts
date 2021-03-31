import { ErrorPage } from '../+error/error.page';
import { UserPage } from '../+user/user.po';
import { TripFormPage } from './trip-form.po';

describe('Trip form page', () => {
  let page: TripFormPage;
  let user: UserPage;
  let error: ErrorPage;

  beforeAll(async (done) => {
    user = new UserPage();
    page = new TripFormPage();
    error = new ErrorPage();
    await user.handleNavigationWithExternalLogin(() => page.navigateTo());
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should be able to fill in form with simple data', async (done) => {
    await page.fillInSimpleForm();
    expect(await page.getCountryName()).toBe('Suomi', 'Country should be autofilled with Suomi');
    done();
  });

  it('should be able to save form with simple data', async (done) => {
    await page.clickSavePrivate();
    expect(await page.getToasterText()).toContain('Havainnot tallennettu!', 'Success toast should show success message');
    expect(await page.hasOverlayPresent()).toBe(false, 'Overlay was still present after successful save');
    done();
  });

  it('should allow clicking trip form after successful save', async (done) => {
    await page.clickTripFormLink();
    expect(await page.getPageTitle()).toContain('Retkilomake', 'Form title should be visible after clicking the form link');
    done();
  });
});
