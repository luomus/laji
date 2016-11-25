import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { WarehouseApi, PagedResult } from '../../shared';
import { ValueDecoratorService } from './value-decorator.sevice';
import { SearchQuery } from '../search-query.model';
import { Util } from '../../shared/service/util.service';
import { TranslateService } from 'ng2-translate';
import { Logger } from '../../shared/logger/logger.service';
import { SessionStorage } from 'angular2-localstorage/dist';

interface Column {
  field: string;
  translation?: string;
  sort?: 'ASC' | 'DESC';
}

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: 'observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  providers: [ValueDecoratorService]
})
export class ObservationResultListComponent implements OnInit, OnDestroy {

  @SessionStorage() userColumns: Column[] = [];
  @Input() showPager: boolean = true;
  @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();

  public columns: Column[] = [
    {field: 'unit.taxonVerbatim,unit.linkings.taxon.vernacularName', translation: 'result.unit.taxonVerbatim'},
    {field: 'unit.linkings.taxon.scientificName', translation: 'result.scientificName'},
    {field: 'gathering.team'},
    {field: 'gathering.eventDate'},
    {field: 'gathering.municipality'},
    {field: 'document.documentId'}
  ];

  public result: PagedResult<any>;

  public loading: boolean = true;

  private subFetch: Subscription;
  private subUpdate: Subscription;
  private subTrans: Subscription;
  private lastQuery: string;
  private resultCache: PagedResult<any>;

  constructor(private warehouseService: WarehouseApi,
              private decorator: ValueDecoratorService,
              private searchQuery: SearchQuery,
              private translate: TranslateService,
              private location: Location,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    let cols = this.userColumns;
    if (cols.length === 0) {
      console.log(cols);
      this.userColumns = Util.clone(this.columns);
    }
    this.result = {
      total: this.searchQuery.page * this.searchQuery.pageSize,
      pageSize: this.searchQuery.pageSize,
      currentPage: this.searchQuery.page,
      results: []
    };
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        if (this.resultCache) {
          this.result = this.prepareData(Util.clone(this.resultCache));
        }
      }
    );
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.fetchRows(this.searchQuery.page);
      }
    );
    this.fetchRows(this.searchQuery.page);
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }

  pageChanged(event: any): void {
    if (this.searchQuery.page !== event.page) {
      this.fetchRows(event.page);
    }
  }

  fetchRows(page: number, forceUpdate: boolean = false): void {
    let query = Util.clone(this.searchQuery.query);
    if (!forceUpdate) {
      let cache = [
        JSON.stringify(query),
        page
      ].join(':');
      if (this.lastQuery === cache) {
        return;
      }
      this.lastQuery = cache;
    }
    if (Object.keys(query).length === 0) {
      query.includeNonValidTaxa = false;
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    query.selected = this.userColumns.map((column) => column.field);
    let sort = this.userColumns.reduce((prev, cur) => {
      if (!cur.sort) return prev;
      let cols = cur.field.split(',').map((field) => {
        return field + ' ' + cur.sort;
      });
      return [...cols, ...prev];
    }, []);
    this.loading = true;
    this.subFetch = this.warehouseService
      .warehouseQueryListGet(
        query,
        this.searchQuery.selected,
        sort.length > 0 ? sort : undefined,
        this.searchQuery.pageSize,
        page)
      .do(result => this.resultCache = Util.clone(result))
      .map(result => this.prepareData(result))
      .subscribe(
        results => {
          this.searchQuery.page = results.currentPage || 1;
          this.result = results;
          this.searchQuery.updateUrl(this.location, undefined, [
            'selected',
            'pageSize'
          ]);
        },
        err => {
          this.logger.warn('Failed to fetch list result', err);
          this.result.results = [];
        },
        () => this.loading = false
      );
  }

  setSort(col: Column) {
    this.userColumns.map((column) => {
      if (col.field === column.field) {
        return;
      }
      column.sort = undefined;
    });
    if (!col.sort) {
      col.sort = 'ASC';
    } else if (col.sort === 'ASC') {
      col.sort = 'DESC';
    } else {
      col.sort = undefined;
    }
    this.fetchRows(this.searchQuery.page, true);
  }

  prepareData(data) {
    if (!data.results) {
      return data;
    }
    let colLen = this.userColumns.length;
    let results: any = [];
    this.decorator.lang = this.translate.currentLang;
    for (let i = 0, len = data.results.length; i < len; i++) {
      results[i] = {};
      for (let j = 0; j < colLen; j++) {
        results[i][this.userColumns[j].field] = this.getData(data.results[i], this.userColumns[j].field);
      }
    }
    data.results = results;
    return data;
  }

  getData(row: any, propertyName: string): string {
    let val = '';
    let first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
      val = this.decorator.decorate(first, val, row);
    } catch (e) {
    }
    return val;
  }
}
