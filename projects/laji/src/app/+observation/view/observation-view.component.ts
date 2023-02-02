import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { ObservationFormComponent } from '../form/observation-form.component';
import { IObservationViewModel, ObservationFacade } from '../observation.facade';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { tap } from 'rxjs/operators';
import { BrowserService } from '../../shared/service/browser.service';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { ToastsService } from '../../shared/service/toasts.service';

export interface VisibleSections {
  finnish?: boolean;
  countTaxa?: boolean;
  countHits?: boolean;
  map?: boolean;
  list?: boolean;
  images?: boolean;
  species?: boolean;
  statistics?: boolean;
  download?: boolean;
  downloadList?: boolean;
  annotations?: boolean;
  info?: boolean;
  own?: boolean;
}


// The info should be shown only once per browser session, so we initialize it here for the whole runtime.
let coordinateFilterInfoShown = false;

@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  @Input() formType: 'unit'|'sample' = 'unit';
  @Input() basePath = '/observation';
  @Input() visible: VisibleSections = {
    info: true,
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
    own: environment.type !== Global.type.vir
  };
  @Input() skipUrlParameters: string[] = [
    'selected',
    'pageSize',
    'page'
  ];
  @Input() settingsKeyList = 'resultList';
  _activeTab: string;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;
  @ViewChild(ObservationFormComponent) form: ObservationFormComponent;
  showMobile: any;
  subscription: any;

  showFilter = true;
  statusFilterMobile = false;

  invasiveStatuses: string[] = [
    'euInvasiveSpeciesList',
    'controllingRisksOfInvasiveAlienSpecies',
    'quarantinePlantPest',
    'qualityPlantPest',
    'otherPlantPest',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
  ];

  subQueryUpdate: Subscription;

  vm$: Observable<IObservationViewModel>;
  settingsList$: Observable<ISettingResultList>;

  constructor(
    public searchQuery: SearchQueryService,
    public translate: TranslateService,
    private observationFacade: ObservationFacade,
    private browserService: BrowserService,
    private localizeRouterService: LocalizeRouterService,
    private route: Router,
    private userService: UserService,
    private toastsService: ToastsService
  ) {}

  @Input()
  set activeTab(tab: string) {
    this._activeTab = tab;
    this.browserService.triggerResizeEvent();
  }

  get activeTab(): string {
    return this._activeTab;
  }


  ngOnInit() {
    this.vm$ = this.observationFacade.vm$;
    this.settingsList$ = this.userService.getUserSetting<ISettingResultList>(this.settingsKeyList);
    this.subscription = this.browserService.lgScreen$.subscribe(data => this.showMobile = data);
    this.subQueryUpdate = this.observationFacade.query$.pipe(
      tap((query) => {
        if (this.results) {
          this.results.reloadTabs();
        }
        if ((query.coordinates || query.polygonId) && !coordinateFilterInfoShown) {
          coordinateFilterInfoShown = true;
          this.toastsService.showInfo(
            this.translate.instant('observation.form.coordinatesInfo'),
            undefined,
            {disableTimeOut: true, closeButton: true}
          );
        }
      })
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
    if (this.activeTab !== 'map') {
      this.route.navigate(this.localizeRouterService.translateRoute([this.basePath + '/map']), { queryParamsHandling: 'preserve' });
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 120);
  }

  empty() {
    this.observationFacade.clearQuery();
    this.form.empty();
  }

  toggleInfo() {
    this.observationFacade.toggleIntro();
  }

  onQueryChange(event: WarehouseQueryInterface) {
    this.observationFacade.updateQuery$(event).subscribe();
  }

  filterVisible(event: boolean) {
    this.observationFacade.filterVisible(event);
  }

  onListSettingsChange(settings: ISettingResultList) {
    this.userService.setUserSetting(this.settingsKeyList, settings);
  }

  toggleMobile() {
  this.statusFilterMobile = !this.statusFilterMobile;
  }
}
