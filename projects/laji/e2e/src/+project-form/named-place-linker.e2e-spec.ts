import { browser, $ } from 'protractor';
import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { scrollIntoView } from '../../helper';

const projectFormPage = new ProjectFormPage();
const userPage = new UserPage();

const FORM_ID = 'MHL.45';
const DOC_NO_NP_ID_FORM_HAS_NAMED_PLACES = 'JX.185344';
const DOC_NO_NP_ID_FORM_HAS_NAMED_PLACES_NO_ACCESS = 'JX.185280';

describe('Named place linker', () => {

  beforeAll(async (done) => {
    await browser.waitForAngularEnabled(false);
    await projectFormPage.navigateTo(FORM_ID, `/form/${DOC_NO_NP_ID_FORM_HAS_NAMED_PLACES}`);
    if (await userPage.isOnExternalLoginPage()) {
      await userPage.doExternalLogin();
    }
    await browser.waitForAngularEnabled(true);
    done();
  });

  it('is displayed for document without named place when form uses named places', async (done) => {
    expect(await projectFormPage.documentFormView.namedPlaceLinker.$container.isDisplayed()).toBe(true);
    done();
  });

  it('button open named places chooser np selector', async (done) => {
    await projectFormPage.documentFormView.namedPlaceLinker.$openModalButton.click();
    expect(await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$container.isDisplayed()).toBe(true);
    done();
  });

  it('named places chooser is readonly', async (done) => {
    expect(await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$addButton.isPresent()).toBe(false);

    await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$$listItems.first().click();
    expect(await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$editButton.isPresent()).toBe(false);
    expect(await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$deleteButton.isPresent()).toBe(false);
    done();
  });

  it('use button doesn\'t direct to form page but shows dialog for linking', async (done) => {
    await projectFormPage.documentFormView.namedPlaceLinker.namedPlacesView.$useButton.click();

    expect(await browser.switchTo().alert().getText()).not.toBeFalsy();
    await browser.switchTo().alert().dismiss();
    done();
  });

  it('isn\'t shown if document is readonly', async (done) => {
    await projectFormPage.navigateTo(FORM_ID, `/form/${DOC_NO_NP_ID_FORM_HAS_NAMED_PLACES_NO_ACCESS}`);
    expect(await projectFormPage.documentFormView.namedPlaceLinker.$openModalButton.isPresent()).toBe(false, 'named place linker ');
    done();
  });
});
