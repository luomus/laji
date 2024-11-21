import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent, SelectionType, SortType } from '@achimha/ngx-datatable';
import { Subject, Subscription } from 'rxjs';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { Logger } from '../../../shared/logger/logger.service';
import { FilterByType, FilterService } from '../../../shared/service/filter.service';
import { LocalStorage } from 'ngx-webstorage';
import { PlatformService } from '../../../root/platform.service';
import { DocumentViewerFacade } from '../../document-viewer/document-viewer.facade';
import { FormService } from '../../../shared/service/form.service';
import { RowDocument } from '../../own-submissions/own-datatable/own-datatable.component';
import { ObservationTableColumn } from '../../observation-result/model/observation-table-column';
import { IColumns } from '../service/observation-table-column.service';
import { TableColumnService } from '../service/table-column.service';

interface Settings {[key: string]: DatatableColumn }
@Component({
  selector: 'laji-datatable-own-submissions',
  templateUrl: './datatable-own-submissions.component.html',
  styleUrls: ['./datatable-own-submissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableOwnSubmissionsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('dataTable') public datatable?: NgxDatatableComponent;
  @ViewChild('dataTableTemplates', { static: true }) public datatableTemplates!: DatatableTemplatesComponent;

  @Input() loading = false;
  @Input({ required: true }) pageSize!: number;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() sortType: SortType = SortType.multi;
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';
  @Input() emptyMessage = '';
  @Input() clientSideSorting = false;
  @Input() columnMode = 'force';
  @Input() resizable = true;
  @Input() showRowAsLink = true;
  @Input() rowHeight = 35;
  @Input() sorts: {prop: string; dir: 'asc'|'desc'}[] = [];
  @Input() actions: string[] | [] = ['edit', 'view'];
  @Input() getRowClass?: (row: any) => any;
  @Input() selectionType?: SelectionType;

  // Initialize datatable row selection with some index
  _preselectedRowIndex = -1;
  _filterBy?: FilterByType;
  _height = '100%';
  _isFixedHeight = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() reorder = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();

  filterByChange?: Subscription;

  _originalRows!: any[];
  _rows!: RowDocument[];
  _page!: number;
  _count!: number;
  _offset!: number;
  _columns: any[] = []; // This needs to be initialized so that the data table would do initial sort!
  @Input() selected: any[] = [];

  initialized = false;
  displayMode?: string;
  private filterChange$ = new Subject();
  allColumns: ObservationTableColumn[];
  private lastSort: any;
  @LocalStorage('data-table-settings', {}) private dataTableSettings!: Settings;

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

  @Input({ required: true }) set count(cnt: number) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
  }

  @Input() set columns(columns: any[]) {
    this._columns = columns;
  }

  @Input({ required: true }) set rows(rows: any[]) {
    this._originalRows = rows || [];

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
    }
  }

  @Input({ required: true }) set page(page: number) {
    this._page = page;
    this._offset = page - 1;
  }

  @Input() set preselectedRowIndex(index: number) {
    this._preselectedRowIndex = index;
    this.selected = [this._rows[this._preselectedRowIndex]] || [];
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
    this.updateDisplayMode();
  }

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {

      // All action after initialization should be done after timeout, so
      // individual methods don't have to care about  synchronization problems.
      setTimeout(() => {
        this.initialized = true;
        // Make sure that preselected row index setter is called after initialization
        // this.showActiveRow();
      }, 10);
    }
  }

  ngOnDestroy() {
    if (this.filterByChange) {
      this.filterByChange.unsubscribe();
    }
  }

  onSort(event: any) {
    this.lastSort = event;
    const rows = [...this._rows];
    event.sorts.forEach((sort: any) => {
      const comparator = this.comparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * comparator(a[sort.prop as keyof RowDocument], b[sort.prop as keyof RowDocument]));
    });
    this._rows = rows;
  }

  /**
   * When using comparator input these functions are called all the time! Preventing buttons and events from firing
   *
   * @returns any
   */
  comparator(prop: string) {
    if (prop === 'dateObserved') {
      return (a: any, b: any) => {
        a = (a || '').split('-')[0].trim().split('.').reverse().join('');
        b = (b || '').split('-')[0].trim().split('.').reverse().join('');
        return b - a;
      };
    } else if (prop === 'dateEdited') {
      return (a: any, b: any) => {
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
      return (a: any, b: any) => b - a;
    }
    return (a: any, b: any) => ('' + a).localeCompare('' + b);
  }

  onRowSelect(event: any) {
    if (event.type === 'click' || event.type === 'dblClick') {
      this.zone.run(() => {
        this.rowSelect.emit(event);
      });
    }
  }

  onPage(event: any) {
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

  showDocument(id: string) {
    this.documentViewerFacade.showDocumentID({
      document: id
    });
  }

  toggleExpandRow(row: RowDocument) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.datatable!.rowDetail.toggleExpandRow(row);
  }

  private updateFilteredRows() {
    this._rows = this._filterBy ? this.filterService.filter(this._originalRows, this._filterBy) : this._originalRows;
    this._count = this._rows.length;
    this._page = 1;
  }

  private updateDisplayMode() {
    if (this.platformService.isServer) {
      return;
    }
    const width = window.innerWidth;

    if (width > 1150) {
      if (this.datatable) {
        this.datatable.rowDetail.collapseAllRows();
      }
      this.displayMode = 'large';
    } else if (width > 570) {
      this.displayMode = 'medium';
    } else {
      this.displayMode = 'small';
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateDisplayMode();
  }

}
