import { browser, $ } from 'protractor';
import { ProjectFormPage } from './project-form.po';
import { UserPage } from '../+user/user.po';
import { ConfirmPO } from '../shared/dialogs.po';

const projectFormPage = new ProjectFormPage();
const userPage = new UserPage();
const confirmDialog = new ConfirmPO();

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
    expect(await projectFormPage.documentFormView.$openNamedPlaceLinker.isDisplayed()).toBe(true);
    done();
  });

  it('button open named places chooser np selector', async (done) => {
    await projectFormPage.documentFormView.$openNamedPlaceLinker.click();
    expect(await projectFormPage.namedPlaceLinker.namedPlacesView.$container.isDisplayed()).toBe(true);
    done();
  });

  it('named places chooser is readonly', async (done) => {
    expect(await projectFormPage.namedPlaceLinker.namedPlacesView.$addButton.isPresent()).toBe(false);

    await projectFormPage.namedPlaceLinker.namedPlacesView.$$listItems.first().click();
    expect(await projectFormPage.namedPlaceLinker.namedPlacesView.$editButton.isPresent()).toBe(false);
    expect(await projectFormPage.namedPlaceLinker.namedPlacesView.$deleteButton.isPresent()).toBe(false);
    done();
  });

  it('use button doesn\'t direct to form page but shows dialog for linking', async (done) => {
    await projectFormPage.namedPlaceLinker.namedPlacesView.$useButton.click();

    expect(await confirmDialog.$message.getText()).not.toBeFalsy();
    await confirmDialog.$cancel.click();
    done();
  });

  it('isn\'t shown if document is readonly', async (done) => {
    await projectFormPage.navigateTo(FORM_ID, `/form/${DOC_NO_NP_ID_FORM_HAS_NAMED_PLACES_NO_ACCESS}`);
    expect(await projectFormPage.documentFormView.$openNamedPlaceLinker.isPresent()).toBe(false, 'named place linker');
    done();
  });
});
