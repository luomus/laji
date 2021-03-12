import {Component, ChangeDetectionStrategy, Output, EventEmitter, Input} from '@angular/core';
import {RegionalService} from '../../../../iucn-shared/service/regional.service';
import {RedListStatusData} from '../../../../+taxonomy/list/results/red-list-status/red-list-status.component';

export interface RedListRegionalStatusData {
  species: string;
  count: number;
  group?: string;
  'ML.690'?: number;
  'ML.691'?: number;
  'ML.692'?: number;
  'ML.693'?: number;
  'ML.694'?: number;
  'ML.695'?: number;
  'ML.696'?: number;
  'ML.697'?: number;
  'ML.698'?: number;
  'ML.699'?: number;
  'ML.700'?: number;
}

@Component({
  selector: 'laji-red-list-regional-status',
  templateUrl: './red-list-regional-status.component.html',
  styleUrls: ['./red-list-regional-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListRegionalStatusComponent {

  _data: RedListStatusData[] = [];
  areas: string[];
  areaLabel: any;

  @Output() groupSelect = new EventEmitter<string>();

  @Input()
  set data(data: RedListStatusData[]) {
    if (!data) {
      this._data = [];
      return;
    }
    const total: RedListStatusData = { species: 'Total', count: 0 };
    this.areas.forEach(status => {
      total[status] = 0;
    });
    const results = data.map<RedListRegionalStatusData>(row => {
      this.areas.forEach(status => {
        if (row[status]) {
          total[status] += row[status];
        }
      });
      total.count += row.count;
      return row;
    });
    if (results.length > 1) {
      results.unshift(total);
    }
    results.push(total);
    this._data = results;
  }

  constructor(
    private resultService: RegionalService
  ) {
    this.areas = this.resultService.areas;
    this.areaLabel = this.resultService.shortLabel;
  }

  rowClick(group) {
    if (!group) {
      return;
    }
    this.groupSelect.emit(group);
  }

}
