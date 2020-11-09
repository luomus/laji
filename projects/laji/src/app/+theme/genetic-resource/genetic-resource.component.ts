import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ObservationResultService } from '../../shared-modules/observation-result/service/observation-result.service';
import { SampleTableColumnService } from './sample-table-column.service';
import { SearchQueryService } from '../../+observation/search-query.service';

@Component({
  selector: 'laji-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  providers: [
    ObservationFacade,
    WarehouseApi,
    {provide: TableColumnService, useClass: SampleTableColumnService},
    ObservationResultService
  ],
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
    private observationListService: ObservationResultService
  ) {
    super();
    this.observationListService.idFields = ['sample.sampleId', 'unit.unitId', 'document.documentId'];
    this.warehouseApi.subPath = '/warehouse/query/sample/';
    this.observationFacade.emptyQuery = {
      sampleCollectionId: ['HR.77', 'HR.2831'],
      sampleType: ['MF.preparationTypeDNAExtract', 'MF.preparationTypeTissue']
    };
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
