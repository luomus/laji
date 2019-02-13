import { Component, Input } from '@angular/core';
import { ResultService } from '../../../../iucn-shared/service/result.service';

export interface RedListStatusData {
  species: string;
  count: number;
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
  selector: 'laji-red-list-status',
  templateUrl: './red-list-status.component.html',
  styleUrls: ['./red-list-status.component.scss']
})
export class RedListStatusComponent {

  _data: RedListStatusDataInternal[] = [];
  statuses: string[];
  statusLabel: any;

  constructor(
    private resultService: ResultService
  ) {
    this.statuses = this.resultService.statuses;
    this.statusLabel = this.resultService.shortLabel;
  }

  @Input()
  set data(data: RedListStatusData[]) {
    if (!data) {
      this._data = [];
      return;
    }
    const total: RedListStatusData = {species: 'Total', count: 0
    };
    this.statuses.forEach(status => {
      total[status] = 0;
    });
    const results = data.map<RedListStatusDataInternal>(row => {
      total.count += row.count;
      this.statuses.forEach(status => {
        if (row[status]) {
          total[status] += row[status];
        }
      });
      return this.dataToInternal(row);
    });
    results.push(this.dataToInternal(total));
    this._data = results;
  }

  private dataToInternal(data: RedListStatusData): RedListStatusDataInternal {
    let cnt = 0;
    this.resultService.redListStatuses.forEach(status => cnt += data[status] || 0);
    return {...data, redListCnt: cnt, redListPct: data.count > 0 ? Math.round((cnt / data.count) * 100 * 10) / 10 : 0};
  }

}
