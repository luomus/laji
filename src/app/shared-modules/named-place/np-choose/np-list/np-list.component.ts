import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { DatatableComponent } from '../../../datatable/datatable/datatable.component';
import { DatatableColumn } from '../../../datatable/model/datatable-column';
import { Util } from '../../../../shared/service/util.service';
import { AreaNamePipe } from '../../../../shared/pipe/area-name.pipe';
import { LabelPipe } from '../../../../shared/pipe';
import { zip } from 'rxjs';
import { BoolToStringPipe } from 'app/shared/pipe/bool-to-string.pipe';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ AreaNamePipe, LabelPipe, BoolToStringPipe ]
})
export class NpListComponent {
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
  columnsMetaData: {[columnName: string]: DatatableColumn};

  @Input() preselectedNPIndex = -1;

  @ViewChild('status') statusTpl: TemplateRef<any>;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Output() activePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;
  @Input() height: string;

  constructor(private cd: ChangeDetectorRef,
              private areaNamePipe: AreaNamePipe,
              private labelPipe: LabelPipe,
              private boolToStringPipe: BoolToStringPipe
  ) {
    this.columnsMetaData = {
      '$.alternativeIDs[0]': {
        label: 'route.nro',
        width: 20
      },
      '$.reserve.reserver': {
        label: 'result.gathering.team',
        width: 100,
        pipe: this.labelPipe
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
        pipe: this.labelPipe,
        sortWithPipe: true
      },
      '$.municipality': {
        label: 'np.municipality',
        pipe: this.areaNamePipe,
        sortWithPipe: true
      },
      '$.invasiveControlOpen': {
        label: 'np.invasiveControlOpen',
        pipe: this.boolToStringPipe
      }
    };
  }

  changeActivePlace(event) {
    this.activePlaceChange.emit(this.data.indexOf(event.row));
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
    this._fields = formData.options && formData.options.namedPlaceList
      ? formData.options.namedPlaceList
      : ['$.name'];
    const cols: ObservationTableColumn[] = [];
    for (const path of this._fields) {
      const {cellTemplate, ...columnMetadata} = this.columnsMetaData[path] || {} as DatatableColumn;
      const col: DatatableColumn = {
        name: path,
        width: 50,
        label: path,
        ...columnMetadata
      };
      if (cellTemplate) {
        if (this[cellTemplate]) {
          col.cellTemplate = this[cellTemplate];
        } else {
          console.warn(`Unknown cellTemplate ${cellTemplate} for column ${col.name} (${col.label})`);
        }
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
    const municipalities$ = [];
    for (const namedPlace of this._namedPlaces) {
      const row: any = {};
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
      if (row['$.municipality']) {
        municipalities$.push(this.areaNamePipe.updateValue(row['$.municipality']));
      }
      if ('$.invasiveControlOpen' in row) {
        row['$.invasiveControlOpen'] = namedPlace.prepopulatedDocument.gatherings[0].invasiveControlOpen;
      }
      results.push(row);
    }
    if (this.data.length === 0) {
      setTimeout(() => {
        this.datatable.refreshTable();
      }, 500);
    }
    // Warm up municipality pipes before initial sorting.
    if (municipalities$.length) {
      zip(...municipalities$).subscribe(() => {
        this.data = results;
        this.cd.markForCheck();
      });
    } else {
      this.data = results;
      this.cd.markForCheck();
    }
  }
}
