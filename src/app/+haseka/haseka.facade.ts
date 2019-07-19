import { Injectable, OnDestroy } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { hotObjectObserver } from '../shared/observable/hot-object-observer';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../shared/service/browser.service';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { ISettingResultList, UserService } from '../shared/service/user.service';
import { Autocomplete } from '../shared/model/Autocomplete';
import { FooterService } from '../shared/service/footer.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { FormList } from './form-list/haseka-form-list';
import { Form } from '../shared/model/Form';

interface IPersistentState {
  activeYear: string;
  showIntro: boolean;
}

interface IVihkoState extends IPersistentState {
  forms: Form.List[];
}

interface IVihkoViewModel extends IVihkoState {
  lgScreen: boolean;
}

const _persistentState: IPersistentState = {
  activeYear: '',
  showIntro: true
};

let _state: IVihkoState = {
  ..._persistentState,
  forms: []
};

@Injectable()
export class HasekaFacade implements OnDestroy {

  @LocalStorage('vihkoState', _persistentState)
  private persistentState: IPersistentState;

  private store  = new BehaviorSubject<IVihkoState>(_state);
  state$ = this.store.asObservable();

  lgScreen$      = this.browserService.lgScreen$;
  activeYear$    = this.state$.pipe(map((state) => state.activeYear), distinctUntilChanged());
  showIntro$     = this.state$.pipe(map((state) => state.showIntro));
  forms$         = this.state$.pipe(map((state) => state.forms), distinctUntilChanged());

  vm$: Observable<IVihkoViewModel> = hotObjectObserver<IVihkoViewModel>({
    forms: this.forms$,
    lgScreen: this.lgScreen$,
    showIntro: this.showIntro$,
    activeYear: this.activeYear$
  });

  private userSub: Subscription;

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private footerService: FooterService
  ) {
    this.updateState({..._state, ...this.persistentState});
    /*
    this.userSub = this.userService.isLoggedIn$.pipe(
      switchMap((loggedIn) => loggedIn ? this.userService.getUserSetting(UserService.SETTINGS_RESULT_LIST) : of({})),
      tap(settings => this.updateState({..._state, settingsList: settings})),
    ).subscribe();
     */
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  activeYear(year: string) {
    this.updatePersistentState({...this.persistentState, activeYear: year});
  }

  showFooter() {
    this.footerService.footerVisible = true;
  }

  hideFooter() {
    this.footerService.footerVisible = false;
  }

  private updateState(state: IVihkoState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
