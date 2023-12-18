import test, { Page, expect } from '@playwright/test';
import { login } from '../+user/user.po';

const FORM_WITH_SIMPLE_HAS_NO_CATEGORY = 'JX.519';
const FORM_WITH_SIMPLE_HAS_CATEGORY = 'MHL.25';
const FORM_WITH_MOBILE = 'MHL.51';
const FORM_NO_SIMPLE_NO_NAMED_PLACES = 'MHL.6';
const FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION = 'MHL.3';
const FORM_NAMED_PLACES_LOOSE_ACCESS_RESTRICTION = 'MHL.1';
const FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION = 'MHL.45';
const FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION_NO_PERMISSION = 'MHL.50';
const FORM_DISABLED = 'MHL.90';
const FORM_ALLOW_TEMPLATES = 'MHL.6';
const FORM_MULTIPLE_FORMS_OWN_SUBMISSONS = 'MHL.45';
const FORM_MULTIPLE_FORMS_OWN_SUBMISSONS_DOC = 'JX.282874';

export const getAddressWithLang = (page: string, lang?: 'fi' | 'sv' | 'en'): string =>
  ((lang && lang !== 'fi') ? '/' + lang : '') + page;
const getProjectFormUrl = (id: string, subPage = '', lang?: 'fi' | 'en' | 'sv') =>
  getAddressWithLang(`/project/${id}${subPage}`, lang);

const getLang = async (page: Page): Promise<('fi' | 'sv' | 'en')> => {
  const text = (await page.locator('.language-toggle span').textContent()).trim().toLowerCase();
  if (!['fi', 'sv', 'en'].includes(text)) {
    throw new Error('Couldn\'t get lang');
  }
  return text as ('fi' | 'sv' | 'en');
};

test.describe('Project form', () =>  {
  test.describe('when logged out', () => {
    test.describe('and has named places and no access restriction', () => {
      test('/form page redirects to named places view', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION, '/form'));
        expect(page.locator('laji-named-places')).toBeVisible();
      });
    });
    test.describe('and has named places and loose access restriction', () => {
      test('/form page redirects to named places view', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_LOOSE_ACCESS_RESTRICTION, '/form'));
        expect(page.locator('laji-named-places')).toBeVisible();
      });
    });
    test.describe('and has named places and strict access restriction', () => {
      test('/form page redirects to login', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION, '/form'));
        expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
      });
    });
    test.describe('and has simple option,', () => {
      test('form page redirects to login', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_NO_CATEGORY));
        expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
      });
    });

    test.describe('and has mobile option,', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_WITH_MOBILE));
      });

      test('doesn\'t display terms', async ({ page }) => {
        expect(page.locator('laji-project-form-terms')).not.toBeVisible();
      });

      test('shows login button', async ({ page }) => {
        expect(page.locator('.login-button')).toBeVisible();
      });

      test('navigating to /form redirects to login', async ({ page }) => {
        await page.goto(page.url() + '/form');
        expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
      });
    });

    test.describe('not simple not mobile no places no multiform', () => {
      test('/form page redirects to login', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, '/form'));
        expect(page.locator('#local-login'), 'Wasn\'t on external login page').toBeVisible();
      });

      test('after login is on form page', async ({ page }) => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION, '/form'));
        await login(page);
        expect(page.locator('laji-project-form-form')).toBeVisible();
      });
    });

    test('disabled form is displayed as disabled', async ({ page }) => {
      await page.goto(getProjectFormUrl(FORM_DISABLED));
      expect(page.locator('laji-project-form-disabled')).toBeVisible();
      expect(page.locator('.sidebar')).not.toBeVisible();
    });
  });

  test.describe('when logged in', () => {
    test.describe('and has simple option,', () => {
      test.describe.configure({ mode: 'serial' });
      let page: Page;

      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await login(page);
      });

      test.beforeEach(async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_NO_CATEGORY, undefined, 'en'));
      });

      test('displays form', async () => {
        expect(page.locator('laji-form .laji-form')).toBeVisible();
      });

      test('doesn\'t display sidebar', async () => {
        expect(page.locator('.sidebar')).not.toBeVisible();
      });

      test('and has no category, canceling document save redirects to Vihko home page if no history and keeps lang', async () => {
        await page.locator('laji-form-footer .btn-danger').click(); // cancel
        expect(page.locator('.haseka-home')).toBeVisible();
        expect(await getLang(page)).toBe('en');
      });

      test('back navigate navigates away from form and keeps lang', async () => {
        await page.goto(getAddressWithLang('/vihko/home', 'en'));
        await page.locator(
          `[href="${getAddressWithLang(`/project/${FORM_WITH_SIMPLE_HAS_NO_CATEGORY}`, 'en')}"`
        ).click();

        await page.locator('laji-form .laji-form').waitFor({ state: 'visible' });
        await page.goBack();

        expect(page.locator('.haseka-home'), 'user wasn\'t on vihko page after back navigation').toBeVisible();
        expect(await getLang(page)).toBe('en');
      });
    });

    test('and has simple option and has category, canceling document save redirects to save observations page and keeps lang if no history', async ({ page }) => {
      await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_CATEGORY, undefined, 'en'));
      //await projectFormPage.navigateTo(FORM_WITH_SIMPLE_HAS_CATEGORY, undefined, 'en');

      await page.locator('laji-form-footer .btn-danger').click(); // cancel
      // await projectFormPage.documentFormView.$cancel.click();

      expect(page.locator('.survey-box')).toBeVisible();
      //expect (await saveObservationsPage.pageIsDisplayed()).toBe(true);

      expect(await getLang(page)).toBe('en');
      //expect(await nav.getLang()).toBe('en');
    });

    test.describe('and has mobile option,', () => {
      test.describe.configure({ mode: 'serial' });
      let page: Page;

      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await login(page);
      });

      test.beforeEach(async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_MOBILE, undefined, 'en'));
      });

      test('shows terms', async () => {
        expect(page.locator('laji-project-form-terms')).toBeVisible();
      });

      test('terms can be accepted', async () => {
        await page.locator('laji-project-form-terms button').click(); // accept terms
        expect(page.locator('laji-project-form-terms')).not.toBeVisible();
      });

      test('displays about page', async () => {
        expect(page.locator('laji-about')).toBeVisible();
      });

      test('doesn\'t display sidebar', async () => {
        expect(page.locator('.sidebar')).not.toBeVisible();
      });

      test('use button goes to document form page with correct lang', async () => {
        await page.locator('.lu-btn.primary').click(); // about page use button
        expect(page.locator('laji-project-form-form')).toBeVisible();
        expect(await getLang(page)).toBe('en');
      });

      test('canceling document save redirects to about page and keeps lang if no history', async () => {
        if (process.env.HEADLESS  !== 'false') {
          // TODO: remove this if it works in headless?
          // do we ever run headless?
          // seems pretty hard to do check for headless in playwright
          console.log('Skipped since geocoding doesn\'t work on headless');
          return;
        }
        // await this.imageModal.$cancel.click();
        await page.locator('.media-add-modal .cancel').click();

        //await browser.wait(EC.visibilityOf(this.mapModal.$cancel));
        // await this.mapModal.$cancel.click();
        await page.locator('.floating-buttons-container button').last().click();

        // await mobileFormPage.documentFormView.$cancel.click();
        await page.locator('laji-form-footer .btn-danger').click();

        expect(page.locator('laji-about')).toBeVisible();
        expect(await getLang(page)).toBe('en');
      });
    });

    test.describe('and doesn\'t have simple option,', () => {
      test.describe.configure({ mode: 'serial' });
      let page: Page;

      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await login(page);
      });

      test.beforeEach(async () => {
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, undefined, 'en'));
      });

      test('displays about page', async () => {
        expect(page.locator('laji-about')).toBeVisible();
      });

      test('displays sidebar', async () => {
        expect(page.locator('.sidebar')).toBeVisible();
      });

      test('canceling document save redirects to about page and keeps lang if no history', async () => {
        // await projectFormPage.navigateTo(`${FORM_NO_SIMPLE_NO_NAMED_PLACES}/form`, undefined, 'en');
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, '/form', 'en'));

        // await projectFormPage.documentFormView.$cancel.click();
        await page.locator('laji-form-footer .btn-danger').click();

        // expect(await projectFormPage.hasAboutText()).toBe(true);
        expect(page.locator('laji-about')).toBeVisible();
        expect(await getLang(page)).toBe('en');
      });

      test.describe(', and has multiple forms', () => {
        test('navigating to doc without subform specified redirects to subform', async () => {
          const form = FORM_MULTIPLE_FORMS_OWN_SUBMISSONS;
          const doc = FORM_MULTIPLE_FORMS_OWN_SUBMISSONS_DOC;
          await page.goto(getProjectFormUrl(`${form}/form/${doc}`, undefined, 'en'));
          expect(page.url).toMatch(`/${form}/form/${form}/${doc}`);
        });

        test('saving doc when no history goes to submissions page', async () => {
          // await this.$save.click();
          await page.locator('laji-form-footer .btn-success').click();
          //await browser.wait(EC.invisibilityOf(this.$blockingLoader));
          await page.locator('.laji-form.blocking-loader').waitFor({ state: 'hidden' });

          // expect(await isDisplayed(projectFormPage.submissionsPage.$container)).toBe(true);
          expect(page.locator('laji-submissions')).toBeVisible();
        });
      });

      test.describe('and has allowTemplates option', () => {
        test.describe.configure({ mode: 'serial' });
        let page: Page;

        test.beforeAll(async ({ browser }) => {
          page = await browser.newPage();
          await page.goto(getProjectFormUrl(FORM_ALLOW_TEMPLATES, undefined, 'en'))
        });

        test('has clickable template link in sidebar', async () => {
          const templateLink = page.locator('[href$="/templates"]');
          expect(templateLink).toBeVisible();
          await templateLink.click();
        })

        test('displays submissions table', async () => {
          expect(page.locator('laji-own-datatable')).toBeVisible();
        });

        const firstRow = page.locator('laji-own-datatable datatable-row-wrapper').first();

        test('at least one template shown', async () => {
          expect(firstRow).toBeVisible();
        });

        test('displays template button', async () => {
          expect(firstRow.locator('.template-button')).toBeVisible();
        });

        test('displays delete button', async () => {
          expect(firstRow.locator('.delete-button')).toBeVisible();
        });

        test('displays only two buttons', async () => {
          expect(await firstRow.locator('.btn').count()).toBe(2);
        });

        test('template button directs to form page', async () => {
          await firstRow.locator('.template-button').click();
          expect(page.locator('laji-project-form-form')).toBeVisible();
        });
      });
    });
  });

  test.describe('and has named places and strict access restriction and no form permission', () => {
    test('/form page redirects to about and keeps lang', async ({ page }) => {
      await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION_NO_PERMISSION, '/form', 'en'));
      expect(page.locator('laji-about')).toBeVisible();
      expect(await getLang(page)).toBe('en');
    });
  });

  test('disabled form is displayed as disabled', async ({ page }) => {
    await page.goto(getProjectFormUrl(FORM_DISABLED));
    expect(page.locator('laji-project-form-disabled')).toBeVisible();
    expect(page.locator('.sidebar')).not.toBeVisible();
  });
});

