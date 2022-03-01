import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { AbstractObservation } from './abstract-observation';
import { ReloadObservationViewService } from '../shared/service/reload-observation-view.service';
import { Subscription } from 'rxjs';
import { getDescription, HeaderService } from '../shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';


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
  reloadSubscription: Subscription;
  reloadView = false;

  constructor(
    protected observationFacade: ObservationFacade,
    protected route: ActivatedRoute,
    protected searchQuery: SearchQueryService,
    protected reloadObservationView: ReloadObservationViewService,
    private headerService: HeaderService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.observationFacade.emptyQuery = {
      _coordinatesIntersection: (environment as any).observationForm?.defaultCoordinatesIntersection ?? 100
    };
    this.observationFacade.hideFooter();
    this.init();

    this.reloadSubscription = this.reloadObservationView.childEventListner().subscribe(reload => {
      this.reloadView = reload;
      if (this.reloadView) {
        this.observationFacade.hideFooter();
        this.init();
      }
      if (this.reloadSubscription) {
        this.reloadSubscription.unsubscribe();
      }
     });

     this.headerService.setHeaders({
      description: getDescription(this.translate.instant('observation.intro'))
     });
  }

  ngOnDestroy() {
    this.observationFacade.showFooter();
    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }
    this.destroy();
  }
}
