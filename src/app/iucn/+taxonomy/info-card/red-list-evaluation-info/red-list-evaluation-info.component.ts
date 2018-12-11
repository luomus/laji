import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-red-list-evaluation-info',
  templateUrl: './red-list-evaluation-info.component.html',
  styleUrls: ['./red-list-evaluation-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoComponent {

  generalValues: {key: string, value: any}[] = [];
  habitatValues: {key: string, value: any}[] = [];
  occurrences = [];

  private _evaluations: any;
  private _year: number;
  private skip = ['calculatedRedListIndex'];
  private habitatKeys = ['MKV.primaryHabitat', 'MKV.secondaryHabitat'];
  private keyMap = {
    'secondaryHabitats': 'secondaryHabitat',
    'endangermentReasons': 'hasEndangermentReason',
    'threats': 'hasThreat',
  };

  constructor() { }

  @Input()
  set evaluations(evaluations: any) {
    this._evaluations = evaluations;
    this.initValue();
  }

  @Input()
  set year(year: number) {
    this._year = year;
    this.initValue();
  }

  private initValue() {
    this.occurrences = [];
    if (!this._evaluations || !this._year) {
      this.generalValues = [];
      this.habitatValues = [];
      return;
    }
    const evaluation = this._evaluations[this._year];
    const generalResult = [];
    const habitatResult = [];
    for (const key in evaluation) {
      if (!evaluation.hasOwnProperty(key) || this.skip.indexOf(key) > -1) {
        continue;
      }
      if (key === 'occurrences') {
        this.occurrences = evaluation[key];
        continue;
      }
      const fullKey = 'MKV.' + (this.keyMap[key] || key);
      if (this.habitatKeys.indexOf(fullKey) > -1) {
        habitatResult.push({
          key: fullKey,
          value: Array.isArray(evaluation[key]) ? evaluation[key].map(h => h.habitat) : evaluation[key].habitat
        });
        continue;
      }
      generalResult.push({
        key: fullKey,
        value: evaluation[key]
      });
    }
    this.generalValues = generalResult;
    this.habitatValues = habitatResult.sort(this.getSortFunction(this.habitatKeys));
  }

  private getSortFunction(order: string[]) {
    return (a, b) => {
      return order.indexOf(a.key) - order.indexOf(b.key);
    };
  }

}
