import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ObservationResultService } from '../service/observation-result.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ObservationTableColumn } from '../model/observation-table-column';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of, Subscription } from 'rxjs';
import { DatatableComponent } from '../../datatable/datatable/datatable.component';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import {
  IColumnGroup,
  TableColumnService
} from '../../datatable/service/table-column.service';
import { map, switchMap } from 'rxjs/operators';
import { ExportService } from '../../../shared/service/export.service';
import { BookType } from 'xlsx';
import { Global } from '../../../../environments/global';
import { IColumns } from '../../datatable/service/observation-table-column.service';
import { ObservationTableSettingsComponent } from './observation-table-settings.component';

@Component({
  selector: 'laji-observation-table',
  templateUrl: './observation-table.component.html',
  styleUrls: ['./observation-table.component.css'],
  providers: [ObservationResultService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable', { static: true }) public datatable: DatatableComponent;
  @ViewChild(ObservationTableSettingsComponent, { static: true }) public settingsModal: ObservationTableSettingsComponent;

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() showDownloadMenu = false;
  @Input() showPageSize = true;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() defaultOrder: string;
  @Input() visible: boolean;
  @Input() hideDefaultCountColumn = false;
  @Input() factInfo: boolean;
  @Input() allAggregateFields = [
    'unit.species',
    'unit.facts.value',
    'unit.linkings.taxon.vernacularName',
    'unit.linkings.taxon.scientificName',
    'unit.taxonVerbatim',
    'unit.linkings.taxon.taxonomicOrder',
    'document.collectionId',
    'document.sourceId',
    'unit.superRecordBasis',
    'unit.media.mediaType',
    'gathering.interpretations.biogeographicalProvinceDisplayname',
    'gathering.interpretations.municipalityDisplayname',
    'gathering.team.memberName',
    'pairCountSum'
  ];
  @Input() useStatistics: boolean;

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectChange = new EventEmitter<string[]>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() total = new EventEmitter<number>();

  maxDownload = Global.limit.simpleDownload;
  downloadLoading = false;
  lang: string;
  cache: any = {};
  orderBy: string[] = [];
  columnLookup = {};
  _originalSelected: string[] = [];
  _originalSelectedNumbers: string[] = [];

  columnSelector = new ColumnSelector;
  numberColumnSelector = new ColumnSelector;

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  loading: boolean;

  private langMap = {
    'fi': 'Finnish',
    'sv': 'Swedish',
    'en': 'English'
  };

  columns: ObservationTableColumn[] = [];
  allColumns: ObservationTableColumn[];
  columnGroups: IColumnGroup<IColumns>[][];

  private numberFields = ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum', 'pairCountSum'];

  private modalSub: Subscription;
  private fetchSub: Subscription;
  private queryKey: string;
  private aggregateBy: string[] = [];

  @Input() showRowAsLink = true;

  constructor(
    private resultService: ObservationResultService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private logger: Logger,
    private translate: TranslateService,
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private exportService: ExportService
  ) {
    this.allColumns = tableColumnService.getAllColumns();
    this.columnGroups = tableColumnService.getColumnGroups();
  }

  @Input() set selected(sel: string[]) {
    const selected = [];
    const selectedNumbers = [];
    sel.map(field => {
      if (this.numberFields.indexOf(field) > -1) {
        selectedNumbers.push(field);
      } else {
        if (this.allColumns.find((col) => col.name === field)) {
          selected.push(field);
        }
      }
    });

    this._originalSelected = [...selected];
    this._originalSelectedNumbers = [...selectedNumbers];

    this.columnSelector.columns       = selected;
    this.numberColumnSelector.columns = selectedNumbers;
  }

  @Input() set required(required: string[]) {
    this.columnSelector.required = required;
  }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.initColumns();
    this.fetchPage(this.page);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.initColumns();
      this.fetchPage(changes.page ? this.page : 1);
    }
    if ((changes.query && !changes.query.isFirstChange())
        || (changes.page && !changes.page.isFirstChange())
        || (changes.pageSize && !changes.pageSize.isFirstChange())) {
      this.fetchPage(changes.page ? this.page : 1);
    }
    if (changes.visible && this.visible) {
      this.refreshTable();
    }
  }

  refreshTable() {
    this.datatable.refreshTable();
  }

  initColumns() {
    const selected = this.isAggregate ?
      (this.hideDefaultCountColumn ?
        [...this.columnSelector.columns, ...this.numberColumnSelector.columns] :
        [...this.columnSelector.columns, 'count', ...this.numberColumnSelector.columns]) :
      [...this.columnSelector.columns];

    this.columnLookup = this.allColumns
      .reduce((prev, column) => {
        prev[column.name] = column;
        return prev;
      }, {});

    this.aggregateBy = [];

    this.columns = selected.map(name => {
      const column = this.columnLookup[name];
      if (column.aggregate !== false) {
        this.aggregateBy.push((column.aggregateBy || column.name)
          + (this.columnLookup[name].sortBy ? ',' + this.setLangParams(this.columnLookup[name].sortBy) : ''));
      }
      return this.columnLookup[name];
    });
  }

  openModal() {
    this.settingsModal.openModal();
  }

  onCloseSettingsModal(ok: boolean) {
    if (!ok) {
      this.columnSelector.columns = [...this._originalSelected];
      this.numberColumnSelector.columns = [...this._originalSelectedNumbers];
    } else if (this.columnSelector.hasChanges || this.numberColumnSelector.hasChanges) {
      this.orderBy = [];
      this.selectChange.emit([...this.columnSelector.columns, ...this.numberColumnSelector.columns]);
    }
  }

  onReorder(event) {
    if (
      !event.column ||
      !event.column.name ||
      !this.columnSelector.hasField(event.column.name) ||
      typeof event.newValue !== 'number' ||
      typeof event.prevValue !== 'number'
    ) {
      return;
    }
    this.columnSelector.moveFieldByIndex(event.prevValue, event.newValue);
    this.selectChange.emit([...this.columnSelector.columns, ...this.numberColumnSelector.columns]);
  }

  clear() {
    this.columnSelector.clear();
    this.numberColumnSelector.clear();
  }

  setPage(pageInfo) {
    this.fetchPage(pageInfo.offset + 1);
  }

  onSort(event) {
    this.orderBy = event.sorts.map(sort => {
      const col = this.columns.filter(column => column.prop === sort.prop)[0];
      if (!col) {
        return '';
      }
      const sortBy: string =  this.setLangParams(col.sortBy || '' + col.prop);
      return sortBy.split(',').map(val => val + ' ' + sort.dir.toUpperCase()).join(',');
    });
    this.fetchPage(this.page);
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  fetchPage(page = 1) {
    if (!this.pageSize) {
      return;
    }
    const queryKey = JSON.stringify(this.query) + [this.pageSize, page].join(':');
    if (this.loading && this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    const aggregate$ = this.resultService.getAggregate(
      this.query,
      [...this.aggregateBy, this.defaultOrder],
      page,
      this.pageSize,
      [...this.orderBy, this.defaultOrder],
      this.lang,
      this.useStatistics,
      this.factInfo ? this.factInfo : false
    );
    const list$ = this.resultService.getList(
      this.query,
      this.getSelectFields(this.columnSelector.columns, this.query),
      page,
      this.pageSize,
      [...this.orderBy, this.defaultOrder],
      this.lang
    );

    this.fetchSub = (this.isAggregate ? aggregate$ : list$)
      .subscribe(data => {
        if (this.factInfo) {
          this.setHabitatColumn(data, 'unit.facts.fact');
        }

        this.total.emit(data && data.total || 0);
        this.result = data;
        this.loading = false;
        // This needs to be markForCheck and not detectChanges otherwise observation table on taxon section will not work
        this.changeDetectorRef.markForCheck();
      }, () => {
        this.total.emit(0);
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.logger.error('Observation table data handling failed!', this.query);
      });
  }

  private getSelectFields(selected: string[], query: WarehouseQueryInterface) {
    const selects = selected.map(field => this.columnLookup[field].selectField || field);
    if (query.editorPersonToken || query.observerPersonToken || query.editorOrObserverPersonToken) {
      selects.push('document.quality,gathering.quality,unit.quality');
    }
    return selects;
  }

  private setLangParams(value: string) {
    return (value || '')
      .replace(/%longLang%/g, this.langMap[this.lang] || 'Finnish');
  }

  private setHabitatColumn(data: PagedResult<any>, value: string): PagedResult<any> {
    const filter = data.results.filter(item => {
      if (item.unit.facts.fact === 'http://tun.fi/MY.habitatIUCN') {
        delete item.unit.facts.fact;
        return item;
      }      
    })
    data.results = filter;
    data.total = filter.length;
    this.columns = this.columns.filter(r => {if (r.name !== value) return r});
    return data;
  }


  download(type: string) {
    this.downloadLoading = true;
    const columns = this.tableColumnService.getColumns(this._originalSelected);
    this.resultService.getAll(
      this.query,
      this.tableColumnService.getSelectFields(this.columnSelector.columns, this.query),
      [...this.orderBy, this.defaultOrder],
      this.lang
    ).pipe(
      switchMap(data => this.exportService.exportFromData(data, columns, type as BookType, 'laji-data'))
    ).subscribe(
      () => {
        this.downloadLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      (err) => this.logger.error('Simple download failed', err));
  }
}
