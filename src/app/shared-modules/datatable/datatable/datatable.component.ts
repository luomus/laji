import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../shared/service/cache.service';
import { Annotation } from '../../../shared/model/Annotation';

const CACHE_COLUMN_SETINGS = 'datatable-col-width';

interface Settings {[key: string]: DatatableColumn}

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent {

  private static settings: Settings;

  @ViewChild('dataTable') public datatable: NgxDatatableComponent;

  @ViewChild('taxon') taxonTpl: TemplateRef<any>;
  @ViewChild('originalTaxon') originalTaxonTpl: TemplateRef<any>;
  @ViewChild('species') speciesTpl: TemplateRef<any>;
  @ViewChild('headerTpl') headerTpl: TemplateRef<any>;
  @ViewChild('eventDate') eventDateTpl: TemplateRef<any>;
  @ViewChild('multiLang') multiLangTpl: TemplateRef<any>;
  @ViewChild('multiLangAll') multiLangAllTpl: TemplateRef<any>;
  @ViewChild('vernacularName') vernacularNameTpl: TemplateRef<any>;
  @ViewChild('scientificName') scientificNameTpl: TemplateRef<any>;
  @ViewChild('taxonScientificName') taxonScientificNameTpl: TemplateRef<any>;
  @ViewChild('cursive') cursiveTpl: TemplateRef<any>;
  @ViewChild('boolean') booleanTpl: TemplateRef<any>;
  @ViewChild('label') labelTpl: TemplateRef<any>;
  @ViewChild('labelArray') labelArrayTpl: TemplateRef<any>;
  @ViewChild('warehouseLabel') warehouseLabelTpl: TemplateRef<any>;
  @ViewChild('toSemicolon') toSemicolonTpl: TemplateRef<any>;
  @ViewChild('numeric') numericTpl: TemplateRef<any>;
  @ViewChild('date') dateTpl: TemplateRef<any>;
  @ViewChild('publication') publicationTpl: TemplateRef<any>;
  @ViewChild('publicationArray') publicationArrayTpl: TemplateRef<any>;
  @ViewChild('annotation') annotationTpl: TemplateRef<any>;
  @ViewChild('image') imageTpl: TemplateRef<any>;

  @Input() rows: any[];
  @Input() loading = false;
  @Input() count: number;
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

  _offset: number;
  _columns: DatatableColumn[];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cacheService: CacheService
  ) { }

  @Input() set page(page: number) {
    this._offset = page - 1;
  };

  @Input() set columns(columns: DatatableColumn[]) {
    const settings$ = DatatableComponent.settings ?
      Observable.of(DatatableComponent.settings) :
      this.cacheService.getItem<Settings>(CACHE_COLUMN_SETINGS)
        .map(value => value || {})
        .do(value => DatatableComponent.settings = value);

    settings$.subscribe(settings => {
      this._columns = columns.map((column) => {
        if (!column.headerTemplate) {
          column.headerTemplate = this.headerTpl;
        }
        if (typeof column.cellTemplate === 'string') {
          column.cellTemplate = this[column.cellTemplate + 'Tpl'];
        }
        if (!column.prop) {
          column.prop = column.name;
        }
        if (settings[column.name] && settings[column.name].width) {
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
    Observable
      .interval()
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
        .subscribe();
    }
  }
}
