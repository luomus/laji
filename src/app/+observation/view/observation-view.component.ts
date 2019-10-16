import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-toolkit/universal';
import { ObservationFormComponent } from '../form/observation-form.component';
import { IObservationViewModel, ObservationFacade } from '../observation.facade';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { tap } from 'rxjs/operators';
import { BrowserService } from '../../shared/service/browser.service';
import { ISettingResultList } from '../../shared/service/user.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';

export interface VisibleSections {
  finnish?: boolean;
  counts?: boolean;
  map?: boolean;
  list?: boolean;
  images?: boolean;
  species?: boolean;
  statistics?: boolean;
  download?: boolean;
  annotations?: boolean;
  info?: boolean;
}

@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  @Input() basePath = '/observation';
  @Input() visible: VisibleSections = {
    info: true,
    finnish: true,
    counts: true,
    map: true,
    list: true,
    images: true,
    species: true,
    statistics: true,
    download: true,
    annotations: true,
  };
  @Input() skipUrlParameters: string[] = [
    'selected',
    'pageSize',
    'page'
  ];
  _activeTab: string;
  @ViewChild('tabs', { static: false }) tabs;
  @ViewChild(ObservationResultComponent, { static: false }) results: ObservationResultComponent;
  @ViewChild(ObservationFormComponent, { static: false }) form: ObservationFormComponent;
  showMobile: any;
  subscription: any;

  showFilter = true;
  dateFormat = 'YYYY-MM-DD';
  statusFilterMobile = false;

  drawing = false;
  drawingShape: string;
  invasiveStatuses: string[] = [
    'nationallySignificantInvasiveSpecies',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
    'euInvasiveSpeciesList',
    'quarantinePlantPest',
    'controllingRisksOfInvasiveAlienSpecies'
  ];

  subQueryUpdate: Subscription;

  vm$: Observable<IObservationViewModel>;

  constructor(
    @Inject(WINDOW) private window: Window,
    public searchQuery: SearchQueryService,
    public translate: TranslateService,
    private observationFacade: ObservationFacade,
    private browserService: BrowserService,
    private localizeRouterService: LocalizeRouterService,
    private route: Router
  ) {}

  @Input()
  set activeTab(tab: string) {
    this._activeTab = tab;
    if (tab === 'map') {
      this.browserService.triggerResizeEvent();
    }
  }

  get activeTab(): string {
    return this._activeTab;
  }


  ngOnInit() {
    this.vm$ = this.observationFacade.vm$;
    this.subscription = this.browserService.lgScreen$.subscribe(data => this.showMobile = data);
    this.subQueryUpdate = this.observationFacade.query$.pipe(
      tap(() => { if (this.results) { this.results.resetActivated(); }})
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  draw(type: string) {
    this.drawingShape = type;
    if (this.activeTab !== 'map') {
      this.route.navigate(this.localizeRouterService.translateRoute([this.basePath + '/map']), {preserveQueryParams: true});
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 100);
  }

  empty() {
    this.observationFacade.clearQuery();
    this.form.empty();
  }

  toggleInfo() {
    this.observationFacade.toggleIntro();
  }

  onQueryChange(event: WarehouseQueryInterface) {
    this.observationFacade.updateQuery(event);
  }

  filterVisible(event: boolean) {
    this.observationFacade.filterVisible(event);
  }

  onAdvanceModeChange(event: boolean) {
    this.observationFacade.advanced(event);
  }

  onListSettingsChange(settings: ISettingResultList) {
    this.observationFacade.updateListSettings(settings);
  }

  toggleMobile() {
  this.statusFilterMobile = !this.statusFilterMobile;
  }
}
