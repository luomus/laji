import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultService } from '../../../../iucn-shared/service/result.service';

export interface RedListStatusData {
  species: string;
  count: number;
  group?: string;
  'MX.iucnRE'?: number;
  'MX.iucnCR'?: number;
  'MX.iucnEN'?: number;
  'MX.iucnVU'?: number;
  'MX.iucnNT'?: number;
  'MX.iucnDD'?: number;
  'MX.iucnLC'?: number;
  'MX.iucnNA'?: number;
  'MX.iucnNE'?: number;
}

interface RedListStatusDataInternal extends RedListStatusData {
  redListPct: number;
  redListCnt: number;
}

@Component({
  selector: 'iucn-red-list-status',
  templateUrl: './red-list-status.component.html',
  styleUrls: ['./red-list-status.component.scss']
})
export class RedListStatusComponent {

  _data: RedListStatusDataInternal[] = [];
  statuses: (keyof RedListStatusData)[];
  statusLabel: any;

  @Output() groupSelect = new EventEmitter<string>();

  constructor(
    private resultService: ResultService
  ) {
    this.statuses = this.resultService.statuses as (keyof RedListStatusData)[];
    this.statusLabel = this.resultService.shortLabel;
  }

  @Input()
  set data(data: RedListStatusData[]) {
    if (!data) {
      this._data = [];
      return;
    }
    const total: any = { species: 'Total', count: 0 };
    (this.statuses as any).forEach((status: any) => {
      total[status] = 0;
    });
    const results = data.map<RedListStatusDataInternal>((row: any) => {
      let rlCnt = 0;
      this.statuses.forEach(status => {
        if (row[status]) {
          total[status] += row[status];
          if (this.resultService.evaluatedStatuses.includes(status)) {
            rlCnt += row[status];
          }
        }
      });
      row.count = rlCnt;
      total.count += row.count;
      return this.dataToInternal(row);
    });
    const totalRow = this.dataToInternal(total);
    if (results.length > 1) {
      results.unshift(totalRow);
    }
    results.push(totalRow);
    this._data = results;
  }

  rowClick(group: any) {
    if (!group) {
      return;
    }
    this.groupSelect.emit(group);
  }

  private dataToInternal(data: any): RedListStatusDataInternal {
    let cnt = 0;
    this.resultService.endangered.forEach(status => cnt += data[status] || 0);
    return {...data, redListCnt: cnt, redListPct: data.count > 0 ? Math.round((cnt / data.count) * 100 * 10) / 10 : 0};
  }

}
