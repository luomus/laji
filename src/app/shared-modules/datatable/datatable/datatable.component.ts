import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent } from '@swimlane/ngx-datatable';
import { of as ObservableOf, interval as ObservableInterval } from 'rxjs';
import { CacheService } from '../../../shared/service/cache.service';
import { Annotation } from '../../../shared/model/Annotation';
import { DatatableTemplatesComponent } from '../datatable-templates/datatable-templates.component';

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

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cacheService: CacheService
  ) { }

  @Input() set count(cnt: number) {
    this._count = typeof cnt === 'number' ? cnt  : 0;
  }

  @Input() set rows(rows: any[]) {
    this._rows = rows || [];
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable.recalculate();
    }, 100);
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
        if (this.rows) {
          this.rows = [...this.rows];
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
