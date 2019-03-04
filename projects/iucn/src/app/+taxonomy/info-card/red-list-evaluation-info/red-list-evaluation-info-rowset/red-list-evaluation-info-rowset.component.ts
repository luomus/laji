import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface IRow {
  key: string;
  value: any;
  translate?: string;
}

interface IInternalRow extends IRow {
  value: any[];
}

@Component({
  selector: 'laji-red-list-evaluation-info-rowset',
  templateUrl: './red-list-evaluation-info-rowset.component.html',
  styleUrls: ['./red-list-evaluation-info-rowset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoRowsetComponent {

  @Input() _values: IInternalRow[] = [];

  constructor() { }

  @Input() set values(val: IRow[]) {
    this._values = val.map(v => ({
      ...v,
      value: Array.isArray(v.value) ? v.value : [v.value]
    }));
  }

}
