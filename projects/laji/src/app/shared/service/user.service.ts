import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  take,
  tap,
  timeout
} from 'rxjs/operators';
import { isObservable, Observable, of, ReplaySubject, Subscription, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage, LocalStorageService, SessionStorage } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { PlatformService } from './platform.service';
import { BrowserService } from './browser.service';
import { retryWithBackoff } from '../observable/operators/retry-with-backoff';
import { httpOkError } from '../observable/operators/http-ok-error';
import { PERSON_TOKEN } from './laji-api-worker-common';

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
}

export interface IUserServiceState extends IPersistentState {
  token: string;
  user: Person;
  settings: IUserSettings;
  allUsers: {[id: string]: Person|Observable<Person>};
}

const _persistentState: IPersistentState = {
  isLoggedIn: false
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
  @SessionStorage() private returnUrl: string;
  @SessionStorage('retry', 0) private retry: number;

  private _persistent: IPersistentState;
  // This needs to be replaySubject because login needs to be reflecting accurate situation all the time!
  private store = new ReplaySubject<IUserServiceState>(1);
  private state$ = this.store.asObservable();
  private currentRouteData = new ReplaySubject<any>(1);
  private currentRouteData$ = this.currentRouteData.asObservable();

  isLoggedIn$ = this.state$.pipe(map((state) => state.isLoggedIn), distinctUntilChanged());
  settings$   = this.state$.pipe(map((state) => state.settings), distinctUntilChanged());
  user$       = this.state$.pipe(map((state) => state.user), distinctUntilChanged());

  static getLoginUrl(next = '', lang = 'fi', base = '') {
    let url = (base || environment.loginUrl);
    url += url.includes('?') ? '&' : '?';

    const params: string[] = [
      `target=${environment.systemID}`,
      'redirectMethod=GET',
      'locale=%lang%'
    ];

    if (!url.includes('next=')) {
      params.push(`next=${next}`);
    }

    return (url + params.join('&')).replace('%lang%', lang);
  }

  static isIctAdmin(person: Person): boolean {
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
    private storage: LocalStorageService
  ) {
    if (!this.platformService.isBrowser) {
      this.doServiceSideLoginState();
    }
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd && event.snapshot.children.length === 0)
    ).subscribe((event: ActivationEnd) => this.currentRouteData.next(event.snapshot.data));

    this.isLoggedIn$.pipe(
      switchMap(() => this.currentRouteData$),
      take(1),
      switchMap(() => this.browserService.visibility$),
      filter(visible => visible),
      switchMap(() => this._checkLogin())
    ).subscribe();
  }

  checkLogin(): Observable<boolean> {
    return this._checkLogin();
  }

  login(userToken: string): Observable<boolean> {
    if (_state.token === userToken || !this.platformService.isBrowser) {
      return of(true);
    }
    return this._checkLogin(userToken);
  }

  logout(cb?: () => void): void {
    if (this.subLogout) {
      return;
    }
    if (!cb) {
      cb = () => {};
    }
    if (_state.token) {
      this.subLogout = this.personApi.removePersonToken(_state.token).pipe(
        httpOkError([404, 400], false),
        retryWithBackoff(300),
        catchError((err) => {
          this.logger.warn('Failed to logout', err);
          return of(false);
        })
      ).subscribe(() => {
        this.subLogout = undefined;
        this.doLogoutState();
        cb();
      });
    } else {
      this.doLogoutState();
      cb();
    }
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
      })),
      tap(person => _state.allUsers[id] = person as Person),
      share()
    );
    return pickValue(_state.allUsers[id] as Observable<Person>);
  }

  redirectToLogin(returnUrl?: string, routeData?: any): void {
    if (this.platformService.isBrowser) {
      this.currentRouteData$.pipe(
        startWith(of(routeData)),
        filter(data => !!data),
        take(1),
      ).subscribe(data => {
        this.returnUrl = data.loginLanding || returnUrl || this.location.path(true);
        window.location.href = UserService.getLoginUrl(this.returnUrl, this.translate.currentLang);
      });
    }
  }

  getReturnUrl(): string {
    const returnTo = this.returnUrl || '/';
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
    const settings = {..._state.settings, [key]: value};
    this.updateState({..._state, settings});
    this.storage.store(this.personsCacheKey(personID), settings);
  }

  private personsCacheKey(personID): string {
    return `users-${ personID || 'global' }-settings`;
  }

  /**
   * Checks that user status is correct and return true when status check is done
   * It's considered to be done when no other actions are needed
   */
  private _checkLogin(rawToken?: string): Observable<boolean> {
    if (!this.platformService.isBrowser) {
      this.doServiceSideLoginState();
      return of(true);
    }
    const token = rawToken || _state.token;
    if (_state.token && this.persistent.isLoggedIn === false) {
      this.doLogoutState();
    } else if (token) {
      return this.personApi.personFindByToken(token).pipe(
        tap(user => this.doLoginState(user, token)),
        map(user => !!user),
        httpOkError(404, false),
        retryWithBackoff(300),
        catchError(() => of(false)),
        tap(loggedIn => { if (!loggedIn) { this.doLogoutState(); } }),
        map(() => true),
        share()
      );
    } else if (this.persistent.isLoggedIn) {
      return this.doBackgroundCheck().pipe(
        switchMap(t => t ? this._checkLogin(t) : of(false)),
        timeout(10000),
        catchError(() => {
          this.doLogoutState();
          return of(true);
        })
      );
    } else {
      this.doLogoutState();
    }
    return of(true);
  }

  private doBackgroundCheck(): Observable<string> {
    if (!this.platformService.canUseWebWorkerLogin || this.retry > 0) {
      this.redirectToLogin();
      return of('');
    }
    return this.personApi.personFindByToken(PERSON_TOKEN).pipe(
      tap(() => this.retry = 0),
      map(() => PERSON_TOKEN),
      catchError((e) => {
        if (e && e.status === 0) {
          this.retry = 1;
          this.redirectToLogin();
          this.platformService.canUseWebWorkerLogin = false;
          return of('');
        }
        return throwError('Logout');
      })
    );
  }

  private doServiceSideLoginState() {
    this.doLoginState({}, '');
  }

  private doLoginState(user: Person, token) {
    if (user && user.id && _state.user && _state.user.id === user.id) {
      return;
    }
    this.init = true;
    this.persistent = {...this.persistent, isLoggedIn: !!user};
    this.updateState({..._state, ...this.persistent, token: user ? token : '', user: user || {}, settings: {}});
    this.doUserSettingsState(user.id);
  }

  private doLogoutState() {
    if (!_state.isLoggedIn && this.init) {
      return;
    }
    this.init = true;

    this.persistent = {...this.persistent, isLoggedIn: false};
    this.updateState({..._state, ...this.persistent, token: '', user: {}, settings: {}});
    this.retry = 0;
  }

  private doUserSettingsState(id: string) {
    this.updateState({..._state, settings: this.storage.retrieve(this.personsCacheKey(id)) || {}});
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
  }

  set persistent(state: IPersistentState) {
    if (this.platformService.isBrowser) {
      this.persistentState = state;
    } else {
      this._persistent = state;
    }
  }

  get persistent() {
    if (this.platformService.isBrowser) {
      return this.persistentState;
    } else {
      return this._persistent;
    }
  }
}
