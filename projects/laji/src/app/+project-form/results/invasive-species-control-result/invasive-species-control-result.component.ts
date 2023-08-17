import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Form } from '../../../shared/model/Form';

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
  tab: Tabs.statistics;
  municipality: string;
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

  @Input() form: Form.SchemaForm;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$: Observable<State>;

  private defaultTabSubscription: Subscription;

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
    this.router.navigate([], {queryParams: {...this.route.snapshot.queryParams, ...query}});
  }

  onMunicipalityChange(municipality: string) {
    this.updateState({municipality: municipality === 'all' ? undefined : municipality});
  }

  onTaxonChange(taxon: string) {
    this.updateState({taxon});
  }
}
