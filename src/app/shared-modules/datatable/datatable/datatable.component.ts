import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { DatatableComponent as NgxDatatableComponent } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent {

  @ViewChild('dataTable') public datatable: NgxDatatableComponent;

  @ViewChild('headerTpl') headerTpl: TemplateRef<any>;
  @ViewChild('eventDate') eventDateTpl: TemplateRef<any>;
  @ViewChild('vernacularName') vernacularNameTpl: TemplateRef<any>;
  @ViewChild('scientificName') scientificNameTpl: TemplateRef<any>;
  @ViewChild('taxonScientificName') taxonScientificNameTpl: TemplateRef<any>;
  @ViewChild('speciesScientificName') speciesScientificNameTpl: TemplateRef<any>;
  @ViewChild('speciesVernacularName') speciesVernacularNameTpl: TemplateRef<any>;
  @ViewChild('warehouseLabel') warehouseLabelTpl: TemplateRef<any>;
  @ViewChild('toSemicolon') toSemicolonTpl: TemplateRef<any>;
  @ViewChild('numeric') numericTpl: TemplateRef<any>;

  @Input() rows: any[];
  @Input() loading = false;
  @Input() count: number;
  @Input() pageSize: number;
  @Input() height = '100%';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';
  @Input() clientSideSorting = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<{documentId: string, unitId: string}>();

  _offset: number;
  _columns: DatatableColumn[];

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }


  @Input() set page(page: number) {
    this._offset = page - 1;
  };

  @Input() set columns(columns: DatatableColumn[]) {
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
      return column;
    });
  }

  onRowSelect(event) {
    if (event.type === 'click' || event.type === 'dblClick') {
      this.rowSelect.emit(event);
    }
  }

  onPage(event) {
    if (this.loading || this._offset === event.offset) {
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
}
