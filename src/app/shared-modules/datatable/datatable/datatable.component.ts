
import {take,  map, tap, share, debounceTime } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  NgZone,
  PLATFORM_ID,
  Inject, OnDestroy, OnInit
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { of as ObservableOf, Subject, Subscription, Observable } from 'rxjs';
import { CacheService } from '../../../shared/service/cache.service';
import { Annotation } from '../../../shared/model/Annotation';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { isPlatformBrowser } from '@angular/common';
import { Logger } from '../../../shared/logger/logger.service';
import { FilterByType, FilterService } from '../../../shared/service/filter.service';

const CACHE_COLUMN_SETTINGS = 'datatable-col-width';

interface Settings {[key: string]: DatatableColumn; }

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent implements AfterViewInit, OnInit, OnDestroy {

  private static settings: Settings;

  @ViewChild('dataTable', { static: false }) public datatable: NgxDatatableComponent;
  @ViewChild('dataTableTemplates', { static: true }) public datatableTemplates: DatatableTemplatesComponent;

  @Input() loading = false;
  @Input() pageSize: number;
  @Input() height = '100%';
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
  @Input() getRowClass: (row: any) => any;
  @Input() selectionType: SelectionType;

  // Initialize datatable row selection with some index
  _preselectedRowIndex = -1;
  _filterBy: FilterByType;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() reorder = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<{documentId: string, unitId: string}>();

  annotationTypes = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;

  filterByChange: Subscription;

  _originalRows: any[];
  _rows: any[];
  _page: number;
  _count: number;
  _offset: number;
  _columns: DatatableColumn[] = []; // This needs to be initialized so that the data table would do initial sort!
  selected: any[] = [];

  initialized = false;
  private filterChange$ = new Subject();
  private settings$: Observable<Settings>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cacheService: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: Logger,
    private filterService: FilterService,
    private zone: NgZone
  ) {
    this.settings$ = DatatableComponent.settings ?
      ObservableOf(DatatableComponent.settings).pipe(share()) :
      this.cacheService.getItem(CACHE_COLUMN_SETTINGS)
        .pipe(
          map(value => value || {}),
          tap(value => DatatableComponent.settings = value as Settings),
          share()
        );
  }

  @Input() set count(cnt: number) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
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
      this.scrollTo();
    }
  }

  @Input() set page(page: number) {
    this._page = page;
    this._offset = page - 1;
  }

  @Input() set columns(columns: DatatableColumn[]) {
    this.settings$.subscribe(settings => {
      this._columns = columns.map((column) => {
        if (typeof column.headerTemplate === 'string') {
          column.headerTemplate = this.datatableTemplates[column.headerTemplate];
        }
        if (!column.headerTemplate) {
          column.headerTemplate = this.datatableTemplates.dafaultHeader;
        }
        if (typeof column.cellTemplate === 'string') {
          column.cellTemplate = this.datatableTemplates[column.cellTemplate];
        }
        if (!column.prop) {
          column.prop = column.name;
        }
        if (settings && settings[column.name] && settings[column.name].width) {
          column.width = settings[column.name].width;
        }
        if (this.resizable === false) {
          column.resizeable = false;
        }
        return column;
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  @Input() set preselectedRowIndex(index: number) {
    this._preselectedRowIndex = index;
    this.selected = [this._rows[this._preselectedRowIndex]] || [];
    if (!this.selected.length) {
      return;
    }
    this.showActiveRow();
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
      this.scrollTo(Math.min(scrollTo, maxScroll));
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
    this.filterByChange = this.filterChange$.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.updateFilteredRows();
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initialized = true;

      // Make sure that preselected row index setter is called after initialization
      this.showActiveRow();
    }
  }

  ngOnDestroy() {
    if (this.filterByChange) {
      this.filterByChange.unsubscribe();
    }
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      if (this._rows) {
        this._rows = [...this._rows];
        this.changeDetectorRef.markForCheck();
      }
    });
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
      DatatableComponent.settings[event.column.name] = {width: event.newValue};
      this.cacheService.setItem(CACHE_COLUMN_SETTINGS, DatatableComponent.settings)
        .subscribe(() => {}, () => {});
    }
  }

  private updateFilteredRows() {
    this._rows = this._filterBy ? this.filterService.filter(this._originalRows, this._filterBy) : this._originalRows;
    this._count = this._rows.length;
    this._page = 1;
    this.scrollTo();
  }

  private scrollTo(offsetY: number = 0) {
    if (!isPlatformBrowser(this.platformId) || !this._rows) {
      return;
    }
    setTimeout(() => {
      try {
        if (this.datatable && this.datatable.bodyComponent && this.datatable.bodyComponent.scroller) {
          this.datatable.bodyComponent.scroller.setOffset(offsetY);
          this.datatable.bodyComponent.scroller.updateOffset();
          this.datatable.bodyComponent.onBodyScroll({scrollYPos: offsetY, scrollXPos: this.datatable.bodyComponent.offsetX || 0});
        }
      } catch (e) {
        this.logger.info('selected row index failed', e);
      }
    });
  }
}
