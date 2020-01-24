import { catchError, distinctUntilChanged, filter, map, share, switchMap, take, tap } from 'rxjs/operators';
import { isObservable, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
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
import { HistoryService } from './history.service';

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
  isLoggedIn: boolean;
  returnUrl: string;
}

export interface IUserServiceState extends IPersistentState {
  token: string;
  user: Person;
  settings: IUserSettings;
  allUsers: {[id: string]: Person|Observable<Person>};
}

const _persistentState: IPersistentState = {
  isLoggedIn: false,
  returnUrl: ''
};

let _state: IUserServiceState = {
  ..._persistentState,
  token: '',
  user: null,
  settings: {},
  allUsers: {}
};

@Injectable({providedIn: 'root'})
export class UserService {

  private subLogout: Subscription;
  private init = false;

  // Do not write to this variable in the server!
  @LocalStorage('userState', _persistentState) private persistentState: IPersistentState;
  // This needs to be replaySubject because login needs to be reflecting accurate situation all the time!
  private store = new ReplaySubject<IUserServiceState>(1);
  private state$ = this.store.asObservable();
  private currentRouteData = new ReplaySubject<any>(1);
  private currentRouteData$ = this.currentRouteData.asObservable();

  isLoggedIn$ = this.state$.pipe(map((state) => state.isLoggedIn), distinctUntilChanged());
  settings$   = this.state$.pipe(map((state) => state.settings), distinctUntilChanged());
  user$       = this.state$.pipe(map((state) => state.user), distinctUntilChanged());

  static getLoginUrl(next = '', lang = 'fi') {
    return (environment.loginUrl
    + '?target=' + environment.systemID
    + '&redirectMethod=GET&locale=%lang%'
    + '&next=' + next).replace('%lang%', lang);
  }

  static isAdmin(person: Person): boolean {
    return person && person.role && person.role.includes('MA.admin');
  }

  constructor(
    private personApi: PersonApi,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private logger: Logger,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private platformService: PlatformService,
    private browserService: BrowserService,
    private storage: LocalStorageService,
    private historyService: HistoryService,
    @Inject(WINDOW) private window: any
  ) {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd && event.snapshot.children.length === 0)
    ).subscribe((event: ActivationEnd) => this.currentRouteData.next(event.snapshot.data));

    this.currentRouteData$.pipe(
      take(1),
      switchMap(() => this.browserService.visibility$),
      filter(visible => visible),
    ).subscribe(() => {
      this.checkLogin();
    });
  }

  login(userToken: string): Observable<boolean> {
    if (_state.token === userToken || !this.platformService.isBrowser) {
      return of(true);
    }
    return this.checkLogin(userToken);
  }

  logout(): void {
    if (!_state.token || this.subLogout) {
      return;
    }
    this.subLogout = this.personApi.removePersonToken(_state.token).pipe(
      httpOkError(404, false),
      retryWithBackoff(300),
      catchError((err) => {
        this.logger.warn('Failed to logout', err);
        return of(false);
      })
    ).subscribe(() => this.doLogoutState());
  }

  getToken(): string {
    return _state.token;
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
    if (_state.user && id === _state.user.id) {
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
      this.currentRouteData$.pipe(
        take(1)
      ).subscribe(data => {
        returnUrl = data.loginLanding || returnUrl || this.location.path(true);
        this.updatePersistentState({...this.persistentState, returnUrl});
        this.window.location.href = UserService.getLoginUrl(returnUrl, this.translate.currentLang);
      });
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

  getUserSetting<T>(key: keyof IUserSettings): Observable<T> {
    return this.settings$.pipe(map(settings => settings[key]));
  }

  setUserSetting(key: keyof IUserSettings, value: any): void {
    const personID = _state.user && _state.user.id || '';
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
    const token = rawToken || _state.token;
    if (_state.token && this.persistentState.isLoggedIn === false) {
      this.doLogoutState();
    } else if (token) {
      return this.personApi.personFindByToken(token).pipe(
        httpOkError(404, false),
        retryWithBackoff(300),
        catchError(() => of(false)),
        tap(user => this.doLoginState(user, token)),
        map(user => !!user),
        tap(loggedIn => {if (!loggedIn) { this.doLogoutState(); }}),
        share()
      );
    } else if (this.persistentState.isLoggedIn) {
      this.redirectToLogin();
    } else {
      this.doLogoutState();
    }
    return of(false);
  }

  private doLoginState(user: Person, token) {
    if (user && user.id && _state.user && _state.user.id === user.id) {
      return;
    }
    this.init = true;
    // Token can be removed from there afters a while
    this.updatePersistentState({...this.persistentState, isLoggedIn: !!user, token: ''} as any);
    this.updateState({..._state, ...this.persistentState, token: user ? token : '', user: user || {}, settings: {}});
    this.doUserSettingsState(user.id);
  }

  private doLogoutState() {
    if (!_state.isLoggedIn && this.init) {
      return;
    }
    this.init = true;
    // Token can be removed from there afters a while
    this.updatePersistentState({...this.persistentState, isLoggedIn: false, token: ''} as any);
    this.updateState({..._state, ...this.persistentState, token: '', user: {}, settings: {}});
  }

  private doUserSettingsState(id: string) {
    this.updateState({..._state, settings: this.storage.retrieve(this.personsCacheKey(id)) || {}});
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
}
