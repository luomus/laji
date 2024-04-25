import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { map as rxjsMap } from 'rxjs/operators';

enum Tabs {
  chart = 'chart',
  map = 'map'
}

interface ChartState {
  tab: Tabs.chart;
  taxon: string | undefined;
}

interface MapState {
  tab: Tabs.map;
  taxon: string | undefined;
}

type State = ChartState | MapState;

@Component({
  selector: 'laji-bird-point-count-result',
  templateUrl: './bird-point-count-result.component.html',
  styleUrls: ['./bird-point-count-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdPointCountResultComponent implements OnInit, OnDestroy {
  @Input() form: Form.SchemaForm;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$: Observable<State>;
  collections = ['HR.157'];
  taxonOptions$: Observable<{ label: string; value: string }[]>;
  isChartState = (state: State): state is ChartState => state.tab === Tabs.chart;
  isMapState = (state: State): state is MapState => state.tab === Tabs.map;
  mapQuery = {
    includeSubCollections: false,
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  private defaultTabSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxonApi: TaxonomyApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.taxonOptions$ = this.getTaxonOptions$();
    this.state$ = this.route.queryParams as Observable<State>;
    this.defaultTabSubscription = this.state$.subscribe(({ tab }) => {
      if (!Tabs[tab]) {
        this.router.navigate([], { queryParams: { tab: Tabs.chart } });
      }
    });
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }

  getTaxonOptions$(): Observable<{ label: string; value: string }[]> {
    return this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        selectedFields: 'id,vernacularName,scientificName',
        informalGroupFilters: 'MVL.1',
        taxonRanks: 'MX.species',
        onlyFinnish: true,
        pageSize: 10000
      }
    ).pipe(
      rxjsMap(res => res.results),
      rxjsMap(taxa => taxa.map(t => ({
        label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
        value: t.id
      }))),
      rxjsMap(pairs => [{ label: this.translate.instant('result.map.taxon.empty.label'), value: '' }].concat(pairs))
    );
  }

  updateState(query: any) {
    const currentState = this.route.snapshot.queryParams;
    let nextState = { ...currentState, ...query };
    if (currentState.tab !== nextState.tab) { // Clear filters from state if tab changes.
      nextState = { tab: nextState.tab };
    }
    this.router.navigate([], { queryParams: nextState });
  }

  onTaxonChange(taxon: any) {
    this.updateState({ taxon });
  }
}
