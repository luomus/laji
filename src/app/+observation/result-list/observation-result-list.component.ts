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
  visible: boolean;
  sortBy?: string | boolean;
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
    {
      field: 'unit.taxonVerbatim,unit.linkings.taxon.vernacularName',
      translation: 'result.unit.taxonVerbatim', visible: true, sortBy: false
    },
    {field: 'unit.linkings.taxon.scientificName', translation: 'result.scientificName', visible: true},
    {field: 'gathering.team', visible: true, sortBy: false},
    {field: 'gathering.eventDate', visible: true, sortBy: 'gathering.eventDate.begin,gathering.eventDate.end'},
    {field: 'gathering.municipality', visible: true},
    {field: 'gathering.locality', visible: false},
    {field: 'document.documentId', visible: false},
    {field: 'gathering.interpretations.coordinateAccuracy', visible: false, sortBy: false}
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
    if (this.userColumns.length === 0) {
      this.updateUserCols();
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

  updateUserCols() {
    let current = JSON.stringify(this.userColumns);
    this.userColumns = this.columns.filter((col) => col.visible !== false);
    return current !== JSON.stringify(this.userColumns);
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
      if (!cur.sort || cur.sortBy === false) return prev;
      let field = '' + (cur.sortBy || cur.field);
      let cols = field.split(',').map((value) => {
        return value + ' ' + cur.sort;
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
          this.loading = false;
          this.searchQuery.updateUrl(this.location, undefined, [
            'selected',
            'pageSize'
          ]);
        },
        err => {
          this.logger.warn('Failed to fetch list result', err);
          this.result.results = [];
          this.loading = false;
        }
      );
  }

  setSort(col: Column) {
    if (col.sortBy === false) {
      return;
    }
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

  toggledFieldSelect(event) {
    if (event === false) { // when closing
      if (this.updateUserCols()) {
        this.fetchRows(this.searchQuery.page, true);
      }
    } else {               // when opening
      this.columns.map((col, idx) => {
        let userCol = this.userColumns.filter((src) => src.field === col.field);
        if (userCol.length !== 1) {
          this.columns[idx].visible = false;
          return;
        }
        this.columns[idx].visible = typeof userCol[0].visible === 'undefined' || userCol[0].visible;
      });
    }
  }

  toggleColumn(col: Column) {
    col.visible = !col.visible;
  }
}
