import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
  id?: string;
  name: string;
  primary: StatusCnt;
  secondary: StatusCnt;
  unspecified?: boolean;
  isTotal?: boolean;
}

@Component({
  selector: 'laji-red-list-habitat',
  templateUrl: './red-list-habitat.component.html',
  styleUrls: ['./red-list-habitat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatComponent {

  @Output() habitatSelect = new EventEmitter<string>();

  _data: RedListHabitatData[];

  constructor() { }

  @Input()
  set data(data: RedListHabitatData[]) {
    this._data = data;
  }

}
