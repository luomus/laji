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
import { isObservable, Observable, of, ReplaySubject, Subscription } from 'rxjs';
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

const logoutMsg = '__logout__'; // also in src/user/check/index.html
const fallbackMsg = '__fallback__'; // also in src/user/check/index.html

@Injectable({providedIn: 'root'})
export class UserService {

  private subLogout: Subscription;
  private init = false;

  // Do not write to this variable in the server!
  @LocalStorage('userState', _persistentState) private persistentState: IPersistentState;
  @SessionStorage() private returnUrl: string;
  private tabId: string;
  private mRandom: string;
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
    ).subscribe(() => {
      this._checkLogin();
    });
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
    if (_state.token && this.persistentState.isLoggedIn === false) {
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
    } else if (this.persistentState.isLoggedIn) {
      return this.doBackgroundLogin().pipe(
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

  private doBackgroundLogin(): Observable<string> {
    if (!('BroadcastChannel' in window)) {
      this.redirectToLogin();
      return of('');
    }
    this.tabId = Math.random().toString(36).substr(2);
    this.mRandom = Math.random().toString(36).substr(2);
    (window as any).tabId = this.tabId;

    const loginUrl = encodeURIComponent(UserService.getLoginUrl('/user/check', this.translate.currentLang));
    const channel1 = new BroadcastChannel('user-check');

    const iframe = document.createElement('iframe');
    iframe.src = `/user/check?loginUrl=${loginUrl}#${this.tabId}:${this.mRandom}`;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    return new Observable((subscriber) => {
      channel1.onmessage = (e) => {
        const parts = e.data.split(':');

        if (this.tabId !== (window as any).tabId) {
          channel1.postMessage(logoutMsg);
          e = {data: logoutMsg} as MessageEvent;
        }
        if (e.data === logoutMsg) {
          iframe.remove();
          this.logout();
          return this.doLogoutState();
        } else if (e.data.endsWith(fallbackMsg) && parts[0] === this.tabId) {
          iframe.remove();
          this.redirectToLogin();
          return of('');
        }

        if (parts[0] !== this.tabId) {
          return;
        }

        const mRandom2 = Math.random().toString(36).substr(2);
        const channel2 = new BroadcastChannel(`${this.mRandom}${parts[1]}`);
        const channel3 = new BroadcastChannel(`${this.mRandom}${parts[1]}:${mRandom2}`);

        channel3.onmessage = (e3) => {
          iframe.remove();
          subscriber.next(e3.data);
          subscriber.complete();
          channel1.close();
          channel3.close();
        };

        channel2.postMessage(mRandom2);
        channel2.close();
      };
    });
  }

  private doServiceSideLoginState() {
    this.doLoginState({}, '');
  }

  private doLoginState(user: Person, token) {
    if (user && user.id && _state.user && _state.user.id === user.id) {
      return;
    }
    this.init = true;
    this.updatePersistentState({...this.persistentState, isLoggedIn: !!user} as any);
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
