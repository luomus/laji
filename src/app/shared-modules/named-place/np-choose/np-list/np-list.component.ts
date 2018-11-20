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

  columnsMetaData = {
    '$.alternativeIDs[0]': {
      label: 'route.nro',
      width: 20
    },
    '$.reserve.reserver': {
      label: 'result.gathering.team',
      width: 100,
      cellTemplate: 'labelIDTpl'
    },
    '$.reserve.until': {
      label: 'result.reserve.until'
    },
    '$.name': {
      label: 'observation.form.placeName',
      width: 100
    },
    '$._status': {
      label: 'Tila',
      width: 20,
      cellTemplate: 'statusTpl'
    },
    '$.geometry.coordinateVerbatim': {
      label: 'result.gathering.conversions.ykj'
    },
    '$.prepopulatedDocument.gatheringEvent.dateBegin': {
      label: 'lastCensus'
    },
    '$.prepopulatedDocument.gatheringEvent.dateEnd': {
      label: 'haseka.submissions.dateEnd'
    },
    '$.taxonIDs[0]': {
      label: 'result.unit.taxonVerbatim',
      cellTemplate: 'labelIDTpl'
    },
    '$.municipality': {
      label: 'np.municipality',
      cellTemplate: 'areaTpl'
    }
  };

  _namedPlaces: NamedPlace[];
  _fields: any[];
  data: any[] = [];
  columns: ObservationTableColumn[];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  showLegendList = false;
  filterBy: string;
  legendList = [
    {label: 'Vapaa', color: '#ffffff'},
    {label: 'Varattu', color: '#d1c400'},
    {label: 'Itselle varattu', color: '#d16e04'},
    {label: 'Ilmoitettu', color: '#00aa00'}
  ];

  @Input() preselectedNPIndex = -1;

  @ViewChild('label') labelIDTpl: TemplateRef<any>;
  @ViewChild('status') statusTpl: TemplateRef<any>;
  @ViewChild('area') areaTpl: TemplateRef<any>;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Output() onActivePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;
  @Input() height: string;

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
    const cols: ObservationTableColumn[] = [];
    for (const path of this._fields) {
      const {cellTemplate = undefined, ...columnMetadata} = this.columnsMetaData[path] || {};
      const col: DatatableColumn = {
        name: path,
        width: 50,
        label: path,
        ...columnMetadata
      };
      if (cellTemplate && this[cellTemplate]) {
        col.cellTemplate = this[cellTemplate];
      }
      cols.push(col);
    }
    this.sorts = cols[0] ? [{prop: cols[0].name, dir: 'asc'}] : [];
    this.columns = cols;
    if (formData.namedPlaceOptions && formData.namedPlaceOptions) {
      this.showLegendList = formData.namedPlaceOptions.showLegendList;
    }
    this.initData();
  }

  updateFilter(event) {
    this.filterBy = event.target.value;
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
        if (value && value.length && (
          path === '$.prepopulatedDocument.gatheringEvent.dateBegin'
          || path === '$.prepopulatedDocument.gatheringEvent.dateEnd'
        )) {
          value = value.split('.').reverse().join('-');
        }
        row[path] = value;
      }
      results.push(row);
    }
    if (this.data.length === 0) {
      setTimeout(() => {
        this.datatable.refreshTable();
      }, 500);
    }
    this.data = results;
    this.cd.markForCheck();
  }
}
