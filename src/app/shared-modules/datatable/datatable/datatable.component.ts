import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  PLATFORM_ID,
  Inject, OnDestroy, OnInit
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { interval as ObservableInterval, of as ObservableOf, Subject, Subscription, Observable } from 'rxjs';
import { map, tap, share, debounceTime } from 'rxjs/operators';
import { CacheService } from '../../../shared/service/cache.service';
import { Annotation } from '../../../shared/model/Annotation';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { isPlatformBrowser } from '@angular/common';
import { Logger } from '../../../shared/logger/logger.service';
import { FilterByType, FilterService } from '../../../shared/service/filter.service';

const CACHE_COLUMN_SETINGS = 'datatable-col-width';

interface Settings {[key: string]: DatatableColumn}

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent implements AfterViewInit, OnInit, OnDestroy {

  private static settings: Settings;

  @ViewChild('dataTable') public datatable: NgxDatatableComponent;
  @ViewChild('dataTableTemplates') public datatableTemplates: DatatableTemplatesComponent;

  @Input() loading = false;
  @Input() pageSize: number;
  @Input() height = '100%';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() sortType = 'multi';
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';
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
  _columns: DatatableColumn[];
  selected: any[] = [];

  initialized = false;
  private filterChange$ = new Subject();
  private settings$: Observable<Settings>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cacheService: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: Logger,
    private filterService: FilterService
  ) {
    this.settings$ = DatatableComponent.settings ?
      ObservableOf(DatatableComponent.settings).pipe(share()) :
      this.cacheService.getItem<Settings>(CACHE_COLUMN_SETINGS)
        .pipe(
          map(value => value || {}),
          tap(value => DatatableComponent.settings = value),
          share()
        )
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
      this.updateFilter();
    } else {
      this._rows = this._originalRows;
    }
  }

  @Input() set page(page: number) {
    this._page = page;
    this._offset = page - 1;
  };

  @Input() set columns(columns: DatatableColumn[]) {
    this.settings$.subscribe(settings => {
      this._columns = columns.map((column) => {
        if (!column.headerTemplate) {
          column.headerTemplate = this.datatableTemplates.header;
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
    if (this.initialized) {
      this.selected = [this._rows[this._preselectedRowIndex]] || [];
      if (this.selected.length > 0) {
        // wait until datatable initialization is complete (monkey patched) before scrolling
        const sub = this.datatable.initializationState.subscribe({complete: () => {
          // find the index in datatable internal sorted array that corresponds to selected index in input data
          const postSortIndex = this.datatable._internalRows.findIndex((element) => {
            return element.preSortIndex === this._preselectedRowIndex;
          });
          // Calculate relative position of selected row and scroll to it
          const scrollAmount = (this.datatable.bodyComponent.scrollHeight / this._rows.length) * postSortIndex;
          this.scrollTo(scrollAmount);
          sub.unsubscribe();
        }});
      }
    }
  }

  /**
   * Filters data in the table.
   *
   * Please note that this should not be used when external pagination is used!
   *
   * @param filterBy
   */
  @Input() set filterBy(filterBy: FilterByType) {
    this._filterBy = filterBy;
    this.filterChange$.next();
  }

  ngOnInit() {
    this.filterByChange = this.filterChange$.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.updateFilter();
      this.changeDetectorRef.markForCheck();
    })
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.datatable.recalculate();
        this.initialized = true;

        // Make sure that preselected row index setter is called after initialization
        if (this._preselectedRowIndex > -1) {
          this.preselectedRowIndex = this._preselectedRowIndex;
        }
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.filterByChange) {
      this.filterByChange.unsubscribe();
    }
  }

  onRowSelect(event) {
    if (event.type === 'click' || event.type === 'dblClick') {
      this.rowSelect.emit(event);
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
      this.cacheService.setItem<Settings>(CACHE_COLUMN_SETINGS, DatatableComponent.settings)
        .subscribe(() => {}, () => {});
    }
  }

  private updateFilter() {
    this._rows = this._filterBy ? this.filterService.filter(this._originalRows, this._filterBy) : this._originalRows;
    this._count = this._rows.length;
    this._page = 1;
    this.scrollTo();
  }

  private scrollTo(offsetY: number = 0) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      try {
        this.datatable.bodyComponent.scroller.setOffset(offsetY);
        this.datatable.bodyComponent.scroller.updateOffset();
      } catch (e) {
        this.logger.info('selected row index failed', e)
      }
    });
  }
}
