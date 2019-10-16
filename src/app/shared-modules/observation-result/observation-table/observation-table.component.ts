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
import { ObservationListService } from '../service/observation-list.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ObservationTableColumn } from '../model/observation-table-column';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { DatatableComponent } from '../../datatable/datatable/datatable.component';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import {
  IColumnGroup,
  ObservationResultListService
} from '../../../+observation/result-list/observation-result-list.service';

@Component({
  selector: 'laji-observation-table',
  templateUrl: './observation-table.component.html',
  styleUrls: ['./observation-table.component.css'],
  providers: [ObservationListService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable', { static: true }) public datatable: DatatableComponent;
  @ViewChild('settingsModal', { static: true }) public modalRef: ModalDirective;

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() showPageSize = true;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() defaultOrder: string;
  @Input() visible: boolean;
  @Input() allAggregateFields = [
    'unit.species',
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
  columnGroups: IColumnGroup[];

  private numberFields = ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum', 'pairCountSum'];

  private modalSub: Subscription;
  private fetchSub: Subscription;
  private queryKey: string;
  private aggregateBy: string[] = [];

  @Input() showRowAsLink = true;

  constructor(
    private resultService: ObservationListService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private logger: Logger,
    private translate: TranslateService,
    private observationResultListService: ObservationResultListService
  ) {
    this.allColumns = observationResultListService.allColumns;
    this.columnGroups = observationResultListService.columnGroups;
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
      [...this.columnSelector.columns, 'count', ...this.numberColumnSelector.columns] :
      [...this.columnSelector.columns];

    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;
        if (!column.label) {
          column.label = 'result.' + column.name;
        }
        return column;
      });

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
    this.modalRef.show();
    this.modalSub = this.modalRef.onHide.subscribe((modal: ModalDirective) => {
      if (modal.dismissReason !== null) {
        this.columnSelector.columns = [...this._originalSelected];
        this.numberColumnSelector.columns = [...this._originalSelectedNumbers];
      }
      this.modalSub.unsubscribe();
    });
  }

  closeOkModal() {
    if (this.columnSelector.hasChanges || this.numberColumnSelector.hasChanges) {
      this.orderBy = [];
      this.selectChange.emit([...this.columnSelector.columns, ...this.numberColumnSelector.columns]);
    }
    this.modalRef.hide();
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
      this.useStatistics
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
        this.total.emit(data && data.total || 0);
        this.result = data;
        this.loading = false;
        // This needs to be markForCheck and not detectChanges otherwise observation table on taxon section will not work
        this.changeDetectorRef.markForCheck();
      }, (err) => {
        this.total.emit(0);
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.logger.error('Observation table data handling failed!', err);
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
}
