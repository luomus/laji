import { KerttuLetterAnnotationPage } from './letter-annotation.po';
import { UserPage } from '../../+user/user.po';
import {ErrorPage} from '../../+error/error.page';
import {KerttuTaxonExpertisePage} from './taxon-expertise.po';

describe('Kerttu letter annotation page', () => {
  let page: KerttuLetterAnnotationPage;
  let user: UserPage;
  let error: ErrorPage;
  let taxonExpertise: KerttuTaxonExpertisePage;

  beforeAll(async (done) => {
    user = new UserPage();
    page = new KerttuLetterAnnotationPage();
    error = new ErrorPage();
    taxonExpertise = new KerttuTaxonExpertisePage();
    await taxonExpertise.navigateTo();
    await user.login();
    await taxonExpertise.checkThatEverythingIsFilled();
    await page.navigateTo();
    done();
  });

  afterEach(async (done) => {
    expect(await error.isPresentErrorDialog()).toBe(false, 'Error dialog was visible when it should not be');
    done();
  });

  it('should be able to show letter template', async (done) => {
    expect(await  page.letterTemplateIsVisible()).toBe(true, 'Letter template is not visible when it should be');
    done();
  });

  it('should be able to show letter candidate', async (done) => {
    expect(await  page.letterCandidateIsVisible()).toBe(true, 'Letter candidate is not visible when it should be');
    done();
  });
});
