import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { SearchQueryService } from '../../+observation';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { COLUMNS, TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ObservationListService } from '../../shared-modules/observation-result/service/observation-list.service';

@Component({
  selector: 'laji-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  providers: [ObservationFacade, WarehouseApi, TableColumnService, ObservationListService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneticResourceComponent extends AbstractObservation implements OnInit, OnDestroy {

  public skipUrlParams = [
    'selected',
    'pageSize',
    'page'
  ];

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService,
    protected warehouseApi: WarehouseApi,
    private tableColumnService: TableColumnService,
    private observationListService: ObservationListService
  ) {
    super();
    this.observationListService.idFields = ['sample.sampleId', 'unit.unitId', 'document.documentId'];
    this.warehouseApi.subPath = '/warehouse/query/sample/';
    this.observationFacade.emptyQuery = {
      sampleCollectionId: ['HR.77', 'HR.2831'],
      sampleType: ['MF.preparationTypeDNAExtract', 'MF.preparationTypeTissue']
    };
    this.observationFacade.settingsKey = 'sampleList';
    this.tableColumnService.defaultFields = [
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
    this.tableColumnService.columnGroups = [
      { header: 'Identification', fields: [
        'unit.taxonVerbatim',
        'unit.det'
      ]},
      { header: 'Date', fields: [
          'gathering.displayDateTime',
        ]},
      { header: 'Individual', fields: [
          'unit.lifeStage',
          'unit.sex'
        ]},
      { header: 'Preparation/Sample', fields: [
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
        ]},
      { header: 'Locality', fields: [
          'gathering.interpretations.country',
          'gathering.conversions.wgs84',
          'gathering.team'
        ]},
      { header: 'observation.filters.other', fields: [
          'sample.notes',
          'document.collectionId',
          'document.facts.legID',
        ]}
    ];
    this.tableColumnService.allColumns = [
      COLUMNS['unit.taxonVerbatim'],
      COLUMNS['gathering.team'],
      COLUMNS['gathering.interpretations.country'],
      COLUMNS['gathering.team.memberName'],
      COLUMNS['sample.sampleId'],
      COLUMNS['sample.type'],
      COLUMNS['sample.material'],
      COLUMNS['sample.quality'],
      COLUMNS['sample.status'],
      COLUMNS['gathering.displayDateTime'],
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

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  protected onQueryChange(query: WarehouseQueryInterface) {
    const skip = [
      'selected',
      'pageSize',
      'page'
    ];
    if (Util.equalsArray(query.sampleType, this.observationFacade.emptyQuery.sampleType)) {
      skip.push('sampleType');
    }
    if (Util.equalsArray(query.sampleCollectionId, this.observationFacade.emptyQuery.sampleCollectionId)) {
      skip.push('sampleCollectionId');
    }
    this.skipUrlParams = skip;
  }

}
