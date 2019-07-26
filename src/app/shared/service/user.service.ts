import { map, catchError, tap, share, filter, distinctUntilChanged, mergeMap, take } from 'rxjs/operators';
import { isObservable, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { WINDOW } from '@ng-toolkit/universal';
import { PlatformService } from './platform.service';
import { BrowserService } from './browser.service';
import { retryWithBackoff } from '../observable/operators/retry-with-backoff';
import { httpOkError } from '../observable/operators/http-ok-error';

export interface ISettingResultList {
  aggregateBy?: string[];
  selected?: string[];
  pageSize?: number;
}

export interface IUserSettings {
  resultList?: string[];
  taxonomyList?: string[];
  observationMap?: any;
  frontMap?: any;
  formDefault?: any;
  '_global_form_settings_'?: any;
  [key: string]: any;
}

interface IPersistentState {
  token: string;
  returnUrl: string;
}

export interface IUserServiceState extends IPersistentState {
  user: Person;
  isLoggedIn: boolean;
  settings: IUserSettings;
  allUsers: {[id: string]: Person|Observable<Person>};
}

const _persistentState: IPersistentState = {
  token: '',
  returnUrl: ''
};

let _state: IUserServiceState = {
  ..._persistentState,
  user: null,
  isLoggedIn: false,
  settings: {},
  allUsers: {}
};

@Injectable({providedIn: 'root'})
export class UserService {

  private subLogout: Subscription;

  // Do not write to this variable in the server!
  @LocalStorage('userState', _persistentState) private persistentState: IPersistentState;
  // This needs to be replaySubject because login needs to be reflecting accurate situation all the time!
  private store = new ReplaySubject<IUserServiceState>(1);
  state$ = this.store.asObservable();

  isLoggedIn$ = this.state$.pipe(map((state) => state.isLoggedIn), distinctUntilChanged());
  settings$   = this.state$.pipe(map((state) => state.settings), distinctUntilChanged());
  user$       = this.state$.pipe(map((state) => state.user), distinctUntilChanged());

  public static getLoginUrl(next = '', lang = 'fi') {
    return (environment.loginUrl
    + '?target=' + environment.systemID
    + '&redirectMethod=GET&locale=%lang%'
    + '&next=' + next).replace('%lang%', lang);
  }

  constructor(
    private personApi: PersonApi,
    private router: Router,
    private location: Location,
    private logger: Logger,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private platformService: PlatformService,
    private browserService: BrowserService,
    private storage: LocalStorageService,
    @Inject(WINDOW) private window: any
  ) {
    this.browserService.visibility$.pipe(
      filter(visible => visible),
      mergeMap(() => this.checkLogin())
    ).subscribe();
  }

  login(userToken: string) {
    if (this.persistentState.token === userToken || !this.platformService.isBrowser) {
      return of(true);
    }
    return this.checkLogin(userToken);
  }

  logout() {
    if (!this.persistentState.token || this.subLogout) {
      return;
    }
    this.subLogout = this.personApi.removePersonToken(this.persistentState.token).pipe(
      httpOkError(404, false),
      retryWithBackoff(300),
      catchError((err) => {
        this.logger.warn('Failed to logout', err);
        return of(false);
      })
    ).subscribe(() => this.doLogoutState());
  }

  getToken(): string {
    return this.persistentState.token;
  }

  getPersonInfo(id: string, info?: 'fullName' | 'fullNameWithGroup'): Observable<string>;
  getPersonInfo(id: string, info: keyof Person | 'fullNameWithGroup'): Observable<string|string[]>;
  getPersonInfo(id: string, info: keyof Person | 'fullNameWithGroup' = 'fullName'): Observable<string|string[]> {
    if (!id || !id.startsWith('MA.')) {
      return of(id);
    }

    const pickValue = (obs: Observable<Person>): Observable<string|string[]> => obs.pipe(
      map(person => info === 'fullNameWithGroup' ?
        (person.fullName || '') + (person.group ? ' (' + person.group + ')' : '') :
        person[info]
      )
    );

    if (_state.allUsers[id]) {
      return pickValue(isObservable(_state.allUsers[id]) ? _state.allUsers[id] as Observable<Person> : of(_state.allUsers[id] as Person));
    }
    if (id === _state.user.id) {
      return pickValue(of(_state.user));
    }

    _state.allUsers[id] = this.personApi.personFindByUserId(id).pipe(
      catchError(() => of({
        id,
        fullName: id
      } as Person)),
      tap(person => _state.allUsers[id] = person),
      share()
    );
    return pickValue(_state.allUsers[id] as Observable<Person>);
  }

  redirectToLogin(returnUrl?: string): void {
    if (this.platformService.isBrowser) {
      returnUrl = returnUrl || this.location.path(true);
      this.updatePersistentState({...this.persistentState, returnUrl});
      this.window.location.href = UserService.getLoginUrl(returnUrl, this.translate.currentLang);
    }
  }

  getReturnUrl(): string {
    const returnTo = this.persistentState.returnUrl || '/';
    const lang = this.localizeRouterService.getLocationLang(returnTo);
    this.translate.use(lang);
    return this.localizeRouterService.translateRoute(
      this.localizeRouterService.getPathWithoutLocale(returnTo)
    );
  }

  /**
   * @deprecated this will be refactored into haseka facade
   */
  getDefaultFormData(): Observable<any> {
    return this.user$.pipe(
      take(1),
      map(person => ({
        'creator': person.id,
        'gatheringEvent': {
          'leg': [person.id]
        }
      }))
    );
  }

  getUserSetting(key: keyof IUserSettings): Observable<any> {
    return this.settings$.pipe(map(settings => settings[key]));
  }

  setUserSetting(key: keyof IUserSettings, value: any): void {
    const personID = _state.user.id || '';
    if (!personID) {
      return;
    }
    const settings = {..._state.settings, [key]: value};
    this.updateState({..._state, settings});
    this.storage.store(this.personsCacheKey(personID), settings);
  }

  private personsCacheKey(personID): string {
    return `users-${personID }-settings`;
  }

  private checkLogin(rawToken?: string): Observable<boolean> {
    if (!this.platformService.isBrowser) {
      this.doLoginState({}, '');
      return of(true);
    }
    const token = rawToken || this.persistentState.token;
    if (token) {
      return this.personApi.personFindByToken(token).pipe(
        httpOkError(404, false),
        retryWithBackoff(300),
        catchError(() => of(false)),
        tap(user => this.doLoginState(user, token)),
        tap(user => this.doUserSettingsState(user.id)),
        map(user => !!user),
        share()
      );
    } else {
      this.doLogoutState();
    }
    this.storage.clear('token'); // this is only used for the transition phase and can be removed after one release
    this.storage.clear('returnUrl'); // this is only used for the transition phase and can be removed after one release
    return of(false);
  }

  private doLoginState(user: Person, token) {
    this.updatePersistentState({...this.persistentState, token: user ? token : ''});
    this.updateState({..._state, ...this.persistentState, isLoggedIn: !!user, user: user || {}, settings: {}});
  }

  private doLogoutState() {
    this.updatePersistentState({...this.persistentState, token: ''});
    this.updateState({..._state, ...this.persistentState, isLoggedIn: false, user: {}, settings: {}});
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.persistentState = state;
  }

  private doUserSettingsState(id: string) {
    this.updateState({..._state, settings: this.storage.retrieve(this.personsCacheKey(id)) || {}});
  }
}
