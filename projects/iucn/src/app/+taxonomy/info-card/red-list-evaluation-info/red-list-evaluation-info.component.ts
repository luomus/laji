import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IRow } from './red-list-evaluation-info-rowset/red-list-evaluation-info-rowset.component';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type RedListEvaluation = components['schemas']['Evaluation'];

interface KeyMapType {
  secondaryHabitats: string;
  endangermentReasons: string;
  threats: string;
}

interface LocalTranslateType {
  'MKV.hasEndangermentReason': string;
  'MKV.hasThreat': string;
}

interface MinMaxItemType {
  fields: string[];
  combineTo: string;
}

interface MinMaxType {
  distributionAreaMin: MinMaxItemType;
  distributionAreaMax: MinMaxItemType;
  occurrenceAreaMin: MinMaxItemType;
  occurrenceAreaMax: MinMaxItemType;
  individualCountMin: MinMaxItemType;
  individualCountMax: MinMaxItemType;
}

@Component({
  selector: 'iucn-red-list-evaluation-info',
  templateUrl: './red-list-evaluation-info.component.html',
  styleUrls: ['./red-list-evaluation-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListEvaluationInfoComponent {

  endanger: IRow[] = [];
  taxonInterpretation: IRow[] = [];
  occurrenceInfo: IRow[] = [];
  habitat: IRow[] = [];
  occurrences: IRow[] = [];
  evaluationBases: IRow[] = [];
  criteria: IRow[] = [];
  sources: IRow[] = [];
  _evaluation?: RedListEvaluation;

  private keyMap: KeyMapType = {
    secondaryHabitats: 'secondaryHabitat',
    endangermentReasons: 'hasEndangermentReason',
    threats: 'hasThreat',
  };

  private localTranslate: LocalTranslateType = {
    'MKV.hasEndangermentReason': 'iucn.hasEndangermentReason',
    'MKV.hasThreat': 'iucn.hasThreat'
  };

  private fieldMap: Record<string, string> = {
    // 'MKV.generationAge': 'evaluationBases',
    // 'MKV.generationAgeNotes': 'evaluationBases',
    // 'MKV.evaluationPeriodLength': 'evaluationBases',
    // 'MKV.evaluationPeriodLengthNotes': 'evaluationBases',
    // 'MKV.individualCount': 'evaluationBases',
    // 'MKV.individualCountNotes': 'evaluationBases',
    // 'MKV.populationSizePeriodBeginning': 'evaluationBases',
    // 'MKV.populationSizePeriodNotes': 'evaluationBases',
    // 'MKV.populationSizePeriodEnd': 'evaluationBases',
    // 'MKV.decreaseDuringPeriod': 'evaluationBases',
    // 'MKV.decreaseDuringPeriodNotes': 'evaluationBases',
    // 'MKV.populationVaries': 'evaluationBases',
    // 'MKV.populationVariesNotes': 'evaluationBases',
    // 'MKV.fragmentedHabitats': 'evaluationBases',
    // 'MKV.fragmentedHabitatsNotes': 'evaluationBases',
    // 'MKV.borderGain': 'evaluationBases',
    // 'MKV.borderGainNotes': 'evaluationBases',
    'MKV.hasEndangermentReason': 'evaluationBases',
    // 'MKV.endangermentReasonNotes': 'evaluationBases',
    'MKV.hasThreat': 'evaluationBases',
    // 'MKV.threatNotes': 'evaluationBases',
    // 'MKV.groundsForEvaluationNotes': 'evaluationBases',
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
    'MKV.distributionArea': 'occurrenceInfo',
    'MKV.distributionAreaNotes': 'occurrenceInfo',
    'MKV.occurrenceArea': 'occurrenceInfo',
    'MKV.occurrenceAreaNotes': 'occurrenceInfo',
    'MKV.occurrenceNotes': 'occurrenceInfo',
    // 'MKV.redListStatus': 'endanger',
    // 'MKV.redListStatusNotes': 'endanger',
    // 'MKV.ddReason': 'endanger',
    // 'MKV.ddReasonNotes': 'endanger',
    // 'MKV.ddReasonClass': 'endanger',
    // 'MKV.criteriaForStatus': 'endanger',
    // 'MKV.criteriaForStatusNotes': 'endanger',
    // 'MKV.redListStatusMin': 'endanger',
    // 'MKV.redListStatusMax': 'endanger',
    // 'MKV.exteralPopulationImpactOnRedListStatus': 'endanger',
    // 'MKV.exteralPopulationImpactOnRedListStatusNotes': 'endanger',
    // 'MKV.reasonForStatusChange': 'endanger',
    // 'MKV.reasonForStatusChangeNotes': 'endanger',
    // 'MKV.possiblyRE': 'endanger',
    // 'MKV.possiblyRENotes': 'endanger',
    // 'MKV.lastSightingNotes': 'endanger',
    // 'MKV.redListStatusAccuracyNotes': 'endanger',
    // 'MKV.lsaRecommendation': 'endanger',
    // 'MKV.lsaRecommendationNotes': 'endanger',
    // 'MKV.percentageOfGlobalPopulation': 'endanger',
    // 'MKV.percentageOfGlobalPopulationNotes': 'endanger',
  };

  minMax: MinMaxType = {
    distributionAreaMin: {fields: ['distributionAreaMin', 'distributionAreaMax'], combineTo: 'distributionArea'},
    distributionAreaMax: {fields: ['distributionAreaMin', 'distributionAreaMax'], combineTo: 'distributionArea'},
    occurrenceAreaMin: {fields: ['occurrenceAreaMin', 'occurrenceAreaMax'], combineTo: 'occurrenceArea'},
    occurrenceAreaMax: {fields: ['occurrenceAreaMin', 'occurrenceAreaMax'], combineTo: 'occurrenceArea'},
    individualCountMin: {fields: ['individualCountMin', 'individualCountMax'], combineTo: 'individualCount'},
    individualCountMax: {fields: ['individualCountMin', 'individualCountMax'], combineTo: 'individualCount'}
  };

  constructor(
    private translateService: TranslateService
  ) { }

  @Input()
  set evaluation(evaluation: RedListEvaluation) {
    this._evaluation = {...evaluation};
    this.initValue();
  }

  private initValue() {
    this.occurrences = [];
    if (!this._evaluation) {
      this.habitat = [];
      this.endanger = [];
      this.taxonInterpretation = [];
      this.occurrenceInfo = [];
      this.habitat = [];
      this.occurrences = [];
      this.evaluationBases = [];
      this.criteria = [];
      this.sources = [];
      return;
    }
    const results: {[key: string]: IRow[]} = {};
    const sortBy = Object.keys(this.fieldMap);
    let key: keyof RedListEvaluation;
    for (key in this._evaluation) {
      if (!this._evaluation.hasOwnProperty(key)) {
        continue;
      }
      let translate = '';
      if (this.minMax[key as keyof MinMaxType]) {
        const combine = this.minMax[key as keyof MinMaxType];
        key = combine.combineTo as keyof RedListEvaluation;
        (this._evaluation as any)[key] = (this._evaluation[combine.fields[0] as keyof RedListEvaluation] || '')
          + ' — '
          + (this._evaluation[combine.fields[1] as keyof RedListEvaluation] || '') as any;
        translate = 'iucn.taxon.' + key;
        delete this._evaluation[combine.fields[0] as keyof RedListEvaluation];
        delete this._evaluation[combine.fields[1] as keyof RedListEvaluation];
      }
      if (key === 'occurrences') {
        this.occurrences = this._evaluation[key]!.map(o => ({key: o.area, value: o.status}));
        continue;
      }
      const fullKey = 'MKV.' + (this.keyMap[key as keyof KeyMapType] || key) as keyof LocalTranslateType;
      if (this.localTranslate[fullKey]) {
        translate = this.localTranslate[fullKey];
      }
      if (this.fieldMap[fullKey]) {
        if (!results[this.fieldMap[fullKey]]) {
          results[this.fieldMap[fullKey]] = [];
        }
        const values = [];
        if (Array.isArray(this._evaluation[key])) {
          (this._evaluation[key]! as any[]).forEach((item: any) => {
            if (typeof item === 'object') {
              values.push(...this.getValues(item));
            } else {
              values.push(item);
            }
          });
        } else if (typeof this._evaluation[key] === 'object') {
          values.push(...this.getValues(this._evaluation[key]));
        } else {
          if (typeof this._evaluation[key] === 'boolean') {
            values.push(this.translateService.instant(this._evaluation[key] ? 'yes' : 'no'));
          } else {
            values.push(this._evaluation[key]);
          }
        }
        if (values.length > 0) {
          results[this.fieldMap[fullKey]].push({
            key: fullKey,
            value: values,
            translate
          });
        }
      }
    }
    Object.keys(results).forEach(_key => {
      (this as any)[_key] = results[_key].sort(this.getSortFunction(sortBy));
    });
  }

  private getValues(obj: any): string[] {
    const values = [];
    if (obj.habitat) {
      values.push(obj.habitat);
    }
    if (obj.habitatSpecificTypes) {
      values.push(...obj.habitatSpecificTypes);
    }
    return values;
  }

  private getSortFunction(order: string[]) {
    return (a: any, b: any) => order.indexOf(a.key) - order.indexOf(b.key);
  }

}
