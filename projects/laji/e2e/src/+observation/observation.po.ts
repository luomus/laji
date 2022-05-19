// eslint-disable-next-line max-classes-per-file
import { $, browser, ElementFinder, protractor } from 'protractor';
import { EC, waitForInvisibility } from '../../helper';
import { MapPageObject, PointTraveller, SAFE_CLICK_WAIT } from 'laji-map/test-export/test-utils';

class LUTabPO {
  private className: string;
  constructor(name: string) {
    this.className = `obs-filter-${name}`;
  }
  isActive = async () => (await $(`.${this.className}`).getAttribute('class')).includes('active');
}

class LUPanel {
  locator: string;
  $elem: ElementFinder;
  constructor(locator: string) {
    this.locator = locator;
    this.$elem = $(locator);
  }

  async open() {
    await this.$elem.click();
    await browser.wait(EC.visibilityOf($(`${this.locator}[ng-reflect-open="true"]`)));
  }
}

export class ObservationPage {
  private pathWithAllFilters = `observation/map?
    target=MX.29038&effectiveTag=INVASIVE_NO_EFFECT
    &informalTaxonGroupId=MVL.1161
    &administrativeStatusId=MX.finlex160_1997_appendix4_2021,MX.euInvasiveSpeciesList&redListStatusId=MX.iucnEX
    &countryId=ML.206&finnishMunicipalityId=ML.532&provinceId=ML.1245&elyCentreId=ML.1259&biogeographicalProvinceId=ML.251
    &area=asd&time=2022-01-01%2F&keyword=asd&collectionId=gbif-dataset:994fb34c-ba13-4768-a238-b1d3eb35c90d&typeOfOccurrenceId=MX.doesNotOccur
    &coordinates=63.250569:63.417915:25.523624:25.64792:WGS84:1&sourceId=KE.167,KE.3&recordBasis=PRESERVED_SPECIMEN&lifeStage=ADULT&sex=MALE
    &documentId=asd&recordQuality=EXPERT_VERIFIED&wild=WILD&teamMemberId=1795001&primaryHabitat=MKV.habitatM%5BMKV.habitatSpecificTypeV%5D
    &plantStatusCode=MY.plantStatusCodeL&sourceOfCoordinates=REPORTED_VALUE&finnish=true&invasive=false&typeSpecimen=true&hasDocumentMedia=true
    &hasGatheringMedia=true&hasUnitMedia=false&secured=true&unidentified=true&needsCheck=true&breedingSite=true&useIdentificationAnnotations=false
    &includeSubTaxa=false&annotated=true&individualCountMin=0&individualCountMax=1000&occurrenceCountFinlandMax=1000&coordinateAccuracyMax=1000
    &qualityIssues=BOTH&firstLoadedSameOrAfter=2022-01-01&loadedSameOrAfter=2022-01-01&season=0101%2F1218
  `;
  private spinners$ = $('laji-observation-result').$$('.spinner');
  public map = new MapPageObject();
  public tabs: Record<string, LUTabPO> = {
    map: new LUTabPO('map')
  };

  public placePanel = new LUPanel('.laji-panel-places');
  public $placePanel = $('.laji-panel-places');
  public $drawRectangleBtn = $('.draw-rectangle');
  public $enterYkjBtn = $('.enter-ykj-grid');
  public $coordinateIntersectMinBtn = $('.coordinate-intersect-min');
  public $coordinateIntersectMaxBtn = $('.coordinate-intersect-max');

  async navigateTo(sub: 'list' | '' = '') {
    await browser.get(`observation/${sub}`);
  }

  async navigateToViewWithAllFilters() {
    await browser.get(this.pathWithAllFilters);
  }

  async waitUntilLoaded() {
    for (const spinner$ of await this.spinners$) {
      await waitForInvisibility(spinner$);
    }
  }

  async hasGraphqlErrors() {
    const browserLog = await browser.manage().logs().get('browser');
    const badRequests = browserLog.filter(entry => entry.message.includes('api/graphql') && entry.message.includes('400'));
    return badRequests.length > 0;
  }

  async drawRectangle() {
    await this.map.drag([0, 0], [10, 10]);
  }

  private async getCoordinateFilter() {
    const url = new URL(await browser.getCurrentUrl());
    return url.searchParams.get('coordinates');
  }

  async hasWGS84CoordinatesFilter() {
    return !!(await this.getCoordinateFilter())?.match(/^(\d{2}\.\d+:){4,}WGS84:(0|1)(\.\d)?$/);
  }

  async hasYKjCoordinatesFilter() {
    return !!(await this.getCoordinateFilter())?.match(/^(\d{3,6}:){2}YKJ:(0|1)(\.\d)?$/);
  }

  async getCoordinateIntersect() {
    return +(await this.getCoordinateFilter()).split(':').pop();
  }

  async zoomClose() {
    const $geosearch = this.map.$getElement().$('.leaflet-control-geosearch');
    await $geosearch.click();
    await $geosearch.$('input').sendKeys('luomus');
    await browser.wait(EC.visibilityOf($geosearch.$('.results > div')));
    await $geosearch.$('input').sendKeys(protractor.Key.DOWN);
    await $geosearch.$('input').sendKeys(protractor.Key.ENTER);
    await browser.wait(EC.invisibilityOf($('.loading-map')));
  }

  async opensYKJModal() {
    return this.map.getCoordinateInputControl().$getContainer();
  }

  async enterYKJToOpenedModal() {
    const control = this.map.getCoordinateInputControl();
    await control.enterLatLng(666, 333);
    await control.$getSubmit().click();
  }
}
