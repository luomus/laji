import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client/generated/api.d';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

enum Tabs {
  censuses = 'censuses',
  // eslint-disable-next-line
  map = 'map'
}

interface State {
  tab: Tabs;
  taxon: string | undefined;
  year: string | undefined;
}

type Form = components['schemas']['Form'];

const archipelagoTaxonSets = [
  'MX.taxonSetArchipelagoWaterbirds',
  'MX.taxonSetArchipelagoWaders',
  'MX.taxonSetArchipelagoGulls',
  'MX.taxonSetArchipelagoPasserines',
  'MX.taxonSetArchipelagoAlcids',
  'MX.taxonSetArchipelagoRaptors',
  'MX.taxonSetArchipelagoCormorants',
  'MX.taxonSetArchipelagoEgrets',
  'MX.taxonSetArchipelagoMammals'
];

@Component({
  selector: 'laji-archipelago-bird-census-result',
  templateUrl: './archipelago-bird-census-result.component.html',
  styleUrls: ['./archipelago-bird-census-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ArchipelagoBirdCensusResultComponent implements OnInit, OnDestroy {
  @Input() form!: Form;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$!: Observable<State>;
  collections: string[] = ['HR.6920'];
  taxonOptions$!: Observable<{ label: string; value: string }[]>;
  mapQuery: WarehouseQueryInterface = {
    includeSubCollections: false,
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  defaultTabSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private api: LajiApiClientService
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.defaultTabSubscription = this.state$.subscribe(({ tab }) => {
      if (!Tabs[tab]) {
        this.router.navigate([], { queryParams: { tab: Tabs.censuses } });
      }
    });
    this.taxonOptions$ = this.getOptionsByTaxonSet$(archipelagoTaxonSets);
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }

  getOptionsByTaxonSet$(taxonSets: string[]): Observable<{ label: string; value: string }[]> {
    return this.api.post('/taxa',
      {
        query: {
          pageSize: 1000,
          selectedFields: 'id,vernacularName,scientificName,taxonSets'
        }
      },
      {
        taxonSets
      }).pipe(
        map(res => res.results),
        map(taxa => [...taxa].sort((a, b) => {
          const getMinIndex = (taxon: typeof taxa[number]) => {
            if (!taxon.taxonSets) {
              return taxonSets.length;
            }
            const indices = taxon.taxonSets
              .map(set => taxonSets.indexOf(set))
              .filter(i => i !== -1);
            return indices.length ? Math.min(...indices) : taxonSets.length;
          };
          return getMinIndex(a) - getMinIndex(b);
        })),
        map(taxa => taxa.map(t => ({
          label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
          value: t.id ?? ''
        }))),
        map(pairs => [{ label: this.translate.instant('result.map.taxon.empty.label'), value: '' }].concat(pairs)),
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

  onYearChange(year: any) {
    this.updateState({ year });
  }
}
