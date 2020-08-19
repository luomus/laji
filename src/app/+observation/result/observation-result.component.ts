import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild,
OnInit, ChangeDetectorRef, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import { ObservationMapComponent } from '../../shared-modules/observation-map/observation-map/observation-map.component';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { VisibleSections } from '../view/observation-view.component';
import { ObservationDownloadComponent } from '../download/observation-download.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { SearchQueryService } from '../search-query.service';
import { LoadedElementsStore } from '../../../../projects/laji-ui/src/lib/tabs/tab-utils';
import { Subscription } from 'rxjs';
import {LocalStorageService} from 'ngx-webstorage';
import { ActivatedRoute } from "@angular/router";

const tabOrder = ['list', 'map', 'images', 'species', 'statistics', 'annotations', 'own'];
@Component({
  selector: 'laji-observation-result',
  templateUrl: './observation-result.component.html',
  styleUrls: ['./observation-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultComponent implements OnInit, OnChanges {
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
  @Input() lgScreen = true;
  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() loadingUnits: boolean;
  @Input() loadingTaxa: boolean;
  @Input() lang: string;
  @Input() listSettings: ISettingResultList;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() listSettingsChange = new EventEmitter<ISettingResultList>();

  @ViewChild(ObservationMapComponent) observationMap: ObservationMapComponent;
  @ViewChild(ObservationDownloadComponent, { static: true }) downloadModal: ObservationDownloadComponent;

  /**
   * Prevent re-fetching data by keeping loaded pages in memory
   */
  mode: 'all' | 'finnish' = 'all';
  loadedModes: LoadedElementsStore = new LoadedElementsStore(['all', 'finnish']);

  lastTabActive = 'list';
  loadedTabs: LoadedElementsStore = new LoadedElementsStore(tabOrder);

  hasMonthDayData: boolean;
  hasYearData: boolean;
  hasTaxonData: boolean;
  metaFetch: Subscription;

  selectedTabIdx = 0; // stores which tab index was provided by @Input active
  onlyCount = this.storage.retrieve('onlycount') === null ? true : this.storage.retrieve('onlycount');

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private searchQueryService: SearchQueryService,
    private cd: ChangeDetectorRef,
    private storage: LocalStorageService,
    private route: ActivatedRoute
  ) {}

  @Input()
  set active(value) {
    if (value === 'finnish') {
      this.mode = 'finnish';
      this.loadedModes.load('finnish');
    } else {
      this.mode = 'all';
      this.loadedModes.load('all');
      this.lastTabActive = value;
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

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.route.snapshot.queryParams["editorOrObserverPersonToken"] === undefined &&
        this.route.snapshot.queryParams["observerPersonToken"] === undefined &&
        this.route.snapshot.queryParams["editorPersonToken"] === undefined &&
        this.selectedTabIdx === 6
    ) {
      this.onSelect(0);
    }
  }

  ngDestroy() {
    this.metaFetch.unsubscribe();
  }

  reloadTabs() {
    this.loadedTabs.reset();
    this.loadedTabs.load(this.lastTabActive);
  }

  pickLocation(e) {
    if (!e) {
      return;
    }
    const query = {...this.query};
    if (e.coordinateVerbatim) {
      query.coordinates = [e.coordinateVerbatim + ':YKJ'];
    } else if (
      e.type === 'Polygon' &&
      e.coordinates && e.coordinates.length === 1 && e.coordinates[0].length === 5
    ) {
      query.coordinates = [
        e.coordinates[0][0][1] + ':' + e.coordinates[0][2][1] + ':' +
        e.coordinates[0][0][0] + ':' + e.coordinates[0][2][0] + ':WGS84'
      ];
    } else {
      query.coordinates = undefined;
    }
    this.queryChange.emit(query);
  }

  openDownloadModal() {
    this.downloadModal.openModal();
  }

  toggleOnlyCount() {
    this.onlyCount = !this.onlyCount;
    this.storage.store('onlycount', this.onlyCount);
  }

}
