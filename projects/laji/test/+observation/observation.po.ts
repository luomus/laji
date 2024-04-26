// eslint-disable-next-line max-classes-per-file
import { Locator, Page } from '@playwright/test';
import { MapPageObject, PointTraveller, SAFE_CLICK_WAIT } from '@luomus/laji-map/test-export/test-utils';
import { ToastPO } from '../shared/toast';

class LUTabPO {
  private page: Page;
  private className: string;
  constructor(page: Page, name: string) {
    this.page = page;
    this.className = `obs-filter-${name}`;
  }
  isActive = async () => (await this.page.locator(`.${this.className}`).getAttribute('class')).includes('active');
}

class LUPanel {
  page: Page;
  locatorName: string;
  constructor(page: Page, locatorName: string) {
    this.page = page;
    this.locatorName = locatorName;
  }

  async open() {

    await this.page.locator(this.locatorName).click();
    await this.page.waitForSelector(`${this.locatorName} .is-open`);
  }

  isOpen() {
    return this.page.locator(`${this.locatorName} .is-open`).isVisible();
  }
}

class DatePicker {
  public $container: Locator;

  calendar = {
    toggle: async () => await this.$container.locator('.calendar-toggle').click(),
    $getContainer: () => this.$container.locator('.ng-datepicker'),
    getDate: () => this.calendar.$getContainer().locator('.date'),
    getYear: async () => (await this.calendar.$getContainer().locator('.date').textContent()).match(/\d+/)[0],
    getMonth: async () => (await this.calendar.$getContainer().locator('.date').textContent()).match(/[^ ]+/)[0],
    selectToday: async () => {
      await this.$container.locator('.today').scrollIntoViewIfNeeded();
      await this.$container.locator('.today').click();
    }
  };

  constructor(page: Page, locator: string) {
    this.$container = page.locator(locator);
  }

  async type(date: string) {
    await this.$container.locator('input').fill(date);
    await this.$container.locator('input').press('Tab');
  }

  getInputValue() {
    return this.$container.locator('input').getAttribute('value');
  }

  async clear() {
    return await this.$container.locator('.clear').click();
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
  public map = new MapPageObject(this.page, this.page.getByTestId('observation-map'));
  public tabs: Record<string, LUTabPO> = {
    list: new LUTabPO(this.page, 'list'),
    map: new LUTabPO(this.page, 'map')
  };

  public $occurrenceCountFinlandMax: Locator = this.page.locator('input[name=occurrenceCountFinlandMax]');

  public timePanel = new LUPanel(this.page, '.laji-panel-time');
  public dateBegin = new DatePicker(this.page, '.observation-time-container laji-datepicker.time-start');
  public dateEnd = new DatePicker(this.page, '.observation-time-container laji-datepicker.time-end');
  public $today = this.page.locator('.btn-today');
  public $week = this.page.locator('.btn-week');
  public $year = this.page.locator('.btn-year');

  public placePanel = new LUPanel(this.page, '.laji-panel-places');
  public $placePanel = this.page.locator('.laji-panel-places');
  public $drawRectangleBtn = this.page.locator('.draw-rectangle');
  public $enterYkjBtn = this.page.locator('.enter-ykj-grid');
  public $drawPolygonBtn = this.page.locator('.draw-polygon');
  public $coordinateIntersectMinBtn = this.page.locator('.coordinate-intersect-min');
  public $coordinateIntersectMaxBtn = this.page.locator('.coordinate-intersect-max');
  public $mapSpinner = this.page.locator('.loading-map');
  public $searchBtn = this.page.locator('.observation-search-btn');

  private $activeFiltersBtn = this.page.locator('.active-filters-btn');
  private toast = new ToastPO(this.page);
  private hasGraphQLApiErrors = false;

  constructor(public page: Page) {
    this.page.on('response', res => {
      if (res.url().match(/.*api\/graphql.*/) && [400].includes(res.status())) {
        this.hasGraphQLApiErrors = true;
      }
    });
  }

  pageHasGraphQLApiErrors(): boolean {
    return this.hasGraphQLApiErrors;
  }

  async navigateTo(sub: 'list' | '' = '', query?: Record<string, string>) {
    await this.page.goto(`observation/${sub}?${new URLSearchParams(query || {}).toString()}`);
  }

  async navigateToViewWithAllFilters() {
    await this.page.goto(this.pathWithAllFilters);
  }

  async search() {
    await this.toast.closeAll();
    if (await this.page.locator('.observation-search-btn').isVisible()) {
      await this.page.locator('.observation-search-btn').click();
    }
  }

  async drawRectangle() {
    await this.map.drag([0, 0], [10, 10]);
  }

  async updateCoordinateIntersectControlValue(value: number) {
    await this.page.locator('input[name=coordinatesIntersection]').fill((value * 100).toString());
    await this.page.locator('input[name=coordinatesIntersection]').press('Tab');
  }

  async zoomClose() {
    const $geosearch = this.page.locator('.leaflet-control-geosearch');
    await $geosearch.click();
    await $geosearch.locator('input').pressSequentially('luomus');
    await this.page.locator('.results').first().click();
  }

  async drawPolygon() {
    const traveller = new PointTraveller();
    const coordinates: [number, number][] = [
      traveller.travel(0, 0),
      traveller.travel(0, -100),
      traveller.travel(100, 0),
      traveller.initial()
    ];

    for (const c of coordinates) {
      await this.page.waitForTimeout(SAFE_CLICK_WAIT);
      await this.map.clickAt(...c);
    }
  }

  private async getPolygonFilter() {
    const url = new URL(this.page.url());
    return url.searchParams.get('polygonId');
  }

  async hasPolygonFilter() {
    return !!(await this.getPolygonFilter())?.match(/^\d+$/);
  }

  async getPolygonIntersect() {
    return +(await this.getPolygonFilter()).split(':').pop();
  }

  async opensYKJModal() {
    return this.map.controls.coordinateInput.$container;
  }

  async enterYKJToOpenedModal() {
    const control = this.map.controls.coordinateInput;
    await control.enterLatLng(666, 333);
    await control.$submit.click();
  }

  async removeFromActiveFilters(field: string) {
    await this.$activeFiltersBtn.click();
    await this.page.locator(`#observation-active-${field}-remove-btn`).click();
  }
}
