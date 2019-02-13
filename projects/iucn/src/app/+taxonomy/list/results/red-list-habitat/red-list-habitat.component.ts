import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface StatusCnt {
  'MX.iucnRE'?: number;
  'MX.iucnCR'?: number;
  'MX.iucnEN'?: number;
  'MX.iucnVU'?: number;
  'MX.iucnNT'?: number;
  'MX.iucnDD'?: number;
  total: number;
}


export interface RedListHabitatData {
  name: string;
  primary: StatusCnt;
  secondary: StatusCnt;
}

@Component({
  selector: 'laji-red-list-habitat',
  templateUrl: './red-list-habitat.component.html',
  styleUrls: ['./red-list-habitat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatComponent {

  _data: RedListHabitatData[];

  constructor() { }

  @Input()
  set data(data: RedListHabitatData[]) {
    this._data = data;
  }

}
