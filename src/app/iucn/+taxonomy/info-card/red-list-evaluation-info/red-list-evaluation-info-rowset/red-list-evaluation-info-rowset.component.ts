import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-red-list-evaluation-info-rowset',
  templateUrl: './red-list-evaluation-info-rowset.component.html',
  styleUrls: ['./red-list-evaluation-info-rowset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoRowsetComponent {

  @Input() values: {key: string, value: any}[] = [];

  constructor() { }


}
