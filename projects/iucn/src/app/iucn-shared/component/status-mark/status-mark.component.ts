import { Component, Input } from '@angular/core';
import { RedListEvaluation } from '../../../../../../../src/app/shared/model/Taxonomy';

@Component({
  selector: 'laji-status-mark',
  templateUrl: './status-mark.component.html',
  styleUrls: ['./status-mark.component.scss']
})
export class StatusMarkComponent {

  @Input() showLabels = false;

  _evaluation: RedListEvaluation;
  re = false;
  mark = '';

  @Input() set evaluation(evaluation: RedListEvaluation) {
    this._evaluation = evaluation;
    this.re = !!evaluation.possiblyRE;
    if (evaluation.externalPopulationImpactOnRedListStatus) {
      switch (evaluation.externalPopulationImpactOnRedListStatus) {
        case 'MKV.externalPopulationImpactOnRedListStatusEnumMinus1':
          this.mark = '°';
          break;
        case 'MKV.externalPopulationImpactOnRedListStatusEnumMinus2':
          this.mark = '°°';
          break;
      }
    }
  }

}
