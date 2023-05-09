import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { IObservationViewModel, ObservationFacade } from '../observation.facade';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { tap } from 'rxjs/operators';
import { BrowserService } from '../../shared/service/browser.service';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { ToastsService } from '../../shared/service/toasts.service';
import { SidebarComponent } from 'projects/laji-ui/src/lib/sidebar/sidebar.component';
import { ActiveToast } from 'ngx-toastr';

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
  own?: boolean;
}

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
  @ViewChild(SidebarComponent) sidebar: SidebarComponent;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;
  showMobile: any;

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

  vm$: Observable<IObservationViewModel>;
  settingsList$: Observable<ISettingResultList>;

  private searchButtonInfoToast?: ActiveToast<any>;
  private searchButtonInfoToastOnHiddenSub?: Subscription;
  private mainSubscription = new Subscription();

  constructor(
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

    this.mainSubscription.add(
      this.browserService.lgScreen$.subscribe(data => this.showMobile = data)
    );
    this.mainSubscription.add(
      this.observationFacade.activeQuery$.pipe(
        tap((query) => {
          if (this.results) {
            this.results.reloadTabs();
          }
        })
      ).subscribe()
    );
    this.mainSubscription.add(
      combineLatest([
        this.observationFacade.showSearchButtonInfo$,
        this.observationFacade.tmpQueryHasChanges$]
      ).subscribe(([show, hasChanges]) => {
        if (show && hasChanges) {
          this.showSearchButtonInfoToast();
        }
      })
    );
  }

  ngOnDestroy() {
    this.mainSubscription?.unsubscribe();
    this.searchButtonInfoToastOnHiddenSub?.unsubscribe();
  }

  draw(type: string) {
    this.sidebar.hideOnMobile();
    if (this.activeTab !== 'map') {
      this.route.navigate(this.localizeRouterService.translateRoute([this.basePath + '/map']), { queryParamsHandling: 'preserve' });
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 120);
  }

  updateTmpQuery(query: WarehouseQueryInterface, showSidebarOnMobile = false) {
    this.observationFacade.updateTmpQuery({...query});
    if (showSidebarOnMobile) {
      this.sidebar.showOnMobile();
    }
  }

  updateActiveQuery(query: WarehouseQueryInterface) {
    this.observationFacade.updateActiveQuery$(query).subscribe();
    this.sidebar.hideOnMobile();
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

  private showSearchButtonInfoToast() {
    if (!this.searchButtonInfoToast) {
      this.searchButtonInfoToast = this.toastsService.showInfo(
        this.translate.instant('observation.form.searchButtonInfo'),
        undefined,
        {
          disableTimeOut: true,
          closeButton: true,
          positionClass: 'toast-center-center'
        }
      );
      this.searchButtonInfoToastOnHiddenSub = this.searchButtonInfoToast.onHidden.subscribe(() => {
        this.observationFacade.hideSearchButtonInfo();
      });
    }
  }
}
