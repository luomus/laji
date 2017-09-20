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
  @ViewChild('speciesVernacularName') speciesVernacularNameTpl: TemplateRef<any>;
  @ViewChild('warehouseLabel') warehouseLabelTpl: TemplateRef<any>;
  @ViewChild('toSemicolon') toSemicolonTpl: TemplateRef<any>;
  @ViewChild('numeric') numericTpl: TemplateRef<any>;
  @ViewChild('ykj') ykjTpl: TemplateRef<any>;
  @ViewChild('coordinates') coordinatesTpl: TemplateRef<any>;

  @Input() rows: any[];
  @Input() loading = false;
  @Input() count: number;
  @Input() pageSize: number;
  @Input() height = '100%';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() totalMessage = '';

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<{documentId: string, unitId: string}>();

  _offset: number;
  _columns: DatatableColumn[];
  locationCache = {};

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
        this.rows = [...this.rows];
        this.changeDetectorRef.markForCheck();
      });
  }

  makeMinMaxCoordinate(value) {
    if (value.latMax && value.latMin && value.lonMax && value.lonMin) {
      const lat = value.latMax === value.latMin ? value.latMax : value.latMin + '-' + value.latMax;
      const lon = value.lonMax === value.lonMin ? value.lonMax : value.lonMin + '-' + value.lonMax;
      return `${lat} ${lon}`;
    }
    return '';
  }

  makeMinMaxYkj(value) {
    if (value.latMin) {
      const lat = this.getYkjCoord(value.latMin, value.latMax);
      return lat + ':' + this.getYkjCoord(value.lonMin, value.lonMax, lat.split('-')[0].length);
    }
    return '';
  }

  getYkjCoord(min, max, minLen = 3) {
    const key = min + ':' + max;
    if (!this.locationCache[key]) {
      let tmpMin = ('' + min).replace(/[0]*$/, '');
      let tmpMax = ('' + max).replace(/[0]*$/, '');
      const targetLen = Math.max(tmpMin.length, tmpMax.length, minLen);
      tmpMin = tmpMin + '0000000'.substr(tmpMin.length, (targetLen - tmpMin.length));
      tmpMax = '' + (+(tmpMax + '0000000'.substr(tmpMax.length, (targetLen - tmpMax.length))) - 1);
      this.locationCache[key] = tmpMin === tmpMax ? tmpMin : tmpMin + '-' + tmpMax;
    }
    return this.locationCache[key];
  }

}
