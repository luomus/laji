import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { hotObjectObserver } from '../shared/observable/hot-object-observer';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../shared/service/browser.service';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../shared/service/user.service';
import { Autocomplete } from '../shared/model/Autocomplete';

interface IPersistentState {
  showIntro: boolean;
  advanced: boolean;
}

interface IObservationState extends IPersistentState {
  query: WarehouseQueryInterface;
  filterVisible: boolean;
  usersMapSettings: any;
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
  usersMapSettings: {}
};

const _persistentState: IPersistentState = {
  showIntro: true,
  advanced: false
};

@Injectable({providedIn: 'root'})
export class ObservationFacade {

  static PERSON_TOKEN = '%personToken%';

  @LocalStorage('observationState', _persistentState)
  private persistentState: IPersistentState;

  private store  = new BehaviorSubject<IObservationState>(_state);
  state$ = this.store.asObservable();

  lgScreen$         = this.browserService.lgScreen$;
  query$            = this.state$.pipe(map((state) => state.query), distinctUntilChanged());
  advanced$         = this.state$.pipe(map((state) => state.advanced));
  showIntro$        = this.state$.pipe(map((state) => state.showIntro));
  filterVisible$    = this.state$.pipe(map((state) => state.filterVisible));
  usersMapSettings$ = this.state$.pipe(map((state) => state.usersMapSettings), distinctUntilChanged());

  vm$: Observable<IObservationViewModel> = hotObjectObserver<IObservationViewModel>({
    lgScreen: this.lgScreen$,
    query: this.query$,
    advanced: this.advanced$,
    showIntro: this.showIntro$,
    filterVisible: this.filterVisible$,
    usersMapSettings: this.usersMapSettings$
  });

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService
  ) {
    this.updateState({..._state, ...this.persistentState});
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

    ['editorPersonToken', 'observerPersonToken'].forEach(key => {
      if (query[key] === ObservationFacade.PERSON_TOKEN) {
        query[key] = this.userService.getToken();
      }
    });

    this.updateState({..._state, query});
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

  private updateState(state: IObservationState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
