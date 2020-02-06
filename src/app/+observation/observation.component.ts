import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { AbstractObservation } from './abstract-observation';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      z-index: auto;
    }
  `],
  providers: [SearchQueryService, ObservationFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationComponent extends AbstractObservation implements OnInit, OnDestroy {

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService
  ) {
    super();
  }

  ngOnInit() {
    this.observationFacade.emptyQuery = {
      _coordinatesIntersection: 100
    };
    this.observationFacade.hideFooter();
    this.init();
  }

  ngOnDestroy() {
    this.observationFacade.showFooter();
    this.destroy();
  }
}
