import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { DatatableComponent } from '../../../datatable/datatable/datatable.component';
import { DatatableColumn } from '../../../datatable/model/datatable-column';
import { Util } from '../../../../shared/service/util.service';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpListComponent {

  labelMap = {
    '$.alternativeIDs[0]': 'route.nro',
    '$.reserve.reserver': 'result.gathering.team',
    '$.reserve.until': 'result.reserve.until',
    '$.name': 'observation.form.placeName',
    '$._status': 'Tila',
    '$.geometry.coordinateVerbatim': 'result.gathering.conversions.ykj',
    '$.prepopulatedDocument.gatheringEvent.dateBegin': 'lastCensus',
    '$.prepopulatedDocument.gatheringEvent.dateEnd': 'haseka.submissions.dateEnd',
    '$.taxonIDs[0]': 'result.unit.taxonVerbatim',
  };

  _namedPlaces: NamedPlace[];
  _fields: any[];
  data: any[] = [];
  columns: ObservationTableColumn[];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  showLegendList = false;
  legendList = [
    {label: 'Vapaa', color: '#ffffff'},
    {label: 'Varattu', color: '#d1c400'},
    {label: 'Itselle varattu', color: '#d16e04'},
    {label: 'Ilmoitettu', color: '#00aa00'}
  ];

  @Input() preselectedNPIndex = -1;

  @ViewChild('label') labelIDTpl: TemplateRef<any>;
  @ViewChild('status') statusTpl: TemplateRef<any>;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Output() onActivePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;
  @Input() height: string;

  private widths = {
    '$.name': 100,
    '$.alternativeIDs[0]': 20,
    '$.reserve.reserver': 100,
    '$._status': 20
  };

  constructor(private cd: ChangeDetectorRef) { }

  changeActivePlace(event) {
    this.onActivePlaceChange.emit(this.data.indexOf(event.row));
  }

  getRowClass(row) {
    const status = row['$._status'];
    if (status !== 'free') { return status; }
  }

  @Input() set namedPlaces(nps: NamedPlace[]) {
    this._namedPlaces = nps;
    this.initData();
  }

  @Input() set formData(formData: any) {
    this._fields = formData.options && formData.options.namedPlaceList ? formData.options.namedPlaceList : ['$.name'];
    const labels = this.labelMap;
    const cols: ObservationTableColumn[] = [];
    for (const path of this._fields) {
      const col: DatatableColumn = {
        name: path,
        label: labels[path] || path
      };
      switch (path) {
        case '$.reserve.reserver':
        case '$.taxonIDs[0]':
          col.cellTemplate = this.labelIDTpl;
          break;
        case '$._status':
          col.cellTemplate = this.statusTpl;
          break;
      }
      col.width = this.widths[path] ? this.widths[path] : 50;
      cols.push(col);
    }
    this.sorts = cols[0] ? [{prop: cols[0].name, dir: 'asc'}] : [];
    this.columns = cols;
    if (formData.namedPlaceOptions && formData.namedPlaceOptions) {
      this.showLegendList = formData.namedPlaceOptions.showLegendList;
    }
    this.initData();
  }

  private initData() {
    if (!this._fields || !this._namedPlaces) {
      return;
    }
    const results = [];
    for (const namedPlace of this._namedPlaces) {
      const row = {};
      for (const path of this._fields) {
        let value = Util.parseJSONPath(namedPlace, path);
        if (value && value.length) {
          if (path === '$.prepopulatedDocument.gatheringEvent.dateBegin' || path === '$.prepopulatedDocument.gatheringEvent.dateEnd') {
            value = value.split('.').reverse().join('-');
          }
        }
        row[path] = value;
      }
      results.push(row);
    }
    if (this.data.length === 0) {
      setTimeout(() => {
        this.datatable.refreshTable();
      }, 500)
    }
    this.data = results;
    this.cd.markForCheck();
  }

}
