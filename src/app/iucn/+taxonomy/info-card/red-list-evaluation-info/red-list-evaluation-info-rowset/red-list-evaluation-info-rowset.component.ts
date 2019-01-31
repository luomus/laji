import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface IRow {
  key: string;
  value: any;
}

@Component({
  selector: 'laji-red-list-evaluation-info-rowset',
  templateUrl: './red-list-evaluation-info-rowset.component.html',
  styleUrls: ['./red-list-evaluation-info-rowset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoRowsetComponent {

  @Input() values: IRow[] = [];

  constructor() { }


}
