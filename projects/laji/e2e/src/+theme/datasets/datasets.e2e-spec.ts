import { UserPage } from "../../+user/user.po";
import { DatasetsPage } from "./datasets.po";
import { isDisplayed } from "../../../helper";
import { ProjectFormPage } from "../../+project-form/project-form.po";

const userPage = new UserPage();
const datasetsPage = new DatasetsPage();
const projectFormPage = new ProjectFormPage();

describe('Datasets page', () => {
  beforeAll(async (done) => {
    await datasetsPage.navigateTo();
    await userPage.login();
    done();
  });

  it('displays cms content', async (done) => {
    await datasetsPage.waitForCMS();
    expect(await isDisplayed(datasetsPage.$cmsContent)).toBe(true, 'CMS content wasn\'t displayed');
    done();
  });

  it('displays links to datasets', async (done) => {
    await datasetsPage.waitForDatasets();
    expect(await datasetsPage.$datasetLinks.count()).toBeGreaterThan(0, 'No dataset links were displayed');
    done();
  });

  it('navigating to dataset link lands on project form page', async (done) => {
    await datasetsPage.$datasetLinks.first().click();
    expect(await projectFormPage.hasAboutText()).toBe(true);
    done();
  });
});
