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
import { BehaviorSubject, combineLatest, isObservable, Observable, of, ReplaySubject, Subscription, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage, LocalStorageService, SessionStorage } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANG, LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { PlatformService } from '../../root/platform.service';
import { BrowserService } from './browser.service';
import { retryWithBackoff } from '../observable/operators/retry-with-backoff';
import { httpOkError } from '../observable/operators/http-ok-error';
import { PERSON_TOKEN } from './laji-api-worker-common';
import { Profile } from '../model/Profile';
import { Global } from '../../../environments/global';

export interface UserSettingsResultList {
  aggregateBy?: string[];
  selected?: string[];
  pageSize?: number;
}

export interface UserSettings {
  resultList?: UserSettingsResultList;
  taxonomyList?: string[] | { selected: string[] };
  observationMap?: any;
  frontMap?: any;
  formDefault?: any;
  '_global_form_settings_'?: any; // eslint-disable-line @typescript-eslint/naming-convention
  [key: string]: any;
}

interface PersistentState {
  token: string;
}

export interface UserServiceState extends PersistentState {
  user: Person | null;
  settings: UserSettings;
  allUsers: {[id: string]: Person|Observable<Person>};
}

export const createProfile = (profile: Profile | null, user: Person | null): Profile => {
  if (!profile) {
    profile = {};
  }
  if (!user) {
    user = {};
  }
  return {
    ...profile,
    settings: {
      ...(profile.settings || {}),
      defaultMediaMetadata: {
        capturerVerbatim: user?.fullName ?? '',
        intellectualOwner: user?.fullName ?? '',
        intellectualRights: Profile.IntellectualRights.intellectualRightsARR,
        ...(profile.settings?.defaultMediaMetadata || {}),
      }
    }
  };
};

export const getLoginUrl = (next = '', lang = DEFAULT_LANG, base = '') => {
  if (!Global.lajiAuthSupportedLanguages.includes(lang)) {
    lang = DEFAULT_LANG;
  }

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
};

export const isIctAdmin = (person: Person): boolean => person?.role?.includes('MA.admin') ?? false;

const personsCacheKey = (personID: string): string => `users-${ personID || 'global' }-settings`;

const defaultPersistentState: PersistentState = {
  token: ''
};


@Injectable({providedIn: 'root'})
export class UserService {

  // Do not write to this variable in the server!
  @LocalStorage('userState', defaultPersistentState) private localStoragePersistentState: PersistentState | undefined;
  private inMemoryPersistentState: PersistentState | undefined;

  @SessionStorage() private returnUrl: string | undefined;
  @SessionStorage('retry', 0) private retry: number | undefined;

  private subLogout: Subscription | undefined;
  private init = false;

  private store = new BehaviorSubject<UserServiceState>({
    ...defaultPersistentState,
    token: '',
    user: null,
    settings: {},
    allUsers: {}
  });
  private state$ = this.store.asObservable();
  private currentRouteData = new ReplaySubject<any>(1);
  private currentRouteData$ = this.currentRouteData.asObservable();

  isLoggedIn$ = this.state$.pipe(map((state) => !!state.token), distinctUntilChanged());
  settings$   = this.state$.pipe(map((state) => state.settings), distinctUntilChanged());
  user$       = this.state$.pipe(map((state) => state.user), distinctUntilChanged());

  constructor(
    private personApi: PersonApi,
    private router: Router,
    private location: Location,
    private logger: Logger,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private platformService: PlatformService,
    private browserService: BrowserService,
    private storage: LocalStorageService
  ) {
    if (!this.platformService.isBrowser) {
      //this.doServiceSideLoginState();
      // TODO: initialize server side state
    }
    /*
     * All of this is probably unnecessary:
     * login should only occur through check-login.guard
     * so that's what should trigger change in isLoggedIn
     *
    this.router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd && event.snapshot.children.length === 0)
    ).subscribe((event: ActivationEnd) => this.currentRouteData.next(event.snapshot.data));

    this.isLoggedIn$.pipe(
      switchMap(() => this.currentRouteData$),
      take(1),
      switchMap(() => this.browserService.visibility$),
      filter(visible => visible),
      switchMap(() => this._checkLogin())
    ).subscribe();
    */
  }

  /*
   * Unnecessary, no longer used in check-login.guard
   *
  checkLogin(): Observable<boolean> {
    return this._checkLogin();
  }
  */

  /**
   * checks if token is valid and logs in the user
   * returns true upon succesful login, false otherwise
   */
  login(userToken?: string): Observable<boolean> {
    const token = userToken ?? this.persistentState.token;
    if (!token) {
      return of(false);
    }
    if (this.store.value.token === token || !this.platformService.isBrowser) {
      return of(true);
    }
    return this.personApi.personFindByToken(token).pipe(
      tap(person => {
        // if person is valid, we have succesfully logged in
        this.persistentState = { ...this.persistentState, token};
        this.store.next({
          ...this.store.value, ...this.persistentState, user: person,
          settings: this.storage.retrieve(personsCacheKey(person.id))
        });
        console.log(person);
      }),
      map(_ => true),
      httpOkError(404, false),
      retryWithBackoff(300),
      catchError(_ => of(false))
    );
  }

  logout(cb?: () => void): void {
    this.persistentState = { ...this.persistentState, token: '' };
    this.store.next({
      ...this.store.value, ...this.persistentState, user: {}, settings: {}
    });
    cb?.();

    /*
    if (this.subLogout) {
      return;
    }
    if (this.state.token) {
      this.subLogout = this.personApi.removePersonToken(this.state.token).pipe(
        httpOkError([404, 400], false),
        retryWithBackoff(300),
        catchError((err) => {
          this.logger.warn('Failed to logout', err);
          return of(false);
        })
      ).subscribe(() => {
        this.subLogout = undefined;
        this.doLogoutState();
        cb?.();
      });
    } else {
      this.doLogoutState();
      cb?.();
    }
    */
  }

  getToken(): string {
    return this.store.value.token;
    // return this.state.token;
  }

  getPersonInfo(id: string, info?: 'fullName' | 'fullNameWithGroup'): Observable<string>;
  getPersonInfo(id: string, info?: keyof Person | 'fullNameWithGroup'): Observable<string | string[]>;
  getPersonInfo(id: string, info: keyof Person | 'fullNameWithGroup' = 'fullName'): Observable<string | string[]> {
    if (!id || !id.startsWith('MA.')) {
      return of(id);
    }

    const pickValue = (obs: Observable<Person>): Observable<string|string[]> => obs.pipe(
      map(person => info === 'fullNameWithGroup' ?
        (person.fullName || '') + (person.group ? ' (' + person.group + ')' : '') :
        person[info] ?? ''
      )
    );

    if (this.store.value.allUsers[id]) {
      return pickValue(isObservable(this.store.value.allUsers[id]) ? this.store.value.allUsers[id] as Observable<Person> : of(this.store.value.allUsers[id] as Person));
    }
    if (this.store.value.user && id === this.store.value.user.id) {
      return pickValue(of(this.store.value.user));
    }

    this.store.value.allUsers[id] = this.personApi.personFindByUserId(id).pipe(
      catchError(() => of({
        id,
        fullName: id
      })),
      tap(person => this.store.value.allUsers[id] = person as Person),
      share()
    );
    return pickValue(this.store.value.allUsers[id] as Observable<Person>);
  }

  redirectToLogin(returnUrl?: string, routeData?: any): void {
    if (this.platformService.isBrowser) {
      this.currentRouteData$.pipe(
        startWith(of(routeData)),
        filter(data => !!data),
        take(1),
      ).subscribe(data => {
        this.returnUrl = data.loginLanding || returnUrl || this.location.path(true);
        window.location.href = getLoginUrl(this.returnUrl, this.translate.currentLang);
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

  getUserSetting<T>(key: keyof UserSettings): Observable<T> {
    return this.settings$.pipe(map(settings => settings[key]));
  }

  setUserSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    const personID = this.store.value.user?.id ?? '';
    const settings = {...this.store.value.settings, [key]: value};
    this.store.next({ ...this.store.value, settings });
    this.storage.store(personsCacheKey(personID), settings);
  }

  getProfile(): Observable<Profile> {
    return combineLatest([
      this.personApi.personFindProfileByToken(this.getToken()),
      this.user$
    ]).pipe(
      map(([profile, user]) => createProfile(profile, user)),
      take(1)
    );
  }

  /**
   * Checks that user status is correct and return true when status check is done
   * It's considered to be done when no other actions are needed
   */
  /*
  private _checkLogin(rawToken?: string): Observable<boolean> {
    if (!this.platformService.isBrowser) {
      this.doServiceSideLoginState();
      return of(true);
    }
    const token = rawToken || this.state.token;
    if (this.state.token && (!this.persistent || this.persistent.isLoggedIn === false)) {
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
    } else if (this.persistent?.isLoggedIn) {
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
    if (!this.platformService.canUseWebWorkerLogin || (this.retry && this.retry > 0)) {
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

  private doLoginState(user: Person, token: string) {
    if (user && user.id && this.state.user && this.state.user.id === user.id) {
      return;
    }
    this.init = true;
    this.persistent = {...this.persistent, isLoggedIn: !!user};
    this.updateState({...this.state, ...this.persistent, token: user ? token : '', user: user || {}, settings: {}});
    if (user.id) {
      this.doUserSettingsState(user.id);
    }
  }

  private doLogoutState() {
    if (!this.state.isLoggedIn && this.init) {
      return;
    }
    this.init = true;

    this.persistent = {...this.persistent, isLoggedIn: false};
    this.updateState({...this.state, ...this.persistent, token: '', user: {}, settings: {}});
    this.retry = 0;
  }

  private doUserSettingsState(id: string) {
    this.updateState({...this.state, settings: this.storage.retrieve(personsCacheKey(id)) || {}});
  }

  private updateState(state: UserServiceState) {
    this.store.next(this.state = state);
  }
  */

  private set persistentState(state: PersistentState | undefined) {
    if (this.platformService.isBrowser) {
      this.localStoragePersistentState = state;
    } else {
      this.inMemoryPersistentState = state;
    }
  }

  private get persistentState() {
    if (this.platformService.isBrowser) {
      return this.localStoragePersistentState;
    } else {
      return this.inMemoryPersistentState;
    }
  }
}

