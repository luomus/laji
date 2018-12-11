import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-red-list-evaluation-occurrences',
  templateUrl: './red-list-evaluation-occurrences.component.html',
  styleUrls: ['./red-list-evaluation-occurrences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationOccurrencesComponent {

  values = [];

  constructor() { }

  @Input() set occurrences(occurrences: any[]) {
    this.values = occurrences.map(o => ({key: o.area, value: o.status}));
  }

}
