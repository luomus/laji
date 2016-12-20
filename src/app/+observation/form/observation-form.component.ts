import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
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
import { debounce } from 'underscore';
import { LocalStorage } from 'angular2-localstorage/dist';
import { MapService } from '../../shared/map/map.service';
import { WindowRef } from '../../shared/windows-ref';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Autocomplete } from '../../shared/model/Autocomplete';
declare const moment: any;

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  styleUrls: ['./observation-form.component.css'],
  providers: [CollectionApi, SourceApi]
})
export class ObservationFormComponent implements OnInit, OnDestroy {

  @LocalStorage() public settings = {showIntro: true};
  @Input() activeTab: string;
  @ViewChild('tabs') tabs;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;

  public limit = 10;
  public formQuery: ObservationFormQuery;
  public dataSource: Observable<any>;
  public typeaheadLoading: boolean = false;
  public warehouseDateFormat = DATE_FORMAT;
  public logCoordinateAccuracyMax: number = 4;
  public showPlace = false;
  public showFilter = true;
  public taxonName: Autocomplete;

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

  public drawing = false;
  public drawingShape: string;
  public dateFormat: string = 'YYYY-MM-DD';

  private subUpdate: Subscription;
  private subMap: Subscription;
  private lastQuery: string;
  private delayedSearch;

  constructor(public searchQuery: SearchQuery,
              public translate: TranslateService,
              public collectionService: CollectionApi,
              private location: Location,
              private autocompleteService: AutocompleteApi,
              private sourceService: SourceApi,
              private mapService: MapService,
              private winRef: WindowRef) {
    this.delayedSearch = debounce(this.onSubmit, 500);
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    }).mergeMap((token: string) => this.getTaxa(token));
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField(
        'taxon',
        token,
        onlyFirstMatch ? '1' : '' + this.limit,
        true,
        this.translate.currentLang,
        undefined,
        this.formQuery.informalTaxonGroupId
      )
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
    this.empty(false, this.searchQuery.query);
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res.formSubmit) {
          this.queryToFormQuery(this.searchQuery.query);
          this.onSubmit(false);
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
  }

  draw(type: string) {
    this.drawingShape = type;
    if (this.activeTab !== 'map') {
      this.activeTab = 'map';
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 100);
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
      isNotFinnish: undefined,
      isNotInvasive: undefined,
      hasNotMedia: undefined,
      includeOnlyValid: undefined
    };

    if (refresh) {
      this.onSubmit();
    }
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    if (this.activeTab === 'map') {
      this.winRef.nativeWindow.dispatchEvent(new Event('resize'));
    }
  }

  toggleInfo() {
    this.settings.showIntro = !this.settings.showIntro;
  }

  togglePlace(event) {
    // IE triggers this event even when not given by the
    if (!event || !event.hasOwnProperty('value')) {
      return;
    }
    this.showPlace = !this.showPlace;
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

  onCheckBoxToggle(field, selectValue = true, isDirect = true) {
    if (isDirect) {
      this.searchQuery.query[field] = typeof this.searchQuery.query[field] === 'undefined'
      ||  this.searchQuery.query[field] !== selectValue
        ? selectValue : undefined;
    } else {
      let value = this.searchQuery.query[field];
      this.searchQuery.query[field] =
        typeof value === 'undefined' ||  value !==  selectValue ?
          selectValue : undefined;
    }
    this.queryToFormQuery(this.searchQuery.query);
    this.onQueryChange();
  }

  onQueryChange() {
    this.delayedSearch(true);
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

  onSubmit(updateQuery = true) {
    this.formQueryToQuery(this.formQuery);
    let cacheKey = JSON.stringify(this.searchQuery.query);
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    this.searchQuery.page = 1;
    this.searchQuery.tack++;
    this.searchQuery.updateUrl(this.location, undefined, [
      'selected',
      'pageSize'
    ], false);
    if (updateQuery) {
      this.searchQuery.queryUpdate();
    }
    return false;
  }

  onFilterSelect() {
    this.onSubmit();
  }

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  private queryToFormQuery(query: WarehouseQueryInterface) {
    this.onAccuracyValueChange();
    let time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    this.formQuery = {
      taxon: query.target && query.target[0] ? query.target[0] : '',
      timeStart: this.getValidDate(time[0]),
      timeEnd: this.getValidDate(time[1]),
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      isNotFinnish: query.finnish === false ? true : undefined,
      isNotInvasive: query.invasive === false ? true : undefined,
      includeOnlyValid: query.includeNonValidTaxa === false ? true : undefined,
      hasNotMedia: query.hasMedia === false ? true : undefined
    };
    if (this.formQuery.taxon && (
      this.formQuery.taxon.indexOf('MX.') === 0 || this.formQuery.taxon.indexOf('http:') === 0)) {
      this.getTaxa(this.formQuery.taxon, true).subscribe(data => this.taxonName = data);
    } else {
      this.taxonName = null;
    }
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
    query.invasive = formQuery.isNotInvasive ? false : query.invasive;
    query.finnish = formQuery.isNotFinnish ? false : query.finnish;
    query.hasMedia = formQuery.hasNotMedia ? false : query.hasMedia;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
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
