import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutocompleteApi } from '../../shared/api/AutocompleteApi';
import { TranslateService } from '@ngx-translate/core';
import { ObservationFormQuery } from './observation-form-query.interface';
import { CollectionApi } from '../../shared/api/CollectionApi';
import { SourceApi } from '../../shared/api/SourceApi';
import { LocalStorage } from 'ng2-webstorage';
import { MapService } from '../../shared/map/map.service';
import { WindowRef } from '../../shared/windows-ref';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Autocomplete } from '../../shared/model/Autocomplete';
import { AreaType } from '../../shared/service/area.service';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrls: ['./observation-form.component.css'],
  providers: [CollectionApi, SourceApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormComponent implements OnInit, OnDestroy {

  @LocalStorage() public observationSettings: any;
  @Input() activeTab: string;
  @ViewChild('tabs') tabs;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;

  public debouchAfterChange = 500;
  public limit = 10;
  public formQuery: ObservationFormQuery;
  public dataSource: Observable<any>;
  public typeaheadLoading = false;
  public warehouseDateFormat = 'YYYY-MM-DD';
  public logCoordinateAccuracyMax = 4;
  public showPlace = false;
  public showFilter = true;
  public taxonName: Autocomplete;
  public areaType = AreaType;

  public drawing = false;
  public drawingShape: string;
  public dateFormat = 'YYYY-MM-DD';
  public invasiveStatuses: string[] = [
    'nationallySignificantInvasiveSpecies',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
    'euInvasiveSpeciesList',
    'quarantinePlantPest'
  ];

  private subUpdate: Subscription;
  private subMap: Subscription;
  private lastQuery: string;
  private delayedSearchSource = new Subject<any>();
  private delayedSearch = this.delayedSearchSource.asObservable();
  private subSearch: Subscription;

  constructor(public searchQuery: SearchQuery,
              public translate: TranslateService,
              private route: Router,
              private cd: ChangeDetectorRef,
              private userService: UserService,
              private autocompleteService: AutocompleteApi,
              private mapService: MapService,
              private winRef: WindowRef) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    }).mergeMap((token: string) => this.getTaxa(token));
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
        field: 'taxon',
        q: token,
        limit: onlyFirstMatch ? '1' : '' + this.limit,
        includePayload: true,
        lang: this.translate.currentLang,
        informalTaxonGroup: this.formQuery.informalTaxonGroupId
      })
      .map(data => {
        if (onlyFirstMatch) {
          return data[0] || {};
        }
        return data.map(item => {
          let groups = '';
          if (item.payload && item.payload.informalTaxonGroups) {
            groups = item.payload.informalTaxonGroups.reduce((prev, curr) => {
              return prev + ' ' + curr.id;
            }, groups);
          }
          item['groups'] = groups;
          return item;
        });
      });
  }

  ngOnInit() {
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
    this.subMap = this.mapService.map$.subscribe((event) => {
      if (event === 'drawstart') {
        this.drawing = true;
        this.showPlace = true;
      }
      if (event === 'drawstop') {
        this.drawing = false;
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

  updateTime(dates) {
    if (dates === 365) {
      const today = new Date();
      const oneJan = new Date(today.getFullYear(), 0, 1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    const now = moment();
    this.formQuery.timeStart = now.subtract(dates, 'days').format('YYYY-MM-DD');
    this.formQuery.timeEnd = '';
    this.onSubmit();
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

  toggleFilters() {
    this.showFilter = !this.showFilter;
    try {
      setTimeout(() => {
        try {
          this.winRef.nativeWindow.dispatchEvent(new Event('resize'));
        } catch (e) {
          const evt = this.winRef.nativeWindow.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, window, 0);
          this.winRef.nativeWindow.dispatchEvent(evt);
        }
      }, 50);
    } catch (e) {}
  }

  toggleInfo() {
    this.observationSettings = {showIntro: !this.observationSettings.showIntro};
  }

  togglePlace(event) {
    // IE triggers this event even when not given by the
    if (!event || !event.hasOwnProperty('value')) {
      return;
    }
    this.showPlace = !this.showPlace;
  }

  onOnlyFromCollectionCheckBoxToggle() {
    this.formQuery.onlyFromCollectionSystems = !this.formQuery.onlyFromCollectionSystems;
    if (this.formQuery.onlyFromCollectionSystems === false) {
      this.searchQuery.query.sourceId = [];
    }
    this.onSubmit();
  }

  onInvasiveCheckBoxToggle(field) {
    if (Array.isArray(field)) {
      this.formQuery.allInvasiveSpecies = !this.formQuery.allInvasiveSpecies;
      field.map(status => {this.formQuery[status] = this.formQuery.allInvasiveSpecies; });
    } else {
      this.formQuery[field] = !this.formQuery[field];
      if (!this.formQuery[field] && this.formQuery.allInvasiveSpecies) {
        this.formQuery.allInvasiveSpecies = false;
      }
    }
    this.onSubmit();
    this.onAdministrativeStatusChange(false);
  }

  onAdministrativeStatusChange(doChange = true) {
    const admins = this.searchQuery.query.administrativeStatusId;
    let cnt = 0;
    this.invasiveStatuses.map(key => {
      const realKey = 'MX.' + key;
      this.formQuery[key] = admins && admins.indexOf(realKey) > -1;
      if (this.formQuery[key]) {
        cnt++;
      }
    });
    this.formQuery.allInvasiveSpecies = cnt === this.invasiveStatuses.length;
    if (doChange) {
      this.onQueryChange();
    }
  }

  onSystemIDChange() {
    this.formQuery.onlyFromCollectionSystems = this.searchQuery.query.sourceId.length === 2
      && this.searchQuery.query.sourceId.indexOf('KE.3') > -1
      && this.searchQuery.query.sourceId.indexOf('KE.167') > -1;
    this.onQueryChange();
  }

  onCheckBoxToggle(field, selectValue: any = true, isDirect = true) {
    if (isDirect) {
      this.searchQuery.query[field] = typeof this.searchQuery.query[field] === 'undefined'
      ||  this.searchQuery.query[field] !== selectValue
        ? selectValue : undefined;
    } else {
      const value = this.searchQuery.query[field];
      this.searchQuery.query[field] =
        typeof value === 'undefined' ||  value !==  selectValue ?
          selectValue : undefined;
    }
    this.onIndirectChange();
  }

  onCountChange() {
    if ( this.searchQuery.query.individualCountMin === 0
      && this.searchQuery.query.individualCountMax === 0) {
      this.formQuery['zeroObservations'] = true;
    } else {
      this.formQuery['zeroObservations'] = false;
    }
    this.onQueryChange();
  }

  toggleZeroCheckBox() {
    this.formQuery['zeroObservations'] = !this.formQuery['zeroObservations'];
    if (this.formQuery['zeroObservations']) {
      this.searchQuery.query.individualCountMin = 0;
      this.searchQuery.query.individualCountMax = 0;
    } else {
      this.searchQuery.query.individualCountMin = undefined;
      this.searchQuery.query.individualCountMax = undefined;
    }
    this.onSubmit();
  }

  onIndirectChange() {
    this.queryToFormQuery(this.searchQuery.query);
    this.onQueryChange();
  }

  onFormQueryChage() {
    this.formQueryToQuery(this.formQuery);
    this.onQueryChange();
  }

  onQueryChange() {
    this.taxonName = null;
    this.delayedSearchSource.next(true);
  }

  enableAccuracySlider() {
    if (!this.searchQuery.query.coordinateAccuracyMax) {
      this.searchQuery.query.coordinateAccuracyMax = 1000;
      this.onAccuracySliderChange();
    }
  }

  onAccuracySliderChange() {
    this.searchQuery.query.coordinateAccuracyMax = Math.pow(10, this.logCoordinateAccuracyMax);
    this.onQueryChange();
  }

  onAccuracyValueChange() {
    this.logCoordinateAccuracyMax = Math.log10(this.searchQuery.query.coordinateAccuracyMax);
    this.onQueryChange();
  }

  onSubmit() {
    this.formQueryToQuery(this.formQuery);
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
    this.onSubmit();
  }

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  private queryToFormQuery(query: WarehouseQueryInterface) {
    this.onAccuracyValueChange();
    const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    this.formQuery = {
      taxon: query.target && query.target[0] ? query.target[0] : '',
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
      asObserver: !!query.observerPersonToken,
      asEditor: !!query.editorPersonToken,
    };
    if (this.formQuery.taxon && (
      this.formQuery.taxon.indexOf('MX.') === 0 || this.formQuery.taxon.indexOf('http:') === 0)) {
      this.getTaxa(this.formQuery.taxon, true).subscribe(data => {
        this.taxonName = data;
        this.cd.markForCheck();
      });
    } else {
      this.taxonName = null;
    }
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

  private formQueryToQuery(formQuery: ObservationFormQuery) {
    const taxon = formQuery.taxon;
    const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    const query = this.searchQuery.query;

    query.target = taxon.length > 0 ? [taxon] : undefined;
    query.time = time.length > 0 ? [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ? [formQuery.informalTaxonGroupId] : undefined;
    query.invasive = formQuery.isNotInvasive ? false : query.invasive;
    query.finnish = formQuery.isNotFinnish ? false : query.finnish;
    query.hasMedia = formQuery.hasNotMedia ? false : query.hasMedia;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
    if (formQuery.allInvasiveSpecies) {
      query.administrativeStatusId = this.invasiveStatuses.map(val => 'MX.' + val);
    }
    if (formQuery.onlyFromCollectionSystems) {
      query.sourceId = ['KE.167', 'KE.3'];
    }
    query.editorPersonToken = formQuery.asEditor ? this.userService.getToken() : undefined;
    query.observerPersonToken = formQuery.asObserver ? this.userService.getToken() : undefined;
    this.invasiveStatuses
      .map((key) => {
        const value = 'MX.' + key;
        if (!formQuery[key]) {
          if (query.administrativeStatusId) {
            const idx = query.administrativeStatusId.indexOf(value);
            if (idx > -1) {
              query.administrativeStatusId.splice(idx, 1);
            }
          }
          return;
        }
        if (!query.administrativeStatusId) {
          query.administrativeStatusId = [];
        }
        if (query.administrativeStatusId.indexOf(value) === -1) {
          query.administrativeStatusId.push(value);
        }
      });
  }

  private getValidDate(date) {
    if (!date || !moment(date, this.dateFormat, true).isValid()) {
      return '';
    }
    return date;
  }

  private parseDate(start, end) {
    if (!start && !end) {
      return '';
    }
    if (
      (start && !moment(start, this.dateFormat, true).isValid()) ||
      (end && !moment(end, this.dateFormat, true).isValid())
    ) {
      return '';
    }
    return (start || '') + '/' + (end || '');
  }
}
