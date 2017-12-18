import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ObservationTableColumn } from '../../../../shared-modules/observation-result/model/observation-table-column';
import { environment } from '../../../../../environments/environment';
import { DatatableComponent } from '../../../../shared-modules/datatable/datatable/datatable.component';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpListComponent {

  labelMap = {
    '$.name': 'observation.form.specimen',
    '$.geometry.coordinateVerbatim': 'result.gathering.conversions.ykj',
    '$.prepopulatedDocument.gatheringEvent.dateBegin': 'haseka.submissions.dateStart',
    '$.prepopulatedDocument.gatheringEvent.dateEnd': 'haseka.submissions.dateEnd'
  };

  wbcLabelMap = {
    '$.prepopulatedDocument.gatheringEvent.dateBegin': 'lastCensus'
  };

  _namedPlaces: NamedPlace[];
  _fields: any[];
  data: any[] = [];
  columns: ObservationTableColumn[];


  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Output() onActivePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;

  constructor(private cd: ChangeDetectorRef) { }

  changeActivePlace(event) {
    this.onActivePlaceChange.emit(this.data.indexOf(event.row));
  }

  @Input() set namedPlaces(nps: NamedPlace[]) {
    this._namedPlaces = nps;
    this.initData();
  }

  @Input() set formData(formData: any) {
    this._fields =  formData.options && formData.options.namedPlaceList ? formData.options.namedPlaceList : ['$.name'];
    const labels = environment.wbcForm === formData.id ? {...this.labelMap, ...this.wbcLabelMap} : this.labelMap;
    const cols: ObservationTableColumn[] = [];
    for (const path of this._fields) {
      cols.push({
        name: path,
        label: labels[path] || path,
        width: path === '$.name' ? 100 : 50
      });
    }
    this.columns = cols;
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
        let value = JSONPath({json: namedPlace, path: path});
        if (value && value.length) {
          if (path === '$.prepopulatedDocument.gatheringEvent.dateBegin' || path === '$.prepopulatedDocument.gatheringEvent.dateEnd') {
            value = value.map(val => val.split('.').reverse().join('-'));
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
