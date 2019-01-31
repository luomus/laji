import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RedListEvaluation } from '../../../../shared/model/Taxonomy';
import { IRow } from './red-list-evaluation-info-rowset/red-list-evaluation-info-rowset.component';

@Component({
  selector: 'laji-red-list-evaluation-info',
  templateUrl: './red-list-evaluation-info.component.html',
  styleUrls: ['./red-list-evaluation-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoComponent {

  generalValues: IRow[] = [];
  endanger: IRow[] = [];
  taxonInterpretation: IRow[] = [];
  occuranceInfo: IRow[] = [];
  habitat: IRow[] = [];
  occurrences: IRow[] = [];
  evaluationBases: IRow[] = [];
  criteria: IRow[] = [];
  sources: IRow[] = [];

  private _evaluation: RedListEvaluation;
  private skip = ['calculatedRedListIndex'];
  private keyMap = {
    'secondaryHabitats': 'secondaryHabitat',
    'endangermentReasons': 'hasEndangermentReason',
    'threats': 'hasThreat',
  };

  private fieldMap = {
    'MKV.generationAge': 'evaluationBases',
    'MKV.generationAgeNotes': 'evaluationBases',
    'MKV.evaluationPeriodLength': 'evaluationBases',
    'MKV.evaluationPeriodLengthNotes': 'evaluationBases',
    'MKV.individualCountMin': 'evaluationBases',
    'MKV.individualCountMax': 'evaluationBases',
    'MKV.individualCountNotes': 'evaluationBases',
    'MKV.populationSizePeriodBeginning': 'evaluationBases',
    'MKV.populationSizePeriodNotes': 'evaluationBases',
    'MKV.populationSizePeriodEnd': 'evaluationBases',
    'MKV.decreaseDuringPeriod': 'evaluationBases',
    'MKV.decreaseDuringPeriodNotes': 'evaluationBases',
    'MKV.populationVaries': 'evaluationBases',
    'MKV.populationVariesNotes': 'evaluationBases',
    'MKV.fragmentedHabitats': 'evaluationBases',
    'MKV.fragmentedHabitatsNotes': 'evaluationBases',
    'MKV.borderGain': 'evaluationBases',
    'MKV.borderGainNotes': 'evaluationBases',
    'MKV.hasEndangermentReason': 'evaluationBases',
    'MKV.endangermentReasonNotes': 'evaluationBases',
    'MKV.hasThreat': 'evaluationBases',
    'MKV.threatNotes': 'evaluationBases',
    'MKV.groundsForEvaluationNotes': 'evaluationBases',
    'MKV.primaryHabitat': 'habitat',
    'MKV.secondaryHabitat': 'habitat'
  };

  constructor() { }

  @Input()
  set evaluation(evaluation: RedListEvaluation) {
    this._evaluation = evaluation;
    this.initValue();
  }

  private initValue() {
    this.occurrences = [];
    if (!this._evaluation) {
      this.generalValues = [];
      this.habitat = [];
      return;
    }
    const generalResult = [];
    const results: {[key: string]: IRow[]} = {};
    const sortBy = Object.keys(this.fieldMap);
    for (const key in this._evaluation) {
      if (!this._evaluation.hasOwnProperty(key) || this.skip.indexOf(key) > -1) {
        continue;
      }
      if (key === 'occurrences') {
        this.occurrences = this._evaluation[key].map(o => ({key: o.area, value: o.status}));
        continue;
      }
      const fullKey = 'MKV.' + (this.keyMap[key] || key);
      if (this.fieldMap[fullKey]) {
        if (!results[this.fieldMap[fullKey]]) {
          results[this.fieldMap[fullKey]] = [];
        }
        results[this.fieldMap[fullKey]].push({
          key: fullKey,
          value: Array.isArray(this._evaluation[key]) ?
            this._evaluation[key].map(h => h.habitat || h) :
            (this._evaluation[key].habitat || this._evaluation[key])
        });
        continue;
      }
      generalResult.push({
        key: fullKey,
        value: this._evaluation[key]
      });
    }
    this.generalValues = generalResult;
    Object.keys(results).forEach(key => {
      this[key] = results[key].sort(this.getSortFunction(sortBy));
    });
  }

  private getSortFunction(order: string[]) {
    return (a, b) => {
      return order.indexOf(a.key) - order.indexOf(b.key);
    };
  }

}
