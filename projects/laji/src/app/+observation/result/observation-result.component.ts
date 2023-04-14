import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, OnChanges } from '@angular/core';
import { ObservationMapComponent } from '../../shared-modules/observation-map/observation-map/observation-map.component';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { VisibleSections } from '../view/observation-view.component';
import { ObservationDownloadComponent } from '../download/observation-download.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { SearchQueryService } from '../search-query.service';
import { LoadedElementsStore } from '../../../../../laji-ui/src/lib/tabs/tab-utils';
import { EMPTY } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute } from '@angular/router';
import { LajiMapDrawEvent, Rectangle } from '@laji-map/laji-map.interface';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { catchError, map } from 'rxjs/operators';
import { ToastsService } from '../../shared/service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import G from 'geojson';

const tabOrder = ['list', 'map', 'images', 'species', 'statistics', 'annotations', 'own'];
@Component({
  selector: 'laji-observation-result',
  templateUrl: './observation-result.component.html',
  styleUrls: ['./observation-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultComponent implements OnChanges {
  private _visible: VisibleSections = {
    finnish: true,
    countTaxa: true,
    countHits: true,
    map: true,
    list: true,
    images: true,
    species: true,
    statistics: true,
    download: true,
    annotations: true,
    own: true
  };
  @Input() set visible(v: VisibleSections) {
    this._visible = v;
    const tabs = Object.entries(v).filter(([key, val]) => val && tabOrder.includes(key)).map(([key, val]) => key);
    tabs.sort((a, b) => {
      const i = tabOrder.findIndex(name => name === a);
      const j = tabOrder.findIndex(name => name === b);
      if (i > j) { return 1; }
      if (i < j) { return -1; }
      return 0;
    });
    this.loadedTabs = new LoadedElementsStore(tabs);
  }
  get visible() { return this._visible; }
  @Input() skipUrlParameters: string[] = [
    'selected',
    'pageSize',
    'page'
  ];
  @Input() resultBase: 'unit'|'sample' = 'unit';
  @Input() basePath = '/observation';
  @Input() query: WarehouseQueryInterface = {};
  @Input() newQuery: WarehouseQueryInterface = {};
  @Input() lgScreen = true;
  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() loadingUnits: boolean;
  @Input() loadingTaxa: boolean;
  @Input() lang: string;
  @Input() listSettings: ISettingResultList;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() newQueryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() listSettingsChange = new EventEmitter<ISettingResultList>();

  @ViewChild(ObservationMapComponent) observationMap: ObservationMapComponent;
  @ViewChild(ObservationDownloadComponent, { static: true }) downloadModal: ObservationDownloadComponent;

  /**
   * Prevent re-fetching data by keeping loaded pages in memory
   */
  mode: 'all' | 'finnish' = 'all';
  loadedModes: LoadedElementsStore = new LoadedElementsStore(['all', 'finnish']);

  activeTab = 'list';
  loadedTabs: LoadedElementsStore = new LoadedElementsStore(tabOrder);

  hasMonthDayData: boolean;
  hasYearData: boolean;
  hasTaxonData: boolean;

  selectedTabIdx = 0; // stores which tab index was provided by @Input active
  onlyCount = this.storage.retrieve('onlycount') === null ? true : this.storage.retrieve('onlycount');

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private searchQueryService: SearchQueryService,
    private storage: LocalStorageService,
    private route: ActivatedRoute,
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private toastsService: ToastsService,
    private translate: TranslateService
  ) { }

  @Input()
  set active(value) {
    if (value === 'finnish') {
      this.mode = 'finnish';
      this.loadedModes.load('finnish');
    } else {
      this.mode = 'all';
      this.loadedModes.load('all');
      this.activeTab = value;
      this.loadedTabs.load(value);
      this.selectedTabIdx = this.loadedTabs.getIdxFromName(value);
    }
  }

  onSelect(tabIndex: number) {
    const tabName = this.loadedTabs.getNameFromIdx(tabIndex);
    this.router.navigate(
      this.localizeRouterService.translateRoute([this.basePath, tabName]), {
        // Query object should not be but directly to the request params! It can include person token and we don't want that to be visible!
        queryParams: this.searchQueryService.getQueryObject(this.query, ['selected', 'pageSize', 'page'])
      }
    );
  }

  ngOnChanges() {
    const queryParams = this.route.snapshot.queryParams;

    const hasQueryParams = Object.keys(queryParams).length > 0;
    const ownTabVisible = queryParams['editorOrObserverPersonToken'] || queryParams['observerPersonToken'] || queryParams['editorPersonToken'];

    if ((!this.activeTab && hasQueryParams) || (this.activeTab === 'own' && !ownTabVisible)) {
      this.onSelect(0);
    }
  }

  reloadTabs() {
    this.loadedTabs.reset();
    this.loadedTabs.load(this.activeTab);
  }

  pickLocation(events: LajiMapDrawEvent[]) {
    let value: Pick<WarehouseQueryInterface, 'coordinates' | 'polygonId'>;

    events.forEach(e => {
      let geometry: G.Geometry, layer: any;
      if (e.type === 'create') {
        geometry = e.feature.geometry;
        layer = e.layer;
      } else if (e.type === 'edit') {
        const keys = Object.keys(e.features);
        if (keys.length > 1) {
          throw new Error('Something wrong with map, there should never be multiple editable geometries');
        }
        geometry = e.features[keys[0]].geometry;
        layer = e.layers[keys[0]];
      } else if (e.type === 'delete') {
        if (e.features.length === 1) {
          this.newQueryChange.emit({ ...this.newQuery, coordinates: this.query.coordinates, polygonId: this.query.polygonId });
        } else if (e.features.length > 1) {
          throw new Error('Something wrong with map, there should never be multiple deletable geometries');
        }
        return;
      } else {
        return;
      }

      const {coordinateVerbatim} = (geometry as any);
      if (coordinateVerbatim) {
        value = {
          coordinates: [coordinateVerbatim + ':YKJ'],
          polygonId: undefined
        };
      } else if (geometry.type === 'Polygon') {
        if (layer instanceof Rectangle) {
          value = {
            coordinates: [
              geometry.coordinates[0][0][1] + ':' + geometry.coordinates[0][2][1] + ':' +
              geometry.coordinates[0][0][0] + ':' + geometry.coordinates[0][2][0] + ':WGS84'
            ],
            polygonId: undefined
          };
        } else {
          this.registerPolygon$(geometry).subscribe(id => {
            this.newQueryChange.emit({ ...this.newQuery, polygonId: id, coordinates: undefined });
          });
        }
      } else {
        value = { coordinates: undefined, polygonId: undefined };
      }
    });

    if (value) {
      this.newQueryChange.emit({ ...this.newQuery, ...value });
    }
  }

  registerPolygon$(polygon: G.Polygon) {
    return this.warehouseApi.registerPolygon(polygon, this.userService.getToken(), 'WGS84').pipe(
      map((response: any) => '' + response.id),
      catchError(e => {
        const error = e.error?.error;
        const {message, localizedMessage} = error;
        if (error.status >= 400 && message || localizedMessage) {
          const localizedError = localizedMessage?.[this.translate.currentLang];
          this.toastsService.showError(localizedError ?? message);
          return EMPTY;
        } else {
          throw e;
        }
      })
    );
  }

  openDownloadModal() {
    this.downloadModal.openModal();
  }

  toggleOnlyCount() {
    this.onlyCount = !this.onlyCount;
    this.storage.store('onlycount', this.onlyCount);
  }

}
