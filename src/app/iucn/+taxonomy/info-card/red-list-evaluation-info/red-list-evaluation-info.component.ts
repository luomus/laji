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
  occurrenceInfo: IRow[] = [];
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
    'MKV.secondaryHabitat': 'habitat',
    'MKV.criteriaA': 'criteria',
    'MKV.criteriaANotes': 'criteria',
    'MKV.statusA': 'criteria',
    'MKV.statusANotes': 'criteria',
    'MKV.criteriaB': 'criteria',
    'MKV.criteriaBNotes': 'criteria',
    'MKV.statusB': 'criteria',
    'MKV.statusBNotes': 'criteria',
    'MKV.criteriaC': 'criteria',
    'MKV.criteriaCNotes': 'criteria',
    'MKV.statusC': 'criteria',
    'MKV.statusCNotes': 'criteria',
    'MKV.criteriaD': 'criteria',
    'MKV.criteriaDNotes': 'criteria',
    'MKV.statusD': 'criteria',
    'MKV.statusDNotes': 'criteria',
    'MKV.criteriaE': 'criteria',
    'MKV.criteriaENotes': 'criteria',
    'MKV.statusE': 'criteria',
    'MKV.statusENotes': 'criteria',
    'MKV.criteriaNotes': 'criteria',
    'MKV.publication': 'sources',
    'MKV.otherSources': 'sources',
    'MKV.distributionAreaMin': 'occurrenceInfo',
    'MKV.distributionAreaMax': 'occurrenceInfo',
    'MKV.distributionAreaNotes': 'occurrenceInfo',
    'MKV.occurrenceAreaMin': 'occurrenceInfo',
    'MKV.occurrenceAreaMax': 'occurrenceInfo',
    'MKV.occurrenceAreaNotes': 'occurrenceInfo',
    'MKV.occurrenceNotes': 'occurrenceInfo',
    'MKV.redListStatus': 'endanger',
    'MKV.redListStatusNotes': 'endanger',
    'MKV.ddReason': 'endanger',
    'MKV.ddReasonNotes': 'endanger',
    'MKV.ddReasonClass': 'endanger',
    'MKV.criteriaForStatus': 'endanger',
    'MKV.criteriaForStatusNotes': 'endanger',
    'MKV.redListStatusMin': 'endanger',
    'MKV.redListStatusMax': 'endanger',
    'MKV.exteralPopulationImpactOnRedListStatus': 'endanger',
    'MKV.exteralPopulationImpactOnRedListStatusNotes': 'endanger',
    'MKV.reasonForStatusChange': 'endanger',
    'MKV.reasonForStatusChangeNotes': 'endanger',
    'MKV.possiblyRE': 'endanger',
    'MKV.possiblyRENotes': 'endanger',
    'MKV.lastSightingNotes': 'endanger',
    'MKV.redListStatusAccuracyNotes': 'endanger',
    'MKV.lsaRecommendation': 'endanger',
    'MKV.lsaRecommendationNotes': 'endanger',
    'MKV.percentageOfGlobalPopulation': 'endanger',
    'MKV.percentageOfGlobalPopulationNotes': 'endanger',
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
