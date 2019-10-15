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
    ];
    this.observationResultListService.columnGroups = [
      { header: 'sample', fields: [
          'sample.sampleId',
          'sample.type',
          'sample.material',
          'sample.quality',
          'sample.status',
        ]},
      { header: 'identification', fields: [
        'unit.taxonVerbatim'
      ]},
      { header: 'observation.form.date', fields: [
          'gathering.displayDateTime',
        ]},
      { header: 'persons', fields: [
          'gathering.team',
          'unit.det'
        ]},
      { header: 'observation.form.unit', fields: [
          'unit.lifeStage',
          'unit.sex'
        ]},
      { header: 'observation.form.place', fields: [
          'gathering.interpretations.countryDisplayname'
        ]},
      { header: 'result.gathering.coordinatesVerbatim', fields: [
          'gathering.conversions.wgs84',
        ]},
      { header: 'observation.filters.other', fields: [
          'sample.notes',
        ]}
    ];
    this.observationResultListService.allColumns = [
      { name: 'unit.taxonVerbatim',
        prop: 'unit.taxonVerbatim',
        label: 'taxonVerbatim' },
      { name: 'gathering.team', cellTemplate: 'toSemicolon' },
      { name: 'gathering.interpretations.countryDisplayname', label: 'result.gathering.country' },
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
      { name: 'document.facts.legID', prop: 'document.facts', sortable: false },
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
