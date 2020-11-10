import { Injectable } from '@angular/core';
import { IColumnGroup, TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { COLUMNS, IColumns } from '../../shared-modules/datatable/service/observation-table-column.service';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';

@Injectable()
export class SampleTableColumnService extends TableColumnService<ObservationTableColumn, IColumns> {
  protected defaultFields: Array<keyof IColumns> = [
    'sample.sampleId',
    'unit.taxonVerbatim',
    'gathering.interpretations.countryDisplayname',
    'sample.type',
    'sample.material',
    'sample.quality',
    'sample.facts.qualityCheckMethod',
    'sample.facts.DNAVolumeMicroliters',
    'sample.facts.DNARatioOfAbsorbance260And280',
    'sample.facts.DNAConcentrationNgPerMicroliter',
  ];

  protected columnGroups: IColumnGroup<IColumns>[][] = [
    [
      {
        header: 'Identification', fields: [
          'unit.taxonVerbatim',
          'unit.det'
        ]
      },
      {
        header: 'Date', fields: [
          'gathering.displayDateTime',
        ]
      },
      {
        header: 'Individual', fields: [
          'unit.lifeStage',
          'unit.sex'
        ]
      },
      {
        header: 'Locality', fields: [
          'gathering.interpretations.country',
          'gathering.conversions.wgs84',
          'gathering.team'
        ]
      },
    ],
    [
      {
        header: 'Preparation/Sample', fields: [
          'sample.type',
          'sample.material',
          'sample.quality',
          'sample.facts.qualityCheckMethod',
          'sample.facts.DNAVolumeMicroliters',
          'sample.facts.DNARatioOfAbsorbance260And280',
          'sample.facts.DNAConcentrationNgPerMicroliter',
          'sample.facts.preparationMaterials',
          'sample.facts.elutionMedium',
          'sample.status',
          'sample.facts.additionalIDs',
          'sample.sampleId',
        ]
      },
    ],
    [
      {
        header: 'observation.filters.other', fields: [
          'sample.notes',
          'document.facts.legID',
        ]
      }
    ]
  ];

  allColumns: ObservationTableColumn[] = [
    COLUMNS['unit.taxonVerbatim'],
    {...COLUMNS['gathering.team'], required: false},
    COLUMNS['gathering.interpretations.country'],
    COLUMNS['gathering.team.memberName'],
    COLUMNS['sample.sampleId'],
    COLUMNS['sample.type'],
    COLUMNS['sample.material'],
    COLUMNS['sample.quality'],
    COLUMNS['sample.status'],
    {...COLUMNS['gathering.displayDateTime'], required: false},
    COLUMNS['unit.lifeStage'],
    COLUMNS['unit.sex'],
    COLUMNS['sample.notes'],
    COLUMNS['unit.det'],
    COLUMNS['gathering.conversions.wgs84'],
    COLUMNS['document.facts.legID'],
    COLUMNS['sample.facts.preparationMaterials'],
    COLUMNS['sample.facts.elutionMedium'],
    COLUMNS['sample.facts.additionalIDs'],
    COLUMNS['sample.facts.qualityCheckMethod'],
    COLUMNS['sample.facts.DNAVolumeMicroliters'],
    COLUMNS['sample.facts.DNARatioOfAbsorbance260And280'],
    COLUMNS['sample.facts.DNAConcentrationNgPerMicroliter'],
  ];
}
