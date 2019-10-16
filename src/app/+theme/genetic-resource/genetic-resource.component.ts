import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { SearchQueryService } from '../../+observation';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { ObservationResultListService } from '../../+observation/result-list/observation-result-list.service';

@Component({
  selector: 'laji-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  providers: [ObservationFacade, WarehouseApi, ObservationResultListService],
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
    private observationResultListService: ObservationResultListService
  ) {
    super();
    this.warehouseApi.subPath = '/warehouse/query/sample/';
    this.observationFacade.emptyQuery = {
      sampleCollectionId: ['HR.77', 'HR.2831'],
      sampleType: ['MF.preparationTypeDNAExtract', 'MF.preparationTypeTissue']
    };
    this.observationFacade.settingsKey = 'sampleList';
    this.observationResultListService.defaultFields = [
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
    this.observationResultListService.columnGroups = [
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
          'sample.facts.preparationProcess',
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
    this.observationResultListService.allColumns = [
      { name: 'unit.taxonVerbatim',
        prop: 'unit.taxonVerbatim',
        label: 'taxonVerbatim' },
      { name: 'gathering.team', cellTemplate: 'toSemicolon' },
      { name: 'gathering.interpretations.country', cellTemplate: 'label', label: 'result.gathering.country' },
      { name: 'gathering.team.memberName',
        label: 'observation.form.team',
        aggregateBy: 'gathering.team.memberId,gathering.team.memberName'
      },
      { name: 'sample.sampleId', width: 300, sortable: false },
      { name: 'sample.type', cellTemplate: 'label', sortable: false },
      { name: 'sample.material', cellTemplate: 'label', sortable: false },
      { name: 'sample.quality', cellTemplate: 'label', sortable: false },
      { name: 'sample.status', cellTemplate: 'label', sortable: false },
      { name: 'gathering.displayDateTime' },
      { name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage' },
      { name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex' },
      { name: 'document.collectionId', prop: 'document.collection', width: 300, sortable: false },
      { name: 'sample.notes', sortable: false, label: 'result.document.notes' },
      { name: 'unit.det'},
      { name: 'gathering.conversions.wgs84', prop: 'gathering.conversions.wgs84.verbatim', sortable: false },
      { name: 'document.facts.legID', sortable: false, fact: 'MY.legID'},
      { name: 'sample.facts.preparationProcess', cellTemplate: 'label', sortable: false, fact: 'MF.preparationProcess'},
      { name: 'sample.facts.elutionMedium', cellTemplate: 'label', sortable: false, fact: 'MF.elutionMedium'},
      { name: 'sample.facts.additionalIDs', sortable: false, fact: 'MF.additionalIDs'},
      { name: 'sample.facts.qualityCheckMethod', cellTemplate: 'label', sortable: false, fact: 'MF.qualityCheckMethod'},
      { name: 'sample.facts.DNAVolumeMicroliters', sortable: false, fact: 'MY.DNAVolumeMicroliters'},
      { name: 'sample.facts.DNARatioOfAbsorbance260And280', sortable: false, fact: 'MY.DNARatioOfAbsorbance260And280'},
      { name: 'sample.facts.DNAConcentrationNgPerMicroliter', sortable: false, fact: 'MY.DNAConcentrationNgPerMicroliter'},
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
