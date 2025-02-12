import { debounceTime, tap, map } from 'rxjs/operators';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DatatableColumn, DatatableSort } from '../model/datatable-column';
import { ColumnMode, DatatableComponent as NgxDatatableComponent, SelectionType, SortType, orderByComparator } from '@achimha/ngx-datatable';
import { Observable, Subject, Subscription, of, forkJoin } from 'rxjs';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { Logger } from '../../../shared/logger/logger.service';
import { FilterByType, FilterService } from '../../../shared/service/filter.service';
import { LocalStorage } from 'ngx-webstorage';
import { PlatformService } from '../../../root/platform.service';
import { DatatableUtil } from '../service/datatable-util.service';
import { Util } from '../../../shared/service/util.service';

interface Settings { [key: string]: DatatableColumn }

interface DatatableRow {
  [key: string]: any;
  preSortIndex: number;
}

type DatatableTemplate = keyof DatatableTemplatesComponent;

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
  @ViewChild('dataTable') public datatable?: NgxDatatableComponent;
  @ViewChild('dataTableTemplates', { static: true }) public datatableTemplates!: DatatableTemplatesComponent;

  @Input() loading? = false;
  @Input() pageSize?: number;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() sortType: SortType = SortType.multi;
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';
  @Input() emptyMessage = '';
  @Input() clientSideSorting = false;
  @Input() columnMode: ColumnMode | keyof typeof ColumnMode = 'force';
  @Input() resizable = true;
  @Input() showRowAsLink = true;
  @Input() rowHeight: number | 'auto' | ((row?: any) => number) = 35;
  @Input() sorts: DatatableSort[] = [];
  @Input() getRowClass?: (row: DatatableRow) => any;
  @Input() selectionType?: SelectionType;
  @Input() summaryRow = false;
  @Input() striped = true;

  // Initialize datatable row selection with some index
  _preselectedRowIndex = -1;
  _filterBy?: FilterByType;
  _height = '100%';
  _isFixedHeight = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() reorder = new EventEmitter<any>();
  @Output() datatableSelect = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();

  filterByChange?: Subscription;

  _originalRows?: DatatableRow[];
  _rows?: DatatableRow[];
  _page?: number;
  _count?: number;
  _offset?: number;
  _columns: DatatableColumn[] = []; // This needs to be initialized so that the data table would do initial sort!
  @Input() selected: DatatableRow[] = [];

  initialized = false;
  sortLoading = false;
  private filterChange$ = new Subject();

  private sortTemplates: Record<string, DatatableTemplate> = {};
  private sortValues: Record<number, Record<string, any>> = {};
  private sortSub?: Subscription;

  @LocalStorage('data-table-settings', {}) private dataTableSettings!: Settings;

  _getRowClass = (row: any) => {
    if (this.getRowClass) {
      const rowClass = this.getRowClass(row);
      if (rowClass) {
        return rowClass;
      }
    }

    return {
      link: this.showRowAsLink,
      issues:
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
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private platformService: PlatformService,
    private logger: Logger,
    private filterService: FilterService,
    private zone: NgZone,
    private dtUtil: DatatableUtil
  ) {}

  @Input() set height(height: string) {
    this._height = height;
    this._isFixedHeight = height.substr(height.length - 2, 2).includes('px');
  }

  @Input() set count(cnt: number|undefined) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
  }

  @Input() set rows(rows: Record<string, any>[] | null) {
    this._originalRows = rows as any || [];

    // record the original indexes of each row element so that when the table is sorted
    // we can find out how the indexes were mapped
    this._originalRows?.forEach((element, idx) => {
      element.preSortIndex = idx;
    });
    this.sortValues = {};

    if (this._filterBy) {
      this.updateFilteredRows();
    } else {
      this._rows = this._originalRows;
    }
    if (this._preselectedRowIndex !== undefined && this._preselectedRowIndex !== -1) {
      this.preselectedRowIndex = this._preselectedRowIndex;
    } else {
      this.scrollTo();
    }

    this.sortRows(this.sorts);

    // fixes the horizontal scroll of column headers and rows being unsynced
    // when rows are updated after horizontally scrolling the datatable
    setTimeout(() => this.scrollTo());
  }

  @Input() set page(page: number|undefined) {
    this._page = page;
    this._offset = typeof page === 'number' ? page - 1 : undefined;
  }

  @Input() set columns(columns: DatatableColumn[]) {
    const settings = this.dataTableSettings;

    this._columns = columns.map(c => {
      const column = {...c};
      if (!column.prop) {
        column.prop = column.name;
      }
      if (typeof column.headerTemplate === 'string') {
        column.headerTemplate = this.datatableTemplates[column.headerTemplate as DatatableTemplate];
      }
      if (!column.headerTemplate) {
        column.headerTemplate = this.datatableTemplates.dafaultHeader;
      }
      if (typeof column.cellTemplate === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.sortTemplates[column.prop!] = column.cellTemplate as DatatableTemplate;
        column.cellTemplate = this.datatableTemplates[column.cellTemplate as DatatableTemplate];
      }
      if (column.sortTemplate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.sortTemplates[column.prop!] = column.sortTemplate as DatatableTemplate;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (settings && settings[column.name!] && settings[column.name!].width) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        column.width = settings[column.name!].width;
      }
      if (this.resizable === false) {
        column.resizeable = false;
      }
      return column;
    });

  }

  @Input() set preselectedRowIndex(index: number) {
    this._preselectedRowIndex = index;
    const postSortIndex = (this._rows || []).findIndex((element) => element.preSortIndex === this._preselectedRowIndex);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.selected = [this._rows![postSortIndex]] || []; // TODO should be fixed
    if (!this.selected.length) {
      return;
    }
    if (this.initialized) {
      this.showActiveRow();
    }
  }

  showActiveRow() {
    if (!this.initialized || this._preselectedRowIndex === -1 || !this.datatable || !this.datatable._internalRows) {
      return;
    }
    const postSortIndex = (this._rows || []).findIndex((element) => element.preSortIndex === this._preselectedRowIndex);
    // Calculate relative position of selected row and scroll to it
    const rowHeight = this.datatable.bodyComponent.rowHeight as number;
    const scrollTo = rowHeight * postSortIndex;
    const maxScroll = rowHeight * this.datatable._internalRows.length - this.datatable.bodyHeight;
    const currentOffset = this.datatable.bodyComponent.offsetY;
    if (!isNaN(scrollTo) && (scrollTo < currentOffset || scrollTo > currentOffset + this.datatable.bodyHeight)) {
      this.scrollTo(Math.min(scrollTo, maxScroll));
    }
  }

  /**
   * Filters data in the table.
   *
   * Please note that this should not be used when external pagination is used!
   */
  @Input() set filterBy(filterBy: FilterByType|undefined) {
    this._filterBy = filterBy;
    this.filterChange$.next();
  }

  ngOnInit() {
    this.filterByChange = this.filterChange$.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.updateFilteredRows();
      this.changeDetectorRef.markForCheck();
    });

  }

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {

      // All action after initialization should be done after timeout, so
      // individual methods don't have to care about  synchronization problems.
      setTimeout(() => {
        this.initialized = true;
        // Make sure that preselected row index setter is called after initialization
        this.showActiveRow();
      }, 10);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.sorts) {
      this.sortRows(this.sorts);
    }
  }

  ngOnDestroy() {
    if (this.filterByChange) {
      this.filterByChange.unsubscribe();
    }
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }
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
    if (this.platformService.isServer || !this.datatable) {
      return;
    }
    this.datatable.bodyComponent.onBodyScroll({scrollXPos: 0, scrollYPos: 0});
  }

  onResize(event: any) {
    if (event && event.column && event.column.name && event.newValue) {
      this.dataTableSettings = {...this.dataTableSettings, [event.column.name]: {width: event.newValue}};
    }
  }

  onSort(event: any) {
    this.sorts = this.updateSorts(event);
    this.sortRows(this.sorts);
    this.changeDetectorRef.detectChanges();
    this.sortChange.emit({
      ...event,
      sorts: this.sorts
    });
  }

  //This changes the sorting so that the last column added to sorting gets priority, but probably only as long as the
  //underlying ngx-datatable uses external sorting
  private updateSorts(event: any) {
    if (!event.newValue) {
      return this.sorts.filter(sort => sort.prop !== event.column.prop);
    }

    const idx = this.sorts.findIndex(sort => sort.prop === event.column.prop);
    if (idx > -1) {
      return this.sorts.map(sort => {
        if (sort.prop === event.column.prop) {
          return {
            prop: sort.prop,
            dir: event.newValue
          };
        }

        return sort;
      });
    }

    return [
      {
        prop: event.column.prop,
        dir: event.newValue
      },
      ...this.sorts
    ];
  }

  private updateFilteredRows() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._rows = this._filterBy ? this.filterService.filter(this._originalRows!, this._filterBy) : this._originalRows;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._count = this._rows!.length;
    this._page = 1;
    this.scrollTo();
    this.sortRows(this.sorts);
  }

  private scrollTo(offsetY: number = 0) {
    if (this.platformService.isServer || !this._rows) {
      return;
    }
    try {
      if (this.datatable && this.datatable.bodyComponent && this.datatable.bodyComponent.scroller) {
        this.datatable.bodyComponent.scroller.setOffset(offsetY);
        this.datatable.bodyComponent.scroller.updateOffset();
        this.datatable.bodyComponent.onBodyScroll({scrollYPos: offsetY, scrollXPos: this.datatable.bodyComponent.offsetX || 0});
      }
    } catch (e) {
      this.logger.info('selected row index failed', e);
    }
  }

  private sortRows(sorts: DatatableSort[] = []) {
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }

    if (this.clientSideSorting && this._rows) {
      this.sortLoading = true;
      this.sortSub = this.sort(sorts, this._rows)
      .subscribe(sortedRows => {
          this._rows = sortedRows;
          this.sortLoading = false;
          this.changeDetectorRef.markForCheck();
        }
      );
    } else {
      this.sortLoading = false;
    }
  }

  private sort(sorts: DatatableSort[], rows: DatatableRow[]): Observable<DatatableRow[]> {
    return this.setSortValues(sorts, rows)
      .pipe(map(() => {
        if (sorts.length > 0) {
          return this.customSort(sorts, rows);
        } else {
          return this.defaultSort(rows);
        }
      })
    );
  }

  private setSortValues(sorts: DatatableSort[], rows: DatatableRow[]): Observable<any[]> {
    const observables = sorts.reduce((arr: Observable<any>[], sort: DatatableSort) => {
      const template = this.sortTemplates[sort.prop];
      rows.forEach((row) => {
        if (!this.sortValues[row.preSortIndex]) {
          this.sortValues[row.preSortIndex] = {};
        }

        if (this.sortValues[row.preSortIndex][sort.prop] == null) {
          const rowValue = Util.parseJSONPath(row, sort.prop);

          if (!template || rowValue == null) {
            this.sortValues[row.preSortIndex][sort.prop] = rowValue;
          } else {
            arr.push(
              this.dtUtil.getVisibleValue(rowValue, row, template)
                .pipe(tap(val => {
                  this.sortValues[row.preSortIndex][sort.prop] = val;
                }))
            );
          }
        }
      });
      return arr;
    }, []);

    return (observables.length > 0 ? forkJoin(observables) : of([]));
  }

  private customSort(sorts: DatatableSort[], rows: DatatableRow[]): DatatableRow[] {
    return [...rows].sort((a: any, b: any) => {
      for (const sort of sorts) {
        const dir = sort.dir === 'asc' ? 1 : -1;
        const aa = this.sortValues[a.preSortIndex]?.[sort.prop] || a[sort.prop];
        const bb = this.sortValues[b.preSortIndex]?.[sort.prop] || b[sort.prop];
        const comparison = dir * orderByComparator(aa, bb);

        if (comparison !== 0) {
          return comparison;
        }
      }

      return a.preSortIndex < b.preSortIndex ? -1 : 1;
    });
  }

  private defaultSort(rows: DatatableRow[]): DatatableRow[] {
    return [...rows].sort((a: any, b: any) => a.preSortIndex < b.preSortIndex ? -1 : 1);
  }
}
