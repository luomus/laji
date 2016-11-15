import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { SearchQuery } from '../search-query.model';
import { WarehouseQueryInterface, DATE_FORMAT } from '../../shared/model/WarehouseQueryInterface';
import { Observable, Subscription } from 'rxjs';
import { AutocompleteApi } from '../../shared/api/AutocompleteApi';
import { TranslateService } from 'ng2-translate';
import { ObservationFilterInterface } from '../filter/observation-filter.interface';
import { ObservationFormQuery } from './observation-form-query.interface';
import { CollectionApi } from '../../shared/api/CollectionApi';
import { Collection } from '../../shared/model/Collection';
import { IdService } from '../../shared/service/id.service';
import { SourceApi } from '../../shared/api/SourceApi';
import { Source } from '../../shared/model/Source';
import { MultiRadioOption } from '../multi-radio/multi-radio.component';
import { debounce } from 'underscore';
import { LocalStorage } from 'angular2-localstorage/dist';

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  styleUrls: ['./observation-form.component.css'],
  providers: [CollectionApi, SourceApi]
})
export class ObservationFormComponent implements OnInit {

  @LocalStorage() public settings = {showIntro: true};
  @Input() activeTab: string;
  @ViewChild('tabs') tabs;

  public limit = 10;
  public formQuery: ObservationFormQuery;
  public dataSource: Observable<any>;
  public typeaheadLoading: boolean = false;
  public warehouseDateFormat = DATE_FORMAT;
  public showFilter = false;
  public invasiveOptions: MultiRadioOption[] = [
    {value: true, label: 'observation.form.multi-true'},
    {value: false, label: 'observation.form.multi-false'},
    {value: undefined, label: 'observation.form.multi-all'},
  ];
  public finnishOptions: MultiRadioOption[] = [
    {value: true, label: 'observation.form.multi-true'},
    {value: false, label: 'observation.form.multi-false'},
    {value: undefined, label: 'observation.form.multi-all'},
  ];
  public mediaOptions: MultiRadioOption[] = [
    {value: true, label: 'observation.form.multi-true'},
    {value: false, label: 'observation.form.multi-false'},
    {value: undefined, label: 'observation.form.multi-all'},
  ];

  public filters: {[name: string]: ObservationFilterInterface} = {
    recordBasis: {
      title: 'observation.filterBy.recordBasis',
      field: 'unit.superRecordBasis',
      filter: 'superRecordBasis',
      type: 'array',
      size: 10,
      selected: []
    },
    image: {
      title: 'observation.filterBy.image',
      field: 'unit.media.mediaType',
      pick: [
        'IMAGE'
      ],
      booleanMap: {
        'IMAGE': true
      },
      size: 10,
      filter: 'hasMedia',
      type: 'boolean',
      selected: []
    },
    source: {
      title: 'observation.filterBy.sourceId',
      field: 'document.sourceId',
      size: 10,
      filter: 'sourceId',
      type: 'array',
      selected: [],
      pager: true,
      map: this.fetchSourceName.bind(this)
    },
    collection: {
      title: 'observation.filterBy.collectionId',
      field: 'document.collectionId',
      size: 10,
      filter: 'collectionId',
      booleanMap: IdService.getId,
      type: 'array',
      selected: [],
      pager: true,
      map: this.fetchCollectionName.bind(this)
    }
  };

  public pickSex = {
    'MY.sexM': '',
    'MY.sexF': '',
    'MY.sexW': ''
  };


  private subUpdate: Subscription;
  private window: Window;
  private lastQuery: string;
  private delayedSearch;

  constructor(public searchQuery: SearchQuery,
              public translate: TranslateService,
              public collectionService: CollectionApi,
              private location: Location,
              private autocompleteService: AutocompleteApi,
              private sourceService: SourceApi,
              @Inject('Window') window: Window) {
    this.delayedSearch = debounce(this.onSubmit, 500);
    this.window = window;
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    }).mergeMap((token: string) => this.getTaxa(token));
  }

  public getTaxa(token: string): Observable<any> {
    return this.autocompleteService.autocompleteFindByField(
      'taxon',
      token,
      '' + this.limit,
      true,
      this.translate.currentLang,
      undefined,
      this.formQuery.informalTaxonGroupId
    );
  }

  ngOnInit() {
    this.empty(false, this.searchQuery.query);
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res && res.formSubmit) {
          this.queryToFormQuery(this.searchQuery.query);
          this.onSubmit(false);
        }
      });
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  checkboxSelect(selected, loc) {
    if (selected.length === 0) {
      this.formQuery[loc] = [0, 1];
    }
  }

  gotToMap() {
    this.activeTab = 'map';
    this.window.scrollTo(0, this.tabs.nativeElement.offsetTop + 150);
  }

  getTabHeight() {
    return (this.window.innerHeight || 0) + 'px';
  }

  updateTime(dates) {
    if (dates === 365) {
      let today = new Date();
      let oneJan = new Date(today.getFullYear(), 0, 1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    let today = moment();
    this.formQuery.timeStart = today.subtract(dates, 'days').format(DATE_FORMAT);
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
      individualCountMin: '',
      individualCountMax: ''
    };

    if (refresh) {
      this.onSubmit();
    }
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
  }

  toggleInfo() {
    this.settings.showIntro = !this.settings.showIntro;
  }

  fetchCollectionName(data) {
    return this.collectionService.findAll(
      this.translate.currentLang,
      data.map(col => IdService.getId(col.value)).join(',')
    ).map(res => {
      let lookUp = {};
      res.results.map((collection: Collection) => {
        lookUp[IdService.getUri(collection.id)] = collection.longName;
      });
      return data.map(col => {
        col['label'] = lookUp[col['value']];
        return col;
      });
    });
  }

  fetchSourceName(data) {
    return this.sourceService.findAll(
      this.translate.currentLang,
      data.map(col => IdService.getId(col.value)).join(',')
    ).map(res => {
      let lookUp = {};
      res.results.map((source: Source) => {
        lookUp[IdService.getUri(source.id)] = source.name;
      });
      return data.map(col => {
        col['label'] = lookUp[col['value']];
        return col;
      });
    });
  }

  onCheckBoxToggle(field) {
    this.searchQuery.query[field] = this.searchQuery.query[field] ?
      true : undefined;
    this.onQueryChange();
  }

  onQueryChange() {
    this.delayedSearch(true);
  }

  onSubmit(updateQuery = true) {
    this.formQueryToQuery(this.formQuery);
    let cacheKey = JSON.stringify(this.searchQuery.query);
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    this.searchQuery.tack++;
    this.searchQuery.updateUrl(this.location, undefined, [
      'selected',
      'pageSize'
    ]);
    if (updateQuery) {
      this.searchQuery.queryUpdate({});
    }
    return false;
  }

  onFilterSelect() {
    this.onSubmit();
  }

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  public getTaxonGroup(obj: any, field, join = ' ') {
    if (obj.informalTaxonGroups) {
      return obj.informalTaxonGroups.map(group => group[field]).join(join);
    }
    return '';
  }

  private queryToFormQuery(query: WarehouseQueryInterface) {
    let time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    this.formQuery = {
      taxon: query.target && query.target[0] ? query.target[0] : '',
      timeStart: time[0] || '',
      timeEnd: time[1] || '',
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      individualCountMin: '' + query.individualCountMin,
      individualCountMax: '' + query.individualCountMax
    };
  }

  private parseMultiBoolean(value): boolean {
    if (typeof value === 'undefined' || value.length === 0 || value.length === 2 || typeof value[0] === 'undefined') {
      return undefined;
    }
    return value[0] === 0 ? false : true;
  }

  private formQueryToQuery(formQuery: ObservationFormQuery) {
    let taxon = formQuery.taxon;
    let time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    let query = this.searchQuery.query;

    query.target = taxon.length > 0 ?
      [taxon] : undefined;
    query.time = time.length > 0 ?
      [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ?
      [formQuery.informalTaxonGroupId] : undefined;
    query.individualCountMin = +formQuery.individualCountMin || undefined;
    query.individualCountMax = +formQuery.individualCountMax || undefined;
  }

  private parseDate(start, end) {
    if (start || end) {
      end = end || moment().format(DATE_FORMAT);
      start = start || moment().format(DATE_FORMAT);
    } else {
      return '';
    }
    return start + '/' + end;
  }
}
