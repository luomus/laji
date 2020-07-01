import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { AbstractObservation } from './abstract-observation';
import { ReloadObservationViewService } from '../shared/service/reload-observation-view.service';
import { Subscription } from 'rxjs';

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
  subscription: Subscription;
  reloadView = false

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService,
    protected reloadObservationView: ReloadObservationViewService
  ) {
    super();
  }

  ngOnInit() {
    this.observationFacade.emptyQuery = {
      _coordinatesIntersection: 100
    };
    this.observationFacade.hideFooter();
    this.init();

    this.subscription = this.reloadObservationView.childEventListner().subscribe(reload =>{
      this.reloadView = reload
      if (this.reloadView) {
        this.observationFacade.hideFooter();
        this.init();
      }
      this.subscription.unsubscribe();
     });
  }

  ngOnDestroy() {
    this.observationFacade.showFooter();
    this.subscription.unsubscribe();
    this.destroy();
  }
}
