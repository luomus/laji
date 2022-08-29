import { Injectable } from '@angular/core';
import { Taxonomy } from '../../../../../laji/src/app/shared/model/Taxonomy';
import { ISelectFields } from '../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { TaxonomyColumns } from '../../../../../laji/src/app/+taxonomy/species/service/taxonomy-columns';
import { DatatableColumn } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { TaxonExportService } from '../../../../../laji/src/app/+taxonomy/species/service/taxon-export.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IucnTaxonExportService {
  exportKeyMap: {[key: string]: string} = {
    species: 'taxonName',
    status: 'latestRedListEvaluation.redListStatus',
    habitat: 'latestRedListEvaluationHabitats',
    reasons: 'latestRedListEvaluation.endangermentReasons',
    threats: 'latestRedListEvaluation.threats',
    reasonForStatusChange: 'latestRedListEvaluation.reasonForStatusChange',
    criteriaForStatus: 'latestRedListEvaluation.criteriaForStatus',
    2015: 'redListStatus2015',
    2010: 'redListStatus2010',
    redListGroup: 'redListEvaluationGroups'
  };
  exportTemplates: {[key: string]: string} = {
    taxonName: 'taxonName',
    'latestRedListEvaluation.redListStatus': 'label',
    latestRedListEvaluationHabitats: 'latestRedListEvaluationHabitats',
    'latestRedListEvaluation.endangermentReasons': 'label',
    'latestRedListEvaluation.threats': 'label',
    'latestRedListEvaluation.reasonForStatusChange': 'label',
    redListStatus2015: 'redListStatus2015',
    redListStatus2010: 'redListStatus2010',
    redListEvaluationGroups: 'informalTaxonGroup'
  };

  constructor(
    private taxonExportService: TaxonExportService,
    private taxonomyColumns: TaxonomyColumns
  ) { }

  download(data: Taxonomy[], fields: ISelectFields[], type: string): Observable<boolean> {
    const columns: DatatableColumn[] = [];

    fields.forEach(field => {
      let key = this.exportKeyMap[field.key] || field.key;
      const label = field.label;
      let template = this.exportTemplates[key];

      if (key.startsWith('ML.')) {
        key = 'latestRedListEvaluation.threatenedAtArea';
        template = 'latestRedListEvaluation.threatenedAtArea_' + field.key;
      } else if (key.startsWith('occurrence_ML.')) {
        const area = key.split('_')[1];
        key = 'latestRedListEvaluation.occurrences';
        template = 'latestRedListEvaluation.occurrences_' + area;
      }

      columns.push((!template ? this.taxonomyColumns.getColumn(key) : false) || {
        name: key,
        cellTemplate: template,
        label
      });
    });

    const criteria = document.getElementById('enabled-filters');
    const first = criteria ? [criteria.innerText] : undefined;
    return this.taxonExportService.downloadTaxons(columns, data, type, first);
  }
}
