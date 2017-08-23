import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ValueDecoratorService } from './value-decorator.sevice';
import { SearchQuery } from '../search-query.model';
import { Util } from '../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../shared/logger/logger.service';
import { LocalStorage } from 'ng2-webstorage';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { PagedResult } from '../../shared/model/PagedResult';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { ModalDirective } from 'ngx-bootstrap';
import { CollectionNamePipe } from '../../shared/pipe/collection-name.pipe';

interface Column {
  field: string;
  translation?: string;
  sort?: 'ASC' | 'DESC';
  visible: boolean;
  skip?: boolean;
  async?: boolean;
  sortBy?: string | boolean;
}

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe]
})
export class ObservationResultListComponent implements OnInit, OnDestroy {
  @ViewChild('documentModal') public modal: ModalDirective;
  @LocalStorage() userColumns: Column[];
  @Input() showPager = true;
  @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();

  public columns: Column[] = [
    {
      field: 'unit.taxonVerbatim,unit.linkings.taxon.vernacularName',
      translation: 'result.unit.taxonVerbatim', visible: true, sortBy: false
    },
    {field: 'unit.linkings.taxon.scientificName', translation: 'result.scientificName', visible: true},
    {field: 'unit.reportedTaxonConfidence', visible: false},
    {field: 'unit.quality.taxon', visible: false, sortBy: 'unit.quality.taxon.reliability'},
    {field: 'gathering.team', visible: true, sortBy: 'gathering.team'},
    {field: 'gathering.displayDateTime', visible: true, sortBy: 'gathering.displayDateTime'},
    {field: 'gathering.interpretations.countryDisplayname', visible: true,
      sortBy: 'gathering.interpretations.countryDisplayname', translation: 'result.gathering.country'},
    {field: 'gathering.interpretations.biogeographicalProvinceDisplayname', visible: false,
      sortBy: 'gathering.interpretations.biogeographicalProvinceDisplayname', translation: 'result.gathering.biogeographicalProvince'},
    {field: 'gathering.interpretations.municipalityDisplayname', visible: true,
      sortBy: 'gathering.interpretations.municipalityDisplayname', translation: 'observation.form.municipality'},
    {field: 'gathering.locality', visible: true},
    {field: 'gathering.conversions.ykj', visible: false, sortBy: false},
    {field: 'gathering.conversions.euref', visible: false, sortBy: false},
    {field: 'gathering.conversions.wgs84', visible: false, sortBy: false},
    {field: 'gathering.interpretations.coordinateAccuracy', visible: false},
    {field: 'unit.abundanceString', visible: true, sortBy: false},
    {field: 'unit.lifeStage', visible: false, translation: 'observation.form.lifeStage'},
    {field: 'unit.sex', visible: false, translation: 'observation.form.sex'},
    {field: 'unit.recordBasis', visible: false, translation: 'observation.filterBy.recordBasis'},
    {field: 'unit.nativeOccurrence', visible: false},
    {field: 'document.collectionId', visible: false},
    {field: 'unit.notes', visible: false, sortBy: false},
    {field: 'document.documentId', visible: false, skip: true},
    {field: 'document.secureLevel', visible: false},
    {field: 'document.secureReasons', visible: false, sortBy: false},
    {field: 'document.sourceId', visible: false, async: true}
  ];

  public result: PagedResult<any>;

  public loading = true;
  public shownDocument = '';
  public highlightId = '';
  public page = 1;
  public pageSize = 20;

  private subFetch: Subscription;
  private subUpdate: Subscription;
  private subTrans: Subscription;
  private lastQuery: string;
  private resultCache: PagedResult<any>;

  constructor(private warehouseService: WarehouseApi,
              private decorator: ValueDecoratorService,
              private translate: TranslateService,
              private logger: Logger,
              public searchQuery: SearchQuery
  ) {
  }

  ngOnInit() {
    if (!this.userColumns || this.userColumns.length === 0) {
      this.updateUserCols();
    }
    this.result = {
      total: this.page * this.pageSize,
      pageSize: this.pageSize,
      currentPage: this.page,
      results: []
    };
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        if (this.resultCache) {
          this.result = this.prepareData(Util.clone(this.resultCache), this.columns.map(col => col.field));
        }
      }
    );
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.fetchRows(this.page);
      }
    );
    this.fetchRows(this.page);
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
    const current = JSON.stringify(this.userColumns);
    this.userColumns = this.columns.filter((col) => col.visible !== false);
    return current !== JSON.stringify(this.userColumns);
  }

  pageChanged(event: any): void {
    if (this.page !== event.page) {
      this.fetchRows(event.page);
    }
  }

  fetchRows(page: number, forceUpdate = false): void {
    const query = Util.clone(this.searchQuery.query);
    if (!forceUpdate) {
      const cache = [
        JSON.stringify(query),
        page
      ].join(':');
      if (this.lastQuery === cache) {
        return;
      }
      this.lastQuery = cache;
    }
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }
    if (Object.keys(query).length === 0) {
      query.includeNonValidTaxa = false;
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    query.selected = this.userColumns.reduce((total, column) => {
      if (column.skip !== false) {
        total.push(column.field);
      }
      return total;
    }, ['document.documentId', 'unit.unitId']);
    const sort = this.userColumns.reduce((prev, cur) => {
      if (!cur.sort || cur.sortBy === false) {
        return prev;
      }
      const field = '' + (cur.sortBy || cur.field);
      const cols = field.split(',').map((value) => {
        return value + ' ' + cur.sort;
      });
      return [...cols, ...prev];
    }, []);
    this.loading = true;
    this.subFetch = this.warehouseService
      .warehouseQueryListGet(
        query,
        query.selected,
        sort.length > 0 ? sort : undefined,
        this.pageSize,
        page)
      .do(result => this.resultCache = Util.clone(result))
      .map(result => this.prepareData(result, query.selected))
      .subscribe(
        results => {
          this.page = results.currentPage || 1;
          this.result = results;
          this.loading = false;
          this.searchQuery.updateUrl([
            'selected',
            'pageSize',
            'page'
          ]);
          this.onSettingsOpen();
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
    this.fetchRows(this.page, true);
  }

  prepareData(data, fields) {
    if (!data.results) {
      return data;
    }
    const selLen = fields.length;
    const results: any = [];
    const len = data.results.length;
    this.decorator.lang = this.translate.currentLang;
    for (let i = 0; i < len; i++) {
      results[i] = {};
      for (let j = 0; j < selLen; j++) {
        results[i][fields[j]] = this.getData(data.results[i], fields[j]);
      }
    }
    data.results = results;
    return data;
  }

  getData(row: any, propertyName: string): string {
    let val = '';
    const first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
      val = this.decorator.decorate(first, val, row);
    } catch (e) {
    }
    return val;
  }

  onSettingsClose() {
    if (this.updateUserCols()) {
      this.fetchRows(this.page, true);
    }
  }

  onSettingsOpen() {
    this.columns.map((col, idx) => {
      const userCol = this.userColumns.filter((src) => src.field === col.field);
      if (userCol.length !== 1) {
        this.columns[idx].visible = false;
        return;
      }
      this.columns[idx].visible = typeof userCol[0].visible === 'undefined' || userCol[0].visible;
    });
  }

  showDocument(row) {
    this.shownDocument = row['document.documentId'];
    this.highlightId = row['unit.unitId'];
    this.modal.show();
  }

  toggleColumn(col: Column) {
    col.visible = !col.visible;

    // ngx-bootstrap has a bug wher it's not triggering onHidden event as expected
    // when that's fixed this line can be removed
    this.onSettingsClose();
  }
}
