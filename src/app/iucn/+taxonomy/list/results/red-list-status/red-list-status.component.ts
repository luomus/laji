import { Component, OnInit } from '@angular/core';
import { ResultService } from '../../../../iucn-shared/service/result.service';

export interface RedListStatusData {
  species: string,
  count: number,
  RE: number,
  CR: number,
  EN: number,
  VU: number,
  NT: number,
  DD: number,
  LC: number,
  NA: number,
  NE: number
}

interface RedListStatusDataInternal extends RedListStatusData {
  redListPct: number,
  redListCnt: number
}

@Component({
  selector: 'laji-red-list-status',
  templateUrl: './red-list-status.component.html',
  styleUrls: ['./red-list-status.component.scss']
})
export class RedListStatusComponent implements OnInit {

  mockData: RedListStatusData[] = [
    {species: 'Juoksujlkaiset, Chilopoda', count: 13, RE: 1, CR: 0, EN: 0, VU: 2, NT: 0, DD: 0, LC: 10, NA: 7, NE: 1},
    {species: 'Kaksoisjalkaiset, Diplopoda', count: 23, RE: 0, CR: 0, EN: 0, VU: 1, NT: 0, DD: 0, LC: 22, NA: 4, NE: 1},
    {species: 'Harvajalkaiset', count: 8, RE: 0, CR: 1, EN: 0, VU: 0, NT: 0, DD: 0, LC: 3, NA: 5, NE: 0},
    {species: 'Juoksujlkaiset, Chilopoda', count: 13, RE: 1, CR: 0, EN: 0, VU: 2, NT: 0, DD: 0, LC: 10, NA: 7, NE: 1},
    {species: 'Kaksoisjalkaiset, Diplopoda', count: 23, RE: 0, CR: 0, EN: 0, VU: 1, NT: 0, DD: 0, LC: 22, NA: 4, NE: 1},
    {species: 'Harvajalkaiset', count: 8, RE: 0, CR: 1, EN: 0, VU: 0, NT: 0, DD: 0, LC: 3, NA: 5, NE: 0},
  ];

  _data: RedListStatusDataInternal[] = [];
  statuses: string[];
  redListStatus = {};

  constructor(
    private resultService: ResultService
  ) { }

  ngOnInit() {
    this.statuses = this.resultService.statuses;
    this.data = this.mockData;
  }

  set data(data: RedListStatusData[]) {
    const total: RedListStatusData = {species: 'Total', count: 0, CR: 0, RE: 0, EN: 0, VU: 0, NT: 0, DD: 0, LC: 0, NA: 0, NE: 0};
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
    return {...data, redListCnt: cnt, redListPct: data.count > 0 ? Math.round((cnt / data.count) * 100 * 10) / 10 : 0}
  }

}
