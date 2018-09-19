import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IucnService {

  dataMock = {
    2000: [
      {name: 'lc', value: 1000},
      {name: 'nt', value: 120},
      {name: 'vu', value: 43},
      {name: 'en', value: 21},
      {name: 'cr', value: 7},
      {name: 're', value: 10}
    ],
    2010: [
      {name: 'lc', value: 2463},
      {name: 'nt', value: 234},
      {name: 'vu', value: 26},
      {name: 'en', value: 22},
      {name: 'cr', value: 12},
      {name: 're', value: 17}
    ],
    2015: [
      {name: 'lc', value: 2113},
      {name: 'nt', value: 151},
      {name: 'vu', value: 75},
      {name: 'en', value: 24},
      {name: 'cr', value: 9},
      {name: 're', value: 12}
    ],
    2019: [
      {name: 'lc', value: 1231},
      {name: 'nt', value: 291},
      {name: 'vu', value: 85},
      {name: 'en', value: 54},
      {name: 'cr', value: 12},
      {name: 're', value: 10}
    ]
  };

  constructor() { }

  getResults(year: number): Observable<{name: string, value: number}[]> {
    return ObservableOf(this.dataMock[year]);
  }

}
