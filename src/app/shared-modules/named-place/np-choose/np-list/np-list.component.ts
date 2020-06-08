import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { DatatableComponent } from '../../../datatable/datatable/datatable.component';
import { DatatableColumn } from '../../../datatable/model/datatable-column';
import { Util } from '../../../../shared/service/util.service';
import { map, take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { AreaNamePipe } from '../../../../shared/pipe/area-name.pipe';
import { BoolToStringPipe } from '../../../../shared/pipe/bool-to-string.pipe';
import Timeout = NodeJS.Timeout;
import { FormService } from '../../../../shared/service/form.service';
import { Form } from '../../../../shared/model/Form';
import { Rights } from '../../../../+haseka/form-permission/form-permission.service';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ BoolToStringPipe, AreaNamePipe ]
})
export class NpListComponent implements OnDestroy {
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
  private _visible;
  private _visibleTimeout: Timeout;
  private _formRights: Rights;
  private _documentForm: any;

  @ViewChild('label', { static: true }) labelIDTpl: TemplateRef<any>;
  @ViewChild('status', { static: true }) statusTpl: TemplateRef<any>;
  @ViewChild('area') areaTpl: TemplateRef<any>;
  @ViewChild('boolToStr', { static: true }) boolToStrTpl: TemplateRef<any>;
  @ViewChild('dataTable', { static: true }) public datatable: DatatableComponent;

  @Output() activePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;
  @Input() height: string;
  @Input() listColumnNameMapping: { [key: string]: string};

  constructor(private cd: ChangeDetectorRef,
              private areaNamePipe: AreaNamePipe
) {
  this.columnsMetaData = {
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
        label: 'np.municipality'
      },
      '$.locality': {
        label: 'np.locality'
      },
      '$.prepopulatedDocument.gatherings[0].invasiveControlOpen': {
        label: 'np.invasiveControlOpen',
        cellTemplate: 'boolToStrTpl'
      },
      '$.prepopulatedDocument.deviceID': {
        label: 'np.list.col.deviceID',
      },
      '$.prepopulatedDocument.gatherings.length': {
        label: 'theme.waterbird.gatheringLength',
        width: 20
      },
      '$.prepopulatedDocument.gatherings[0].notes': {
        label: 'result.document.notes'
      },
      '$.prepopulatedDocument.gatherings[0].dateBegin': {
        label: 'lastCensus'
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

  @Input() set formRights(formRights: Rights) {
    this._formRights = formRights;
    this.initFields();
  }

  @Input() set documentForm(documentForm: any) {
    this._documentForm = documentForm;
    this.initFields();
  }

  initFields() {
    const documentForm = this._documentForm;
    if (!this._formRights || !documentForm) {
      return;
    }

    this._fields = documentForm.options?.namedPlaceList
      ? documentForm.options.namedPlaceList
      : ['$.name'];
    if (FormService.hasFeature(documentForm, Form.Feature.Reserve)
      && this._formRights.admin
      && this._fields.indexOf('$.reserve.reserver') === -1) {
      this._fields.push('$.reserve.reserver');
    }
    const cols: ObservationTableColumn[] = [];
    for (const path of this._fields) {
      const {cellTemplate, ...columnMetadata} = this.columnsMetaData[path] || {} as DatatableColumn;
      const col: DatatableColumn = {
        name: path,
        width: 50,
        label: path,
        ...columnMetadata
      };
      if (this.listColumnNameMapping && this.listColumnNameMapping[path]) {
        col.label = this.listColumnNameMapping[path];
      }
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
    this.showLegendList = documentForm.namedPlaceOptions?.showLegendList;
    this.initData();
  }

  @Input() set visible(visibility) {
    if (this._visible === false && visibility === true) {
      this._visibleTimeout = setTimeout(() => {
        this.datatable.showActiveRow();
        this._visibleTimeout = undefined;
      }, 10);
    }
    this._visible = visibility;
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
      const municipality = row['$.municipality'];
      if (municipality && municipality.length) {
        municipalities$.push(forkJoin(
          ...municipality.map(_muni => this.areaNamePipe.updateValue(_muni)
            .pipe(take(1)))
        ).pipe(map(areaLabel => [row, areaLabel])));
      }
      results.push(row);
    }
    if (this.data.length === 0) {
      setTimeout(() => {
        this.datatable.refreshTable();
      }, 500);
    }
    if (municipalities$.length) {
      forkJoin(...municipalities$).subscribe((municipalityTuples) => {
        municipalityTuples.forEach(([row, municipalityLabel]) => {
          row['$.municipality'] = municipalityLabel.join(', ');
        });
        this.data = results;
        this.cd.markForCheck();
      });
    } else {
      this.data = results;
      this.cd.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._visibleTimeout && clearTimeout(this._visibleTimeout);
  }
}
