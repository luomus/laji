import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { hotObjectObserver } from '../shared/observable/hot-object-observer';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../shared/service/browser.service';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../shared/service/user.service';
import { Autocomplete } from '../shared/model/Autocomplete';
import { FooterService } from '../shared/service/footer.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';

interface IPersistentState {
  showIntro: boolean;
  advanced: boolean;
}

interface IObservationState extends IPersistentState {
  query: WarehouseQueryInterface;
  filterVisible: boolean;
  usersMapSettings: any;
  activeTab: string;
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

const emptyQuery: WarehouseQueryInterface = {
  _coordinatesIntersection: 100
};

let _state: IObservationState = {
  query: {...emptyQuery},
  advanced: false,
  showIntro: true,
  filterVisible: true,
  usersMapSettings: {},
  activeTab: 'map',
  countTaxa: 0,
  countUnit: 0,
  loadingTaxa: false,
  loadingUnits: false
};

const _persistentState: IPersistentState = {
  showIntro: true,
  advanced: false
};

@Injectable({providedIn: 'root'})
export class ObservationFacade {

  static PERSON_TOKEN = 'true';

  @LocalStorage('observationState', _persistentState)
  private persistentState: IPersistentState;

  private store  = new BehaviorSubject<IObservationState>(_state);
  state$ = this.store.asObservable();

  lgScreen$         = this.browserService.lgScreen$;
  query$            = this.state$.pipe(map((state) => state.query), distinctUntilChanged());
  loading$          = this.state$.pipe(map((state) => state.loadingUnits));
  loadingTaxa$      = this.state$.pipe(map((state) => state.loadingTaxa));
  advanced$         = this.state$.pipe(map((state) => state.advanced));
  activeTab$        = this.state$.pipe(map((state) => state.activeTab), distinctUntilChanged());
  showIntro$        = this.state$.pipe(map((state) => state.showIntro));
  countUnit$        = this.query$.pipe(switchMap((query) => this.countUnits(query)));
  countTaxa$        = this.query$.pipe(switchMap((query) => this.countTaxa(query)));
  filterVisible$    = this.state$.pipe(map((state) => state.filterVisible));
  usersMapSettings$ = this.state$.pipe(map((state) => state.usersMapSettings), distinctUntilChanged());

  vm$: Observable<IObservationViewModel> = hotObjectObserver<IObservationViewModel>({
    lgScreen: this.lgScreen$,
    query: this.query$,
    loadingUnits: this.loading$,
    loadingTaxa: this.loadingTaxa$,
    advanced: this.advanced$,
    activeTab: this.activeTab$,
    showIntro: this.showIntro$,
    countUnit: this.countUnit$,
    countTaxa: this.countTaxa$,
    filterVisible: this.filterVisible$,
    usersMapSettings: this.usersMapSettings$
  });

  private hashCache: {[key: string]: string} = {};

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private footerService: FooterService,
    private warehouseApi: WarehouseApi
  ) {
    this.updateState({..._state, ...this.persistentState});
  }

  activeTab(tab: string) {
    if (_state.activeTab !== tab) {
      this.updateState({..._state, activeTab: tab});
    }
  }

  advanced(advanced: boolean) {
    if (_state.advanced !== advanced) {
      this.updatePersistentState({...this.persistentState, advanced});
    }
  }

  filterVisible(filterVisible: boolean) {
    if (_state.filterVisible !== filterVisible) {
      this.updateState({..._state, filterVisible});
    }
  }

  updateQuery(warehouseQuery: WarehouseQueryInterface) {
    const query = {...warehouseQuery};

    ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken'].forEach(key => {
      if (query[key] === ObservationFacade.PERSON_TOKEN) {
        query[key] = this.userService.getToken();
      }
    });
    const hash = JSON.stringify(warehouseQuery);
    if (this.hashCache['query'] === hash) {
      return;
    }
    this.hashCache['query'] = hash;

    this.updateState({..._state, query, loadingUnits: true, loadingTaxa: true});
  }

  clearQuery() {
    this.updateQuery(emptyQuery);
  }

  toggleIntro() {
    this.updatePersistentState({...this.persistentState, showIntro: !_state.showIntro});
  }

  taxaAutocomplete(token: string, informalTaxonGroupId: string, limit: number): Observable<ITaxonAutocomplete[]> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '' + limit,
      includePayload: true,
      lang: this.translateService.currentLang,
      informalTaxonGroup: informalTaxonGroupId,
      excludeNameTypes: 'MX.hasMisspelledName,MX.hasMisappliedName'
    } as LajiApi.Query.AutocompleteQuery).pipe(
      map<Autocomplete[], ITaxonAutocomplete[]>(data => data.map(item => {
        let groups = '';
        if (item.payload && item.payload.informalTaxonGroups) {
          groups = item.payload.informalTaxonGroups.reduce((prev, curr) => {
            return prev + ' ' + curr.id;
          }, groups);
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
    return this.warehouseApi.warehouseQueryCountGet(query).pipe(
      map(result => result.total || 0),
      catchError(() => of(0)),
      distinctUntilChanged(),
      tap((cnt) => this.updateState({..._state, loadingUnits: false, countUnit: cnt})),
      startWith(_state.countUnit),
      share()
    );
  }

  private countTaxa(query: WarehouseQueryInterface): Observable<number> {
    return this.warehouseApi.warehouseQueryAggregateGet(
      {...query, includeNonValidTaxa: false, taxonRankId: 'MX.species', cache: true},
      ['unit.linkings.taxon.speciesId'],
      [],
      1,
      1
    ).pipe(
      map(result => result.total),
      catchError(() => of(0)),
      distinctUntilChanged(),
      tap((cnt) => this.updateState({..._state, loadingTaxa: false, countTaxa: cnt})),
      startWith(_state.countTaxa),
      share()
    );
  }

  private updateState(state: IObservationState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
