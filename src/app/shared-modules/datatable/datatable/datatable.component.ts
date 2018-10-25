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
  Inject
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { interval as ObservableInterval, of as ObservableOf } from 'rxjs';
import { CacheService } from '../../../shared/service/cache.service';
import { Annotation } from '../../../shared/model/Annotation';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';
import { isPlatformBrowser } from '@angular/common';
import { Logger } from '../../../shared/logger/logger.service';

const CACHE_COLUMN_SETINGS = 'datatable-col-width';

interface Settings {[key: string]: DatatableColumn}

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent implements AfterViewInit {

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

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() reorder = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<{documentId: string, unitId: string}>();

  annotationTypes = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;

  _rows: any[];
  _page: number;
  _count: number;
  _offset: number;
  _columns: DatatableColumn[];
  selected: any[] = [];

  initialized = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cacheService: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: Logger
  ) { }

  @Input() set count(cnt: number) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
  }

  @Input() set rows(rows: any[]) {
    this._rows = rows || [];

    // record the original indexes of each row element so that when the table is sorted
    // we can find out how the indexes were mapped
    this._rows.forEach((element, idx) => {
      element.preSortIndex = idx;
    });
  }

  @Input() set page(page: number) {
    this._page = page;
    this._offset = page - 1;
  };

  @Input() set columns(columns: DatatableColumn[]) {
    const settings$ = DatatableComponent.settings ?
      ObservableOf(DatatableComponent.settings) :
      this.cacheService.getItem<Settings>(CACHE_COLUMN_SETINGS)
        .map(value => value || {})
        .do(value => DatatableComponent.settings = value);

    settings$.subscribe(settings => {
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
          try {
            this.datatable.bodyComponent.scroller.parentElement.scrollTop = scrollAmount;
          } catch (e) {
            this.logger.info('selected row index failed', e)
          }
          sub.unsubscribe();
        }});
      }
    }
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
    ObservableInterval()
      .take(1)
      .subscribe(() => {
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
}
