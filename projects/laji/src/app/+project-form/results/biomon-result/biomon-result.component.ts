import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Form } from '../../../shared/model/Form';
import { FormService } from '../../../shared/service/form.service';
import { map, switchMap } from 'rxjs/operators'; // "map" reserved for tab logic
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

export type CompleteListPrevalence = 'ONE' | 'FIVE' | 'TEN' | 'FIFTY' | 'HUNDRED' | 'FIVE_HUNDRED';

enum Tabs {
  statistics = 'statistics',
  // eslint-disable-next-line
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
  year: string | undefined;
}

type State = StatisticsState | MapState;

@Component({
  selector: 'laji-biomon-result',
  templateUrl: './biomon-result.component.html',
  styleUrls: ['./biomon-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BiomonResultComponent implements OnInit, OnDestroy {

  @Input() form!: Form.SchemaForm;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  state$!: Observable<State>;
  taxonOptions$!: Observable<{ label: string; value: string }[]>;
  isStatisticsState = (state: State): state is StatisticsState => state.tab === Tabs.statistics;
  isMapState = (state: State): state is MapState => state.tab === Tabs.map;
  mapQuery: WarehouseQueryInterface = {
    completeListType: ['MY.completeListTypeCompleteWithBreedingStatus,MY.completeListTypeComplete'],
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  private defaultTabSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formApi: FormService,
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.defaultTabSubscription = this.state$.subscribe(({ tab }) => {
      if (!Tabs[tab]) {
        this.router.navigate([], { queryParams: { tab: Tabs.statistics } });
      }
    });
    this.taxonOptions$ = this.getTaxonOptions$();
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }

  getTaxonOptions$(): Observable<{ label: string; value: string }[]> {
    return this.formApi.getAllForms().pipe(
      map(forms =>
        forms
          .filter(f => (f.collectionID !== undefined && f.options.prepopulateWithTaxonSets !== undefined))
          .map(f => ({ collectionID: f.collectionID, taxonSet: f.options.prepopulateWithTaxonSets }))
      ),
      switchMap(pairs => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const taxonSet = pairs.find(p => p.collectionID === this.form.collectionID)!.taxonSet;
        return this.getOptionsByTaxonSet$(taxonSet ? taxonSet : []);
      })
    );
  }

  getOptionsByTaxonSet$(taxonSets: string[]): Observable<{ label: string; value: string }[]> {
    return this.api.post('/taxa', {
      query: { selectedFields: 'id,vernacularName,scientificName' }
    }, { taxonSets }
    ).pipe(
      map(res => res.results),
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
