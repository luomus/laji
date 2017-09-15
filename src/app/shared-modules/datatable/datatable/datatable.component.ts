import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef,
  ViewChild
} from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';

@Component({
  selector: 'laji-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent {

  @ViewChild('headerTpl') headerTpl: TemplateRef<any>;

  @Input() rows: any[];
  @Input() loading = false;
  @Input() count: number;
  @Input() pageSize: number;
  @Input() height = '100%';

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<{documentId: string, unitId: string}>();

  _offset: number;
  _columns: DatatableColumn[];

  constructor() { }


  @Input() set page(page: number) {
    this._offset = page - 1;
  };

  @Input() set columns(columns: DatatableColumn[]) {
    this._columns = columns.map((column) => {
      if (!column.headerTemplate) {
        column.headerTemplate = this.headerTpl;
      }
      if (!column.prop) {
        column.prop = column.name;
      }
      return column;
    });
  }

  onRowSelect(event) {
    if (event.type === 'click' || event.type === 'dblClick') {
      this.rowSelect.emit(event.row);
    }
  }

  onPage(event) {
    if (this.loading || this._offset === event.offset) {
      return;
    }
    this.pageChange.emit(event);
  }

}
