import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable ,  Subject ,  Subscription, of as ObservableOf } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationFormQuery } from '../form/observation-form-query.interface';
import { LocalStorage } from 'ng2-webstorage';
import { ObservationResultComponent } from '../result/observation-result.component';
import { AreaType } from '../../shared/service/area.service';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { FormService } from '../../shared/service/form.service';
import { environment } from '../../../environments/environment';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { CoordinateService } from '../../shared/service/coordinate.service';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { WINDOW } from '@ng-toolkit/universal';

@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  @LocalStorage() public observationSettings: any;
  @Input() activeTab: string;
  @ViewChild('tabs') tabs;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;

  hasInvasiveControleRights = false;
  debouchAfterChange = 500;
  limit = 10;
  formQuery: ObservationFormQuery;
  typeaheadLoading = false;
  logCoordinateAccuracyMax = 4;
  showPlace = false;
  showFilter = true;
  areaType = AreaType;
  taxonExtra = false;
  dateFormat = 'YYYY-MM-DD';

  drawing = false;
  drawingShape: string;
  invasiveStatuses: string[] = [
    'nationallySignificantInvasiveSpecies',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
    'euInvasiveSpeciesList',
    'quarantinePlantPest'
  ];

  subUpdate: Subscription;
  subMap: Subscription;
  lastQuery: string;
  delayedSearchSource = new Subject<any>();
  delayedSearch = this.delayedSearchSource.asObservable();
  subSearch: Subscription;

  constructor(@Inject(WINDOW) private window: Window,
              public searchQuery: SearchQuery,
              public translate: TranslateService,
              private route: Router,
              private cd: ChangeDetectorRef,
              private userService: UserService,
              private lajiApi: LajiApiService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private coordinateService: CoordinateService) {

  }

  ngOnInit() {
    if (environment.invasiveControlForm) {
      this.formService
        .load(environment.invasiveControlForm, this.translate.currentLang)
        .switchMap((form) => this.formPermissionService.hasEditAccess(form))
        .catch(() => ObservableOf(false))
        .subscribe(hasPermission => this.hasInvasiveControleRights = hasPermission);
    }

    this.subSearch = this.delayedSearch
      .debounceTime(this.debouchAfterChange)
      .subscribe(() => {
        this.onSubmit();
        this.cd.markForCheck();
      });
    if (!this.observationSettings) {
      this.observationSettings = { showIntro: true };
    }
    this.empty(false, this.searchQuery.query);
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res.formSubmit) {
          this.queryToFormQuery(this.searchQuery.query);
          this.onSubmit();
        }
      });
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
    if (this.subMap) {
      this.subMap.unsubscribe();
    }
    if (this.subSearch) {
      this.subSearch.unsubscribe();
    }
  }

  draw(type: string) {
    this.drawingShape = type;
    if (this.activeTab !== 'map') {
      this.route.navigate(['/observation/map'], {preserveQueryParams: true});
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 100);
  }

  empty(refresh: boolean, query?: WarehouseQueryInterface) {
    if (query) {
      this.queryToFormQuery(query);
      return;
    }
    Object.keys(this.searchQuery.query).map(key => this.searchQuery.query[key] = undefined);
    this.formQuery = {
      taxon: '',
      timeStart: '',
      timeEnd: '',
      informalTaxonGroupId: '',
      isNotFinnish: undefined,
      isNotInvasive: undefined,
      hasNotMedia: undefined,
      includeOnlyValid: undefined,
      euInvasiveSpeciesList: undefined,
      nationallySignificantInvasiveSpecies: undefined,
      quarantinePlantPest: undefined,
      otherInvasiveSpeciesList: undefined,
      nationalInvasiveSpeciesStrategy: undefined,
      allInvasiveSpecies: undefined,
      zeroObservations: undefined,
      onlyFromCollectionSystems: undefined,
      asEditor: false,
      asObserver: false
    };

    if (refresh) {
      this.onSubmit();
    }
  }

  toggleInfo() {
    this.observationSettings = {showIntro: !this.observationSettings.showIntro};
  }

  onQueryChange() {
    this.delayedSearchSource.next(true);
  }

  onSubmit() {
    const cacheKey = JSON.stringify(this.searchQuery.query);
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.searchQuery.query = {...this.searchQuery.query};
    this.lastQuery = cacheKey;
    this.searchQuery.tack++;
    this.searchQuery.updateUrl([
      'selected',
      'pageSize',
      'page'
    ], false);
    this.searchQuery.queryUpdate();
    return false;
  }

  onFilterSelect(event) {
    this.searchQuery.query = event;
    this.delayedSearchSource.next();
  }

  toInvasiveControlForm() {
    this.formService.populate({
      URL: this.window.document.location.href,
      gatherings: [
        {
          geometry: this.coordinateService.convertLajiEtlCoordinatesToGeometry(this.searchQuery.query.coordinates)
        }
      ]
    });
    this.route.navigate(['/vihko', environment.invasiveControlForm]);
  }

  private queryToFormQuery(query: WarehouseQueryInterface) {
    // this.onAccuracyValueChange();
    const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    this.formQuery = {
      taxon: '',
      timeStart: this.getValidDate(time[0]),
      timeEnd: this.getValidDate(time[1]),
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      isNotFinnish: query.finnish === false ? true : undefined,
      isNotInvasive: query.invasive === false ? true : undefined,
      includeOnlyValid: query.includeNonValidTaxa === false ? true : undefined,
      hasNotMedia: query.hasMedia === false ? true : undefined,
      zeroObservations: query.individualCountMax === 0 && query.individualCountMax === 0 ? true : undefined,
      nationallySignificantInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, 'MX.nationallySignificantInvasiveSpecies'),
      euInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.euInvasiveSpeciesList'),
      quarantinePlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.quarantinePlantPest'),
      otherInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.otherInvasiveSpeciesList'),
      nationalInvasiveSpeciesStrategy: this.hasInMulti(query.administrativeStatusId, 'MX.nationalInvasiveSpeciesStrategy'),
      allInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, this.invasiveStatuses.map(val => 'MX.' + val)),
      onlyFromCollectionSystems: this.hasInMulti(query.sourceId, ['KE.167', 'KE.3'], true),
      asObserver: !!query.observerPersonToken || !!query.editorOrObserverPersonToken,
      asEditor: !!query.editorPersonToken || !!query.editorOrObserverPersonToken,
    };
  }

  private hasInMulti(multi, value, noOther = false) {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val, noOther)).length === 0;
    }
    if (Array.isArray(multi) && multi.indexOf(value) > -1) {
      return noOther ? multi.length === (Array.isArray(value) ? value.length : 1) : true;
    }
    return false;
  }



  private getValidDate(date) {
    if (!date || !moment(date, this.dateFormat, true).isValid()) {
      return '';
    }
    return date;
  }

}
