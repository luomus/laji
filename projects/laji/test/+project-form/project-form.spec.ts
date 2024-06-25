import test, { Page, expect, Locator } from '@playwright/test';
import { expectToBeOnLajiAuthLogin, lajiAuthLogin, loginWithPermanentToken } from '../+user/user.po';

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

type Lang = 'fi' | 'en' | 'sv';

export const getAddressWithLang = (page: string, lang?: Lang): string =>
  ((lang && lang !== 'fi') ? '/' + lang : '') + page;
const getProjectFormUrl = (id: string, subPage = '', lang?: Lang) =>
  getAddressWithLang(`/project/${id}${subPage}`, lang);

const expectLangToBe = async (lang: Lang, page: Page) => {
  await expect(page.locator('.language-toggle span')).toHaveText(new RegExp(lang, 'i'));
};

test.describe('Project form', () =>  {
  test.describe('when logged out', () => {
    test.describe.configure({ mode: 'serial' });
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      await page.goto('/');
    });

    test.describe('and has named places and no access restriction', () => {
      test('/form page redirects to named places view', async () => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_NO_ACCESS_RESTRICTION, '/form'));
        await expect(page.locator('laji-named-places')).toBeVisible();
      });
    });
    test.describe('and has named places and loose access restriction', () => {
      test('/form page redirects to named places view', async () => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_LOOSE_ACCESS_RESTRICTION, '/form'));
        await expect(page.locator('laji-named-places')).toBeVisible();
      });
    });
    test.describe('and has named places and strict access restriction', () => {
      test.skip('/form page redirects to login', async () => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION, '/form'));
        await expectToBeOnLajiAuthLogin(page);
      });
    });
    test.describe('and has simple option,', () => {
      test('form page redirects to login', async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_NO_CATEGORY));
        await expectToBeOnLajiAuthLogin(page);
      });
    });

    test.describe('and has mobile option,', () => {
      test.beforeEach(async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_MOBILE));
      });

      test('doesn\'t display terms', async () => {
        await expect(page.locator('laji-project-form-terms')).toBeHidden();
      });

      test('shows login button', async () => {
        await expect(page.locator('.login-button')).toBeVisible();
      });

      test('navigating to /form redirects to login', async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_NO_CATEGORY, '/form'));
        await expectToBeOnLajiAuthLogin(page);
      });
    });

    test.describe('not simple not mobile no places no multiform', () => {
      test('/form page redirects to login', async () => {
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, '/form'));
        await expectToBeOnLajiAuthLogin(page);
      });

      test.skip('after login is on form page', async () => {
        await lajiAuthLogin(page);
        await expect(page.locator('laji-project-form-form')).toBeVisible({timeout: 15000});
      });
    });

    test('disabled form is displayed as disabled', async () => {
      await page.goto(getProjectFormUrl(FORM_DISABLED));
      await expect(page.locator('laji-project-form-disabled')).toBeVisible();
      await expect(page.locator('.sidebar')).toBeHidden();
    });
  });

  test.describe('when logged in', () => {
    test.describe.configure({ mode: 'serial' });
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      await loginWithPermanentToken(page);
    });

    test.describe('and has simple option,', () => {
      test.beforeEach(async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_NO_CATEGORY, undefined, 'en'));
      });

      test.skip('displays form', async () => {
        await expect(page.locator('laji-form .laji-form')).toBeVisible();
      });

      test('doesn\'t display sidebar', async () => {
        await expect(page.locator('.sidebar')).toBeHidden();
      });

      test('and has no category, canceling document save redirects to Vihko home page if no history and keeps lang', async () => {
        await page.locator('laji-form-footer .btn-danger').click(); // cancel
        await expect(page.locator('.haseka-home')).toBeVisible();
        await expectLangToBe('en', page);
      });

      test.skip('back navigate navigates away from form and keeps lang', async () => {
        await page.goto(getAddressWithLang('/vihko/home', 'en'));
        await page.locator(
          `[href="${getAddressWithLang(`/project/${FORM_WITH_SIMPLE_HAS_NO_CATEGORY}`, 'en')}"]`
        ).click();

        await page.locator('laji-form .laji-form').waitFor({ state: 'visible' });
        await page.goBack();

        await expect(page.locator('.haseka-home'), 'user wasn\'t on vihko page after back navigation').toBeVisible();
        await expectLangToBe('en', page);
      });
    });

    test.skip('and has simple option and has category, canceling document save redirects to save observations page and keeps lang if no history', async () => {
      await page.goto(getProjectFormUrl(FORM_WITH_SIMPLE_HAS_CATEGORY, undefined, 'en'));
      await page.locator('laji-form-footer .btn-danger').click(); // cancel

      await expect(page.locator('.survey-box').first()).toBeVisible();
      await expectLangToBe('en', page);
    });

    test.describe('and has mobile option,', () => {
      test.beforeAll(async () => {
        await page.goto(getProjectFormUrl(FORM_WITH_MOBILE, undefined, 'en'));
      });

      test('shows terms', async () => {
        await expect(page.locator('laji-project-form-terms .use-button')).toBeVisible();
      });

      test('terms can be accepted', async () => {
        await page.locator('laji-project-form-terms .use-button').click(); // accept terms
        await expect(page.locator('laji-project-form-terms .use-button')).toBeHidden();
      });

      test('displays about page', async () => {
        await expect(page.locator('laji-about')).toBeVisible();
      });

      test('doesn\'t display sidebar', async () => {
        await expect(page.locator('.sidebar')).toBeHidden();
      });

      test.skip('use button goes to document form page with correct lang', async () => {
        await page.locator('.use-button').click();
        await expect(page.locator('laji-project-form-form')).toBeVisible();
        await expectLangToBe('en', page);
      });

      test.skip('canceling document save redirects to about page and keeps lang if no history', async () => {
        await page.locator('.media-add-modal .cancel').click();
        await page.locator('.floating-buttons-container button').last().click();
        await page.locator('laji-form-footer .btn-danger').click();

        await expect(page.locator('laji-about')).toBeVisible();
        await expectLangToBe('en', page);
      });
    });

    test.describe('and doesn\'t have simple option,', () => {
      test.beforeAll(async () => {
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, undefined, 'en'));
      });

      test('displays about page', async () => {
        await expect(page.locator('laji-about')).toBeVisible();
      });

      test('displays sidebar', async () => {
        await expect(page.locator('.sidebar')).toBeVisible();
      });

      test('canceling document save redirects to about page and keeps lang if no history', async () => {
        await page.goto(getProjectFormUrl(FORM_NO_SIMPLE_NO_NAMED_PLACES, '/form', 'en'));
        await page.locator('laji-form-footer .btn-danger').click();

        await expect(page.locator('laji-about')).toBeVisible();
        await expectLangToBe('en', page);
      });

      test.describe(', and has multiple forms', () => {
        test.skip('navigating to doc without subform specified redirects to subform', async () => {
          const form = FORM_MULTIPLE_FORMS_OWN_SUBMISSONS;
          const doc = FORM_MULTIPLE_FORMS_OWN_SUBMISSONS_DOC;
          await page.goto(getProjectFormUrl(`${form}/form/${doc}`, undefined, 'en'));
          await expect(page).toHaveURL(new RegExp(`.*\/${form}\/form\/${form}\/${doc}`));
        });

        test.skip('saving doc when no history goes to submissions page', async () => {
          await page.goto(getProjectFormUrl(`${FORM_MULTIPLE_FORMS_OWN_SUBMISSONS}/form/${FORM_MULTIPLE_FORMS_OWN_SUBMISSONS_DOC}`, undefined, 'en'));
          await page.locator('laji-form-footer .btn-success').click();
          await page.locator('.laji-form.blocking-loader').waitFor({ state: 'hidden' });

          await expect(page.locator('laji-submissions')).toBeVisible();
        });
      });

      test.describe('and has allowTemplates option', () => {
        let firstRow: Locator;
        test.beforeAll(async () => {
          await page.goto(getProjectFormUrl(FORM_ALLOW_TEMPLATES, undefined, 'en'));
          firstRow = page.locator('laji-own-datatable datatable-row-wrapper').first();
        });

        test('has clickable template link in sidebar', async () => {
          const templateLink = page.locator('[href$="/templates"]');
          await expect(templateLink).toBeVisible();
          await templateLink.click();
        });

        test('displays submissions table', async () => {
          await expect(page.locator('laji-own-datatable')).toBeVisible();
        });

        test('at least one template shown', async () => {
          await expect(firstRow).toBeVisible();
        });

        test('displays template button', async () => {
          await expect(firstRow.locator('.template-button')).toBeVisible();
        });

        test('displays delete button', async () => {
          await expect(firstRow.locator('.delete-button')).toBeVisible();
        });

        test('displays only two buttons', async () => {
          expect(await firstRow.locator('.btn').count()).toBe(2);
        });

        test.skip('template button directs to form page', async () => {
          await firstRow.locator('.template-button').click();
          await expect(page.locator('laji-project-form-form')).toBeVisible({timeout: 15000});
        });
      });
    });

    test.describe('and has named places and strict access restriction and no form permission', () => {
      test('/form page redirects to about and keeps lang', async () => {
        await page.goto(getProjectFormUrl(FORM_NAMED_PLACES_STRICT_ACCESS_RESTRICTION_NO_PERMISSION, '/form', 'en'));
        await expect(page.locator('laji-about')).toBeVisible();
        await expectLangToBe('en', page);
      });
    });
  });

  test('disabled form is displayed as disabled', async ({ page }) => {
    await page.goto(getProjectFormUrl(FORM_DISABLED));
    await expect(page.locator('laji-project-form-disabled')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeHidden();
  });
});

