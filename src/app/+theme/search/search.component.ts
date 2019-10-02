import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractObservation } from '../../+observation/abstract-observation';
import { ObservationFacade } from '../../+observation/observation.facade';
import { SearchQueryService } from '../../+observation';

@Component({
  selector: 'laji-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent extends AbstractObservation implements OnInit, OnDestroy {

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

}
