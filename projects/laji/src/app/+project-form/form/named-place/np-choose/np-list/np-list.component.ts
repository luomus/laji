import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NamedPlace } from '../../../../../shared/model/NamedPlace';
import { Util } from '../../../../../shared/service/util.service';
import { map, take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { AreaNamePipe } from '../../../../../shared/pipe/area-name.pipe';
import { BoolToStringPipe } from '../../../../../shared/pipe/bool-to-string.pipe';
import Timeout = NodeJS.Timeout;
import { Form } from '../../../../../shared/model/Form';
import { Rights } from '../../../../../shared/service/form-permission.service';
import { ObservationTableColumn } from '../../../../../shared-modules/observation-result/model/observation-table-column';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';
import { DatatableComponent } from '../../../../../shared-modules/datatable/datatable/datatable.component';
import { SelectionType, SortType } from '@achimha/ngx-datatable';
import { NpInfoComponent } from '../../np-info/np-info.component';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ BoolToStringPipe, AreaNamePipe ]
})
export class NpListComponent implements OnDestroy {
  _namedPlaces?: NamedPlace[];
  _fields?: any[];
  data: any[] = [];
  columns?: ObservationTableColumn[];
  sorts: {prop: string; dir: 'asc'|'desc'}[] = [];
  sortType = SortType;
  selectionType = SelectionType;
  showLegendList? = false;
  multisort? = false;
  filterBy?: string;
  legendList = [
    {label: 'Vapaa', color: '#ffffff'},
    {label: 'Varattu', color: '#d1c400'},
    {label: 'Itselle varattu', color: '#d16e04'},
    {label: 'Ilmoitettu', color: '#00aa00'}
  ];
  columnsMetaData: {[columnName: string]: DatatableColumn};
  private _visible?: boolean;
  private _visibleTimeout?: Timeout;
  private _formRights?: Rights;
  private _documentForm!: Form.SchemaForm;
  private _placeForm?: Form.SchemaForm;

  @ViewChild('label', { static: true }) labelIDTpl!: TemplateRef<any>;
  @ViewChild('status', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('area') areaTpl!: TemplateRef<any>;
  @ViewChild('boolToStr', { static: true }) boolToStrTpl!: TemplateRef<any>;
  @ViewChild('dataTable', { static: true }) public datatable!: DatatableComponent;

  @Output() activePlaceChange = new EventEmitter<number>();

  @Input() activeNP?: number|null;
  @Input({ required: true }) height!: string;
  @Input() listColumnNameMapping?: { [key: string]: string};

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
      '$._status': { // eslint-disable-line @typescript-eslint/naming-convention
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

  changeActivePlace(event: any) {
    this.activePlaceChange.emit(this.data.indexOf(event.row));
  }

  getRowClass(row: any) {
    const status = row['$._status'];
    if (status !== 'free') { return status; }
  }

  @Input() set namedPlaces(nps: NamedPlace[]) {
    this._namedPlaces = nps;
    this.initData();
  }

  @Input() set formRights(formRights: Rights|undefined) {
    this._formRights = formRights;
    this.initColumns();
  }

  @Input({ required: true }) set documentForm(documentForm: Form.SchemaForm) {
    this._documentForm = documentForm;
    this.initColumns();
  }

  @Input() set placeForm(placeForm: Form.SchemaForm|undefined) {
    this._placeForm = placeForm;
    this.initColumns();
  }

  initColumns() {
    const documentForm = this._documentForm;
    const placeForm = this._placeForm;
    if (!this._formRights || !documentForm || !placeForm) {
      return;
    }

    const { namedPlaceOptions } = documentForm.options || {};
    this._fields = namedPlaceOptions?.listColumns || ['$.name'];
    if (namedPlaceOptions?.reservationUntil
      && this._formRights.admin
      && this._fields.indexOf('$.reserve.reserver') === -1) {
      this._fields.push('$.reserve.reserver');
    }


    const cols = this._fields.reduce((_cols, path) => {

      const schema = NpInfoComponent.getSchemaFromNPJsonPathPointer(placeForm, documentForm, path);
      const isEnumType = schema?.type === 'string' && schema.oneOf;
      const hardCodedCol: Partial<DatatableColumn> = this.columnsMetaData[path] || {};
      const col = {
        name: path,
        width: 50,
        cellTemplate: isEnumType ? 'labelIDTpl' : undefined,
        ...hardCodedCol,
        label: this.listColumnNameMapping?.[path] ?? hardCodedCol.label ?? schema?.title ?? path,
      };
      if (col.cellTemplate) {
        col.cellTemplate = this[col.cellTemplate as keyof NpListComponent];
      }
      _cols.push(col);

      return _cols;
    }, []);
    this.sorts = cols[0] ? [{prop: cols[0].name, dir: 'asc'}] : [];
    this.columns = cols;
    this.showLegendList = documentForm.options?.namedPlaceOptions?.showLegendList;
    this.multisort = documentForm.options?.namedPlaceOptions?.listColumnsMultisort;
    this.initData();
  }

  @Input() set visible(visibility: boolean) {
    if (this._visible === false && visibility === true) {
      this._visibleTimeout = setTimeout(() => {
        this.datatable.showActiveRow();
        this._visibleTimeout = undefined;
      }, 10);
    }
    this._visible = visibility;
  }

  updateFilter(event: any) {
    this.filterBy = event.target.value;
  }

  private initData() {
    if (!this._fields || !this._namedPlaces) {
      return;
    }
    const results: any[] = [];
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
          ...municipality.map((_muni: string) => this.areaNamePipe.updateValue(_muni)
            .pipe(take(1)))
        ).pipe(map(areaLabel => [row, areaLabel])));
      }
      results.push(row);
    }
    if (municipalities$.length) {
      forkJoin(...municipalities$).subscribe((municipalityTuples) => {
        municipalityTuples.forEach(([row, municipalityLabel]: [any, string[]]) => {
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
    if (this._visibleTimeout) {
      clearTimeout(this._visibleTimeout);
    }
  }
}
