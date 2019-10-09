import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { SearchQueryService } from '../../+observation';
import { WarehouseApi } from '../../shared/api/WarehouseApi';

@Component({
  selector: 'laji-genetic-resource',
  templateUrl: './genetic-resource.component.html',
  styleUrls: ['./genetic-resource.component.scss'],
  providers: [ObservationFacade, WarehouseApi]
})
export class GeneticResourceComponent extends AbstractObservation implements OnInit, OnDestroy {

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService,
    protected warehouseApi: WarehouseApi
  ) {
    super();
    this.warehouseApi.pathList = '/warehouse/query/sample/list';
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

}
