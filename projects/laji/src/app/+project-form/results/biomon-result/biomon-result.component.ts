import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Form } from '../../../shared/model/Form';

export type CompleteListPrevalence = 'ONE' | 'FIVE' | 'TEN' | 'FIFTY' | 'HUNDRED' | 'FIVE_HUNDRED';

enum Tabs {
  statistics = 'statistics',
  map = 'map'
}

interface StatisticsState {
  tab: Tabs.statistics;
  collection: string | undefined;
}

interface MapState {
  tab: Tabs.map;
  collection: string | undefined;
  taxon: string | undefined;
}

type State = StatisticsState | MapState;

@Component({
  selector: 'laji-biomon-result',
  templateUrl: './biomon-result.component.html',
  styleUrls: ['./biomon-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BiomonResultComponent implements OnInit, OnDestroy {

  @Input() form: Form.SchemaForm;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$: Observable<State>;
  isStatisticsState = (state: State): state is StatisticsState => state.tab === Tabs.statistics;
  isMapState = (state: State): state is MapState => state.tab === Tabs.map;

  private defaultTabSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.defaultTabSubscription = this.state$.subscribe(({ tab }) => {
      if (!Tabs[tab]) {
        this.router.navigate([], { queryParams: { tab: Tabs.statistics } });
      }
    });
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }

  updateState(query: any) {
    const currentState = this.route.snapshot.queryParams;
    let nextState = { ...currentState, ...query };
    if (currentState.tab !== nextState.tab) { // Clear filters from state if tab changes.
      nextState = { tab: nextState.tab };
    }
    this.router.navigate([], { queryParams: nextState });
  }

  onMunicipalityChange(municipality: any) {
    this.updateState({ municipality: municipality === 'all' ? undefined : municipality });
  }

  onTaxonChange(taxon: any) {
    this.updateState({ taxon });
  }
}
