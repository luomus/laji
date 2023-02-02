// eslint-disable-next-line max-classes-per-file
import { $, browser, ElementFinder, protractor } from 'protractor';
import { EC, isDisplayed, waitForInvisibility } from '../../helper';
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
    await browser.wait(EC.visibilityOf($(`${this.locator} .is-open`)));
  }

  isOpen() {
    return isDisplayed($(`${this.locator} .is-open`));
  }
}

class DatePicker {
  public $container: ElementFinder;

  calendar = {
    toggle: () => this.$container.$('.calendar-toggle').click(),
    $getContainer: () => this.$container.$('.ng-datepicker'),
    getYear: async () => (await this.calendar.$getContainer().$('.date').getText()).match(/\d+/)[0],
    getMonth: async () => (await this.calendar.$getContainer().$('.date').getText()).match(/[^ ]+/)[0],
    selectToday: () => this.$container.$('.today').click()
  }

  constructor(locator: string) {
    this.$container = $(locator);
  }

  type(date: string) {
   return this.$container.$('input').sendKeys(date, protractor.Key.TAB);
  }

  getInputValue() {
    return this.$container.$('input').getAttribute('value');
  }

  clear() {
    return this.$container.$('.clear').click();
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

  public timePanel = new LUPanel('.laji-panel-time');
  public dateBegin = new DatePicker('.observation-time-container laji-datepicker[name="timeStart"]');
  public dateEnd = new DatePicker('.observation-time-container laji-datepicker[name="timeEnd"]');
  public $today = $('.btn-today');
  public $week = $('.btn-week');
  public $year = $('.btn-year');

  public placePanel = new LUPanel('.laji-panel-places');
  public $placePanel = $('.laji-panel-places');
  public $drawRectangleBtn = $('.draw-rectangle');
  public $enterYkjBtn = $('.enter-ykj-grid');
  public $drawPolygonBtn = $('.draw-polygon');
  public $coordinateIntersectMinBtn = $('.coordinate-intersect-min');
  public $coordinateIntersectMaxBtn = $('.coordinate-intersect-max');

  async navigateTo(sub: 'list' | '' = '', query?: Record<string, string>) {
    await browser.get(`observation/${sub}?${new URLSearchParams(query || {}).toString()}`);
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

  async updateCoordinateIntersectControlValue(value: number) {
    await $('input[name=coordinatesIntersection]').sendKeys(value * 100);
    await $('input[name=coordinatesIntersection]').sendKeys(protractor.Key.TAB);
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

  async drawPolygon() {
    const traveller = new PointTraveller();
    const coordinates: [number, number][] = [
      traveller.travel(0, 0),
      traveller.travel(0, -20),
      traveller.travel(20, 0),
      traveller.initial()
    ];

    for (const c of coordinates) {
      await browser.sleep(SAFE_CLICK_WAIT);
      await this.map.clickAt(...c);
    }
  }

  private async getPolygonFilter() {
    const url = new URL(await browser.getCurrentUrl());
    return url.searchParams.get('polygonId');
  }

  async hasPolygonFilter() {
    return !!(await this.getPolygonFilter())?.match(/^\d+:(0|1)(\.\d)?$/);
  }

  async getPolygonIntersect() {
    return +(await this.getPolygonFilter()).split(':').pop();
  }

  async opensYKJModal() {
    return this.map.getCoordinateInputControl().$getContainer();
  }


  async enterYKJToOpenedModal() {
    const control = this.map.getCoordinateInputControl();
    await control.enterLatLng(666, 333);
    await control.$getSubmit().click();
  }

  private async getTimeFilter() {
    const url = new URL(await browser.getCurrentUrl());
    return url.searchParams.get('time') || '';
  }

  async getTimeStart() {
    return (await this.getTimeFilter()).match(/^([^/]+)\//)?.[1] || '';
  }

  async getTimeEnd() {
    return (await this.getTimeFilter()).match(/\/(.+)$/)?.[1] || '';
  }
}
