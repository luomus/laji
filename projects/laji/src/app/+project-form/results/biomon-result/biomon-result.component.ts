import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Form } from '../../../shared/model/Form';
import { FormService } from '../../../shared/service/form.service';
import { map as rxjsMap, switchMap } from 'rxjs/operators'; // "map" reserved for tab logic
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';

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
  taxonOptions$: Observable<{ label: string; value: string }[]>;
  isStatisticsState = (state: State): state is StatisticsState => state.tab === Tabs.statistics;
  isMapState = (state: State): state is MapState => state.tab === Tabs.map;
  mapQuery = {
    completeListType: ['MY.completeListTypeCompleteWithBreedingStatus,MY.completeListTypeComplete'],
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  private defaultTabSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formApi: FormService,
    private taxonApi: TaxonomyApi,
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
      rxjsMap(forms =>
        forms
          .filter(f => (f.collectionID !== undefined && f.options.prepopulateWithTaxonSets !== undefined))
          .map(f => ({ collectionID: f.collectionID, taxonSet: f.options.prepopulateWithTaxonSets }))
      ),
      switchMap(pairs => {
        let taxonSet: string[];
        this.state$.pipe(
          rxjsMap(state => pairs.find(p => p.collectionID === (state.collection ? state.collection : this.form.collectionID)).taxonSet),
        ).subscribe(set => taxonSet = set);
        return this.getOptionsByTaxonSet$(taxonSet);
      })
    );
  }

  getOptionsByTaxonSet$(taxonSet: string[]): Observable<{ label: string; value: string }[]> {
    return this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        selectedFields: 'id,vernacularName,scientificName',
        taxonSets: taxonSet
      }
    ).pipe(
      rxjsMap(res => res.results),
      rxjsMap(taxa => taxa.map(t => ({
        label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
        value: t.id
      }))),
      rxjsMap(pairs => [{ label: '', value: '' }].concat(pairs)),
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