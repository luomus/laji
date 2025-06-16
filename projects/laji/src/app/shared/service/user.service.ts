import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  take,
  tap
} from 'rxjs/operators';
import { BehaviorSubject, combineLatest, isObservable, Observable, of, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage, LocalStorageService, SessionStorage } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANG, LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { PlatformService } from '../../root/platform.service';
import { retryWithBackoff } from '../observable/operators/retry-with-backoff';
import { httpOkError } from '../observable/operators/http-ok-error';
import { Profile } from '../model/Profile';
import { Global } from '../../../environments/global';
import { RegistrationContact } from './project-form.service';

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

namespace LoginState {
  export interface Loading {
    _tag: 'loading';
  }

  export interface LoggedIn {
    _tag: 'logged_in';
    token: string;
  }

  export interface NotLoggedIn {
    _tag: 'not_logged_in';
  }
}

type LoginState = LoginState.Loading | LoginState.LoggedIn | LoginState.NotLoggedIn;

// Update the version if PersistentState changes, such that the old version is thrown away from local storage
const persistentStateVersion = 1;

interface PersistentState {
  loginState: LoginState;
  version: typeof persistentStateVersion;
}

namespace UserState {
  export interface Loading {
    _tag: 'loading';
  }

  export interface Ready {
    _tag: 'ready';
    person: Person;
    settings: UserSettings;
  }

  export interface NotLoggedIn {
    _tag: 'not_logged_in';
  }
}

type UserState = UserState.Loading | UserState.Ready | UserState.NotLoggedIn;

interface UserServiceState extends PersistentState {
  user: UserState;
  allUsers: { [id: string]: Person | Observable<Person> };
}

export const prepareProfile = (profile: Profile | null, user: Person | null | undefined): Profile => {
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

export const isIctAdmin = (person?: Person): boolean => person?.role?.includes('MA.admin') ?? false;

const personsCacheKey = (personID?: string): string => `users-${ personID || 'global' }-settings`;

const defaultPersistentState: PersistentState = {
  loginState: { _tag: 'loading' },
  version: persistentStateVersion,
};

const isPersistentState = (state: unknown): state is PersistentState =>
  typeof state === 'object' && 'version' in (state as any) && (state as any)['version'] === persistentStateVersion;

@Injectable({providedIn: 'root'})
export class UserService implements OnDestroy {
  @LocalStorage('userState', defaultPersistentState) private localStoragePersistentState: unknown;
  private inMemoryPersistentState: PersistentState = { ...defaultPersistentState };

  @SessionStorage() private returnUrl: string | undefined;

  private subLogout: Subscription | undefined;

  private store = new BehaviorSubject<UserServiceState>({
    ...defaultPersistentState,
    user: { _tag: 'loading' },
    allUsers: {}
  });
  private state$ = this.store.asObservable();
  private currentRouteData = new ReplaySubject<any>(1);
  private currentRouteData$ = this.currentRouteData.asObservable();

  isLoggedIn$: Observable<boolean> = this.state$.pipe(
    filter(state => state.loginState._tag !== 'loading'),
    map(state => state.loginState._tag === 'logged_in'),
    distinctUntilChanged()
  );
  settings$: Observable<UserSettings | undefined> = this.state$.pipe(
    filter(state => state.user._tag !== 'loading'),
    map(state => state.user._tag === 'ready' ? (<UserState.Ready>state.user).settings : undefined),
    distinctUntilChanged()
  );
  // TODO: this should probably be refactored to `person$`
  user$: Observable<Person | undefined> = this.state$.pipe(
    filter(state => state.user._tag !== 'loading'),
    map(state => state.user._tag === 'ready' ? (<UserState.Ready>state.user).person : undefined),
    distinctUntilChanged()
  );

  constructor(
    private personApi: PersonApi,
    private location: Location,
    private logger: Logger,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private platformService: PlatformService,
    private storage: LocalStorageService
  ) {}

  /**
   * checks if token is valid and logs in the user
   * returns true upon succesful login, false otherwise
   */
  login(userToken?: string): Observable<boolean> {
    if (
      ( this.persistentState.loginState._tag === 'logged_in'
        && this.store.value.user._tag === 'ready'
        && this.persistentState.loginState.token === userToken
      ) || !this.platformService.isBrowser) {
      return of(true);
    }
    const token = userToken ?? (this.persistentState.loginState._tag === 'logged_in' ? this.persistentState.loginState.token : '') ?? '';
    if (!token) {
      this.setNotLoggedIn();
      return of(false);
    }
    this.store.next({ ...this.store.value, loginState: { _tag: 'loading' }, user: { _tag: 'loading' } });
    return this.personApi.personFindByToken(token).pipe(
      tap(person => {
        // if person is valid, we have succesfully logged in
        this.persistentState = { ...this.persistentState, loginState: { _tag: 'logged_in', token }};
        this.store.next({
          ...this.store.value,
          ...this.persistentState,
          user: {
            _tag: 'ready',
            person,
            settings: this.storage.retrieve(personsCacheKey(person.id))
          }
        });
      }),
      map(_ => true),
      httpOkError([404, 400], false),
      retryWithBackoff(300),
      catchError(_ => {
        this.setNotLoggedIn();
        return of(false);
      })
    );
  }

  logout(cb?: () => void): void {
    if (this.persistentState.loginState._tag !== 'logged_in') {
      console.warn('Attempted logout while not being logged in.');
      return;
    }
    this.subLogout = this.personApi.removePersonToken(this.persistentState.loginState.token).pipe(
      httpOkError([404, 400], false),
      retryWithBackoff(300),
      catchError((err) => {
        this.logger.warn('Failed to logout', err);
        return of(false);
      })
    ).subscribe(b => {
      if (b === false) {
        return;
      }
      this.setNotLoggedIn();
      cb?.();
    });
  }

  register(registrationContacts: RegistrationContact[] | undefined): void {
    const params: string[] = [
      `next=${this.location.path(true)}`,
      'redirectMethod=POST',
      `locale=${this.translate.currentLang}`,
      'permanent=false'
    ];

    if (registrationContacts?.[0]?.preferredName) { params.push(`preferredName=${registrationContacts?.[0]?.preferredName}`); }
    if (registrationContacts?.[0]?.inheritedName) { params.push(`inheritedName=${registrationContacts?.[0]?.inheritedName}`); }
    if (registrationContacts?.[0]?.emailAddress) { params.push(`email=${registrationContacts?.[0]?.emailAddress}`); }

    window.location.href = environment.registerUrl + '?' + params.join('&');
  }

  getToken(): string {
    if (this.store.value.loginState._tag !== 'logged_in') {
      console.warn('Attempted to get token while user is not logged in');
      return '';
    }
    return this.store.value.loginState.token;
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
    if (this.store.value.user._tag === 'ready' && id === (this.store.value.user.person as any).id) {
      return pickValue(of((this.store.value.user as any).person));
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

  hasReturnUrl(): boolean {
    return !!this.returnUrl;
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
    return this.settings$.pipe(map(settings => settings?.[key]));
  }

  setUserSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    if (this.store.value.user._tag !== 'ready') {
      console.warn('Attempted to set a user setting, but there\'s no existing user state.');
      return;
    }
    const personID = (this.store.value.user.person as any).id ?? '';
    const settings = {...this.store.value.user.settings, [key]: value};
    this.store.next({ ...this.store.value, user: { ...this.store.value.user, settings }});
    this.storage.store(personsCacheKey(personID), settings);
  }

  getProfile(): Observable<Profile> {
    if (this.getToken() === '') {
      return of(prepareProfile(null, null));
    } else {
      return combineLatest([
        this.personApi.personFindProfileByToken(this.getToken()),
        this.user$
      ]).pipe(
        map(([profile, person]) => prepareProfile(profile, person)),
        take(1)
      );
    }
  }

  emailHasAccount(email: string): Observable<boolean> {
    return this.personApi.existsByEmail(email).pipe(
      map(response => response.status === 204),
      catchError(() => of(false))
    );
  }

  ngOnDestroy() {
    this.subLogout?.unsubscribe();
  }

  private set persistentState(state: PersistentState) {
    if (this.platformService.isBrowser) {
      this.localStoragePersistentState = state;
    } else {
      this.inMemoryPersistentState = state;
    }
  }

  private get persistentState(): PersistentState {
    if (this.platformService.isBrowser) {
      if (!isPersistentState(this.localStoragePersistentState)) {
        this.localStoragePersistentState = defaultPersistentState;
      }
      return <PersistentState>this.localStoragePersistentState;
    } else {
      return this.inMemoryPersistentState;
    }
  }

  private setNotLoggedIn() {
      this.persistentState = { ...this.persistentState, loginState: { _tag: 'not_logged_in' }};
      this.store.next({
        ...this.store.value,
        ...this.persistentState,
        user: { _tag: 'not_logged_in' }
      });
  }
}

