import { browser, $, ExpectedConditions } from 'protractor';

const EC = ExpectedConditions;

export class DatasetsPage {
  navigateTo = () => browser.get('/theme/datasets');
  waitForCMS = () => browser.wait(EC.visibilityOf(this.$cmsContent));
  waitForDatasets = () => browser.wait(EC.visibilityOf(this.$datasetsContainer));
  $cmsContent = $('.laji-page');
  $datasetsContainer = $('.dataset-items');
  $datasetLinks = this.$datasetsContainer.$$('a');
}
