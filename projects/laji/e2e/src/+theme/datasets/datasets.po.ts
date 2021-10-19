import { browser, $, ExpectedConditions } from 'protractor';

const EC = ExpectedConditions;

export class DatasetsPage {
  navigateTo = () => browser.get('/theme/datasets');
  $cmsContent = $('.laji-page');
  $datasetsContainer = $('.dataset-items');
  $datasetLinks = this.$datasetsContainer.$$('a');
}
