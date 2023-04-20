import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, share, switchMap, take, tap } from 'rxjs/operators';
import { hotObjectObserver } from '../shared/observable/hot-object-observer';
import { BrowserService } from '../shared/service/browser.service';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../shared/service/user.service';
import { Autocomplete } from '../shared/model/Autocomplete';
import { FooterService } from '../shared/service/footer.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { ObservationDataService } from './observation-data.service';
import { SearchQueryService } from './search-query.service';
import { Util } from '../shared/service/util.service';

interface IObservationState {
  query: WarehouseQueryInterface;
  newQuery: WarehouseQueryInterface;
  newQueryHasChanges: boolean;
  filterVisible: boolean;
  settingsMap: any;
  activeTab?: string;
  countTaxa: number;
  countUnit: number;
  loadingTaxa: boolean;
  loadingUnits: boolean;
}

interface ITaxonAutocomplete extends Autocomplete {
  groups: string;
}

export interface IObservationViewModel extends IObservationState {
  lgScreen: boolean;
}

let _state: IObservationState = {
  query: {},
  newQuery: {},
  newQueryHasChanges: false,
  filterVisible: true,
  activeTab: undefined,
  countTaxa: 0,
  countUnit: 0,
  loadingTaxa: false,
  loadingUnits: false,
  settingsMap: {}
};

@Injectable()
export class ObservationFacade {

  // This value is visible in the query parameters when parameters with person token is used and the query is obscured.
  static PERSON_TOKEN = 'true';

  private store  = new BehaviorSubject<IObservationState>(_state);
  state$ = this.store.asObservable();

  readonly lgScreen$           = this.browserService.lgScreen$;
  readonly query$              = this.state$.pipe(map((state) => state.query), distinctUntilChanged());
  readonly newQuery$           = this.state$.pipe(map((state) => state.newQuery), distinctUntilChanged());
  readonly newQueryHasChanges$ = this.state$.pipe(map((state) => state.newQueryHasChanges));
  readonly loading$            = this.state$.pipe(map((state) => state.loadingUnits));
  readonly loadingTaxa$        = this.state$.pipe(map((state) => state.loadingTaxa));
  readonly activeTab$          = this.state$.pipe(map((state) => state.activeTab), distinctUntilChanged());
  readonly countUnit$          = this.query$.pipe(switchMap((query) => this.countUnits(query)));
  readonly countTaxa$          = this.query$.pipe(switchMap((query) => this.countTaxa(query)));
  readonly filterVisible$      = this.state$.pipe(map((state) => state.filterVisible));
  readonly settingsMap$        = this.state$.pipe(map((state) => state.settingsMap), distinctUntilChanged());

  vm$: Observable<IObservationViewModel> = hotObjectObserver<IObservationViewModel>({
    lgScreen: this.lgScreen$,
    query: this.query$,
    newQuery: this.newQuery$,
    newQueryHasChanges: this.newQueryHasChanges$,
    loadingUnits: this.loading$,
    loadingTaxa: this.loadingTaxa$,
    activeTab: this.activeTab$,
    countUnit: this.countUnit$,
    countTaxa: this.countTaxa$,
    filterVisible: this.filterVisible$,
    settingsMap: this.settingsMap$
  });

  private queryHash?: string;
  private _emptyQuery: WarehouseQueryInterface = {};

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private footerService: FooterService,
    private warehouseApi: WarehouseApi,
    private observationDataService: ObservationDataService
  ) {
    this.updateState({..._state});
  }

  activeTab(tab: string) {
    if (_state.activeTab !== tab) {
      this.updateState({..._state, activeTab: tab});
    }
  }

  filterVisible(filterVisible: boolean) {
    if (_state.filterVisible !== filterVisible) {
      this.updateState({..._state, filterVisible});
    }
  }

  updateQuery$(warehouseQuery: WarehouseQueryInterface): Observable<any> {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      tap(loggedIn => {
        const query = {...this.emptyQuery, ...warehouseQuery};

        ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken', 'editorOrObserverIsNotPersonToken'].forEach(key => {
          if (query[key] === ObservationFacade.PERSON_TOKEN) {
            query[key] =  loggedIn ? this.userService.getToken() : undefined;
          }
        });

        const newQuery = Util.clone(query);
        const nextState = {..._state, newQuery, newQueryHasChanges: false};

        const hash = JSON.stringify(warehouseQuery);
        if (this.queryHash === hash) {
          this.updateState(nextState);
          return;
        }
        this.queryHash = hash;

        this.updateState({...nextState, query, loadingUnits: true, loadingTaxa: true});
      })
    );
  }

  updateNewQuery(warehouseQuery: WarehouseQueryInterface) {
    const hasChanges = SearchQueryService.queriesHaveDifferences(_state.query, warehouseQuery);
    this.updateState({..._state, newQuery: warehouseQuery, newQueryHasChanges: hasChanges});
  }

  set emptyQuery(query: WarehouseQueryInterface) {
    this._emptyQuery = query;
  }

  get emptyQuery() {
    return this._emptyQuery;
  }

  clearQuery() {
    this.updateQuery$(this.emptyQuery).subscribe();
  }

  taxaAutocomplete(token: string, informalTaxonGroupId: string[], limit: number): Observable<ITaxonAutocomplete[]> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '' + limit,
      includePayload: true,
      lang: this.translateService.currentLang,
      informalTaxonGroup: informalTaxonGroupId?.toString(),
      excludeNameTypes: 'MX.hasMisspelledName,MX.hasMisappliedName'
    } as LajiApi.Query.AutocompleteQuery).pipe(
      map<Autocomplete[], ITaxonAutocomplete[]>(data => data.map(item => {
        let groups = '';
        if (item.payload && item.payload.informalTaxonGroups) {
          groups = item.payload.informalTaxonGroups.reduce((prev, curr) => prev + ' ' + curr.id, groups);
        }
        return {...item, groups};
      }))
    );
  }

  showFooter() {
    this.footerService.footerVisible = true;
  }

  hideFooter() {
    this.footerService.footerVisible = false;
  }

  private countUnits(query: WarehouseQueryInterface): Observable<number> {
    return this.observationDataService.getData(query).pipe(
      map(data => data.units.total),
      tap(countUnit => this.updateState({..._state, loadingUnits: false, countUnit})),
      catchError(() => this.count(this.warehouseApi.warehouseQueryCountGet(query), 'loadingUnits', 'countUnit'))
    );
  }

  private countTaxa(query: WarehouseQueryInterface): Observable<number> {
    return this.observationDataService.getData(query).pipe(
      map(data => data.species.total),
      tap(countTaxa => this.updateState({..._state, loadingTaxa: false, countTaxa})),
      catchError(() => this.count(
        this.warehouseApi.warehouseQueryAggregateGet(
          {...query},
          ['unit.linkings.taxon.speciesId'], [], 1, 1
        ),
        'loadingTaxa',
        'countTaxa'
      )),
      tap(() => this.browserService.triggerResizeEvent())
    );
  }

  private count(src: Observable<any>, loadingKey: keyof IObservationState, countKey:  keyof IObservationState) {
    return src.pipe(
      map(result => result.total),
      catchError(() => of(null)),
      distinctUntilChanged(),
      tap((cnt) => this.updateState({..._state, [loadingKey]: false, [countKey]: cnt})),
      share()
    );
  }

  private updateState(state: IObservationState) {
    this.store.next(_state = state);
  }
}
