import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { SearchQueryService } from '../../+observation';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';

@Component({
  selector: 'laji-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  providers: [ObservationFacade, WarehouseApi],
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
    protected warehouseApi: WarehouseApi
  ) {
    super();
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
