import { debounceTime } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Subject, Subscription } from 'rxjs';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { Logger } from '../../../shared/logger/logger.service';
import { FilterByType, FilterService } from '../../../shared/service/filter.service';
import { LocalStorage } from 'ngx-webstorage';
import { PlatformService } from '../../../shared/service/platform.service';
import { DocumentViewerFacade } from '../../document-viewer/document-viewer.facade';
import { FormService } from '../../../shared/service/form.service';
import { RowDocument } from '../../../shared-modules/own-submissions/own-datatable/own-datatable.component';
import { ObservationTableColumn } from '../../observation-result/model/observation-table-column';
import { IColumns } from '../../datatable/service/observation-table-column.service';
import {
  IColumnGroup,
  TableColumnService
} from '../../datatable/service/table-column.service';

interface Settings {[key: string]: DatatableColumn; }
@Component({
  selector: 'laji-datatable-own-submissions',
  templateUrl: './datatable-own-submissions.component.html',
  styleUrls: ['./datatable-own-submissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableOwnSubmissionsComponent implements OnInit {

  @ViewChild('dataTable') public datatable: NgxDatatableComponent;
  @ViewChild('dataTableTemplates', { static: true }) public datatableTemplates: DatatableTemplatesComponent;

  @Input() loading = false;
  @Input() pageSize: number;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() sortType = 'multi';
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';
  @Input() emptyMessage = '';
  @Input() clientSideSorting = false;
  @Input() columnMode = 'force';
  @Input() resizable = true;
  @Input() showRowAsLink = true;
  @Input() rowHeight = 35;
  @Input() sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  @Input() actions: string[] | [] = ['edit', 'view'];
  @Input() getRowClass: (row: any) => any;
  @Input() selectionType: SelectionType;

  // Initialize datatable row selection with some index
  _preselectedRowIndex = -1;
  _filterBy: FilterByType;
  _height = '100%';
  _isFixedHeight = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() reorder = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();

  filterByChange: Subscription;

  _originalRows: any[];
  _rows: RowDocument[];
  _page: number;
  _count: number;
  _offset: number;
  _columns: any[] = []; // This needs to be initialized so that the data table would do initial sort!
  _columns_new = [];
  @Input() selected: any[] = [];

  initialized = false;
  private filterChange$ = new Subject();
  allColumns: ObservationTableColumn[];
  private lastSort: any;
  @LocalStorage('data-table-settings', {}) private dataTableSettings: Settings;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private platformService: PlatformService,
    private logger: Logger,
    private filterService: FilterService,
    private zone: NgZone,
    private documentViewerFacade: DocumentViewerFacade,
    public formService: FormService,
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>
  ) {
    this.allColumns = tableColumnService.getAllColumns();
  }

  @Input() set height(height: string) {
    this._height = height;
    this._isFixedHeight = height.substr(height.length - 2, 2).includes('px');
  }

  @Input() set count(cnt: number) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
  }

  @Input() set columns(columns: any[]) {
    const settings = this.dataTableSettings;
    this._columns = columns;
  }

  @Input() set rows(rows: any[]) {
    this._originalRows = rows || [];

    // record the original indexes of each row element so that when the table is sorted
    // we can find out how the indexes were mapped
    this._originalRows.forEach((element, idx) => {
      element.preSortIndex = idx;
    });

    if (this._filterBy) {
      this.updateFilteredRows();
    } else {
      this._rows = this._originalRows;
    }
    if (this._preselectedRowIndex !== undefined && this._preselectedRowIndex !== -1) {
      this.preselectedRowIndex = this._preselectedRowIndex;
    } else {
      // this.scrollTo();
    }
  }

  @Input() set page(page: number) {
    this._page = page;
    this._offset = page - 1;
  }

 

  @Input() set preselectedRowIndex(index: number) {
    this._preselectedRowIndex = index;
    this.selected = [this._rows[this._preselectedRowIndex]] || [];
    if (!this.selected.length) {
      return;
    }
    if (this.initialized) {
      //this.showActiveRow();
    }
  }

  showActiveRow() {
    if (!this.initialized || this._preselectedRowIndex === -1 || !this.datatable || !this.datatable._internalRows) {
      return;
    }
    const postSortIndex = this.datatable._internalRows.findIndex((element) => {
      return element.preSortIndex === this._preselectedRowIndex;
    });
    // Calculate relative position of selected row and scroll to it
    const rowHeight = this.datatable.bodyComponent.rowHeight as number;
    const scrollTo = rowHeight * postSortIndex;
    const maxScroll = rowHeight * this.datatable._internalRows.length - this.datatable.bodyHeight;
    const currentOffset = this.datatable.bodyComponent.offsetY;
    if (!isNaN(scrollTo) && (scrollTo < currentOffset || scrollTo > currentOffset + this.datatable.bodyHeight)) {
      //this.scrollTo(Math.min(scrollTo, maxScroll));
    }
  }

  /**
   * Filters data in the table.
   *
   * Please note that this should not be used when external pagination is used!
   */
  @Input() set filterBy(filterBy: FilterByType) {
    this._filterBy = filterBy;
    this.filterChange$.next();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {

      // All action after initialization should be done after timeout, so
      // individual methods don't have to care about  synchronization problems.
      setTimeout(() => {
        this.initialized = true;
        // Make sure that preselected row index setter is called after initialization
        //this.showActiveRow();
      }, 10);
    }
  }

  ngOnDestroy() {
    if (this.filterByChange) {
      this.filterByChange.unsubscribe();
    }
  }

  onSort(event) {
    this.lastSort = event;
    const rows = [...this._rows];
    event.sorts.forEach((sort) => {
      const comparator = this.comparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * comparator(a[sort.prop], b[sort.prop]));
    });
    this._rows = rows;
  }

  /**
   * When using comparator input these functions are called all the time! Preventing buttons and events from firing
   *
   * @returns any
   */
  comparator(prop) {
    if (prop === 'dateObserved') {
      return (a, b) => {
        a = (a || '').split('-')[0].trim().split('.').reverse().join('');
        b = (b || '').split('-')[0].trim().split('.').reverse().join('');
        return b - a;
      };
    } else if (prop === 'dateEdited') {
      return (a, b) => {
        a = (a || '').split(' ');
        b = (b || '').split(' ');
        a = a.length > 1 ?
          a[0].trim().split('.').reverse().join('') + a[1].replace(':', '') :
          a[0].trim().split('.').reverse().join('');
        b = b.length > 1 ?
          b[0].trim().split('.').reverse().join('') + b[1].replace(':', '') :
          b[0].trim().split('.').reverse().join('');
        return b - a;
      };
    } else if (prop === 'unitCount') {
      return (a, b) => b - a;
    }
    return (a, b) => {
      return ('' + a).localeCompare('' + b);
    };
  }

  getDefaultSort() {
    if (this._columns && this._columns.length > 0) {
      return [{prop: this._columns[0].prop, dir: 'asc'}];
    }
    return [{ prop: 'dateEdited', dir: 'asc' }];
  }

  onRowSelect(event) {
    if (event.type === 'click' || event.type === 'dblClick') {
      this.zone.run(() => {
        this.rowSelect.emit(event);
      });
    }
  }

  onPage(event) {
    if (this.loading) {
      return;
    }
    this.pageChange.emit(event);
  }

  refreshTable() {
    if (this.platformService.isServer) {
      return;
    }
    if (this._rows) {
      this._rows = [...this._rows];
      this.changeDetectorRef.markForCheck();
    }
  }

  _getRowClass(row) {
    if (this.getRowClass) {
      const rowClass = this.getRowClass(row);
      if (rowClass) {
        return rowClass;
      }
    }

    return {
      'link': this.showRowAsLink,
      'issues':
        !!(row.document && row.document.quality && row.document.quality.issue) ||
        !!(row.gathering && row.gathering.quality && (
          row.gathering.quality.issue ||
          row.gathering.quality.locationIssue ||
          row.gathering.quality.timeIssue
        )) ||
        !!(row.unit && row.unit.quality && (
          row.unit.quality.documentGatheringUnitQualityIssues ||
          row.unit.quality.issue
        ))
    };
  }

  onResize(event) {
    if (event && event.column && event.column.name && event.newValue) {
      this.dataTableSettings = {...this.dataTableSettings, [event.column.name]: {width: event.newValue}};
    }
  }

  showDocument(id: string) {
    this.documentViewerFacade.showDocumentID({
      document: id
    });
  }

  private updateFilteredRows() {
    this._rows = this._filterBy ? this.filterService.filter(this._originalRows, this._filterBy) : this._originalRows;
    this._count = this._rows.length;
    this._page = 1;
    //this.scrollTo();
  }

}
