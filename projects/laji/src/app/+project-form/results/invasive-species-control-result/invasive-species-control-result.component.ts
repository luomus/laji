import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Form } from '../../../shared/model/Form';

export type InvasiveControlEffectiveness = 'FULL' | 'PARTIAL' | 'NO_EFFECT' | 'NOT_FOUND';

enum Tabs {
  statistics = 'statistics',
  map = 'map'
}

interface StatisticsState {
  tab: Tabs.statistics;
  municipality: string;
  taxon: string;
}

interface MapState {
  tab: Tabs.map;
  year: string;
  taxon: string;
}

type State = StatisticsState | MapState;

@Component({
  selector: 'laji-invasive-species-control-result',
  templateUrl: './invasive-species-control-result.component.html',
  styleUrls: ['./invasive-species-control-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveSpeciesControlResultComponent implements OnInit, OnDestroy {

  @Input() form!: Form.SchemaForm;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$!: Observable<State>;
  isStatisticsState = (state: State): state is StatisticsState => state.tab === Tabs.statistics;
  isMapState = (state: State): state is MapState => state.tab === Tabs.map;

  private defaultTabSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.defaultTabSubscription = this.state$.subscribe(({tab}) => {
      if (!Tabs[tab]) {
        this.router.navigate([], {queryParams: {tab: Tabs.statistics}});
      }
    });
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }

  updateState(query: any) {
    const currentState = this.route.snapshot.queryParams;
    let nextState = {...currentState, ...query};
    if (currentState.tab !== nextState.tab) { // Clear filters from state if tab changes.
      nextState = {tab: nextState.tab};
    }
    this.router.navigate([], {queryParams: nextState});
  }

  onMunicipalityChange(municipality: string) {
    this.updateState({municipality: municipality === 'all' ? undefined : municipality});
  }

  onTaxonChange(taxon: string) {
    this.updateState({taxon});
  }

  onYearChange(year: string) {
    this.updateState({year});
  }
}
