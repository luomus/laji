import { map, catchError, switchMap, tap, share, retry } from 'rxjs/operators';
import { Observable, Observer, of as ObservableOf, ReplaySubject, Subject, Subscription, throwError as observableThrowError } from 'rxjs';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage } from 'ngx-webstorage';
import { isPlatformBrowser, Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { ToastsService } from './toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LocalDb } from '../local-db/local-db.abstract';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { WINDOW } from '@ng-toolkit/universal';





export const USER_INFO = '[user]: info';
export const USER_LOGOUT_ACTION = '[user]: logout';

@Injectable({providedIn: 'root'})
export class UserService extends LocalDb {

  public static readonly UNKOWN_USER = 'unknown';
  public static readonly SETTINGS_RESULT_LIST = 'result-list';
  public static readonly SETTINGS_TAXONOMY_LIST = 'taxonomy-list';
  public static readonly SETTINGS_TAXONOMY_TREE = 'taxonomy-tree';

  private _isLoggedIn$ = new ReplaySubject<boolean>(1);
  private actionSource = new Subject<any>();
  public action$ = this.actionSource.asObservable();

  // Do not write to this variable in the server!
  @LocalStorage() private token;
  @LocalStorage() private returnUrl;
  private userSettings: {[key: string]: any};
  private currentUserId: string;
  private users: {[id: string]: Person} = {};
  private usersFetch: {[id: string]: Observable<Person>} = {};
  private defaultFormData: any;
  private checked = false;

  private subUser: Subscription;
  private subLogout: Subscription;
  private observable: Observable<Person>;
  private formDefaultObservable: Observable<any>;

  public static getLoginUrl(next = '', lang = 'fi') {
    return (environment.loginUrl
    + '?target=' + environment.systemID
    + '&redirectMethod=GET&locale=%lang%'
    + '&next=' + next).replace('%lang%', lang);
  }

  constructor(private userService: PersonApi,
              private router: Router,
              private location: Location,
              private logger: Logger,
              private toastsService: ToastsService,
              private translate: TranslateService,
              private localizeRouterService: LocalizeRouterService,
              @Inject(PLATFORM_ID) private platformId: object,
              @Inject(WINDOW) private window: Window) {
    super('settings', isPlatformBrowser(platformId));
  }

  public set isLoggedIn(isIn: boolean) {
    this._isLoggedIn$.next(isIn);
  }

  public get isLoggedIn() {
    console.error('Use observable isLoggedIn$ instead of this isLoggedIn');
    return true;
  }

  public get isLoggedIn$() {
    if (!this.checked) {
      this.checkLogin();
      this.checked = true;
    }
    return this._isLoggedIn$.asObservable();
  }

  public login(userToken: string) {
    if (this.token === userToken || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.subUser) {
      this.subUser.unsubscribe();
    }
    this.subUser = this.loadUserInfo(userToken).subscribe(value => {
      this.isLoggedIn = !!value;
    });
  }

  public logout(showError = true) {
    if (!this.token || this.subLogout) {
      return;
    }
    this.subLogout = this.userService.removePersonToken(this.token).pipe(
      catchError(err => {
        if (err.status === 404) {
          return ObservableOf(null);
        }
        return observableThrowError(err);
      })).pipe(
      retry(5))
      .subscribe(
        () => {
          this.token = '';
          this.isLoggedIn = false;
          this.currentUserId = undefined;
          this.actionSource.next(USER_LOGOUT_ACTION);
        },
        err => {
          if (this.token !== '') {
            this.token = '';
            this.isLoggedIn = false;
            this.currentUserId = undefined;
            if (showError) {
              this.translate.get('error.logout').subscribe(
                msg => this.toastsService.showError(msg)
              );
            }
            this.logger.warn('Failed to logout', err);
          }
        }
      );
  }

  public getToken(): string {
    return this.token;
  }

  public getUser(id?: string, token?: string): Observable<Person> {
    if (!id) {
      return this.getCurrentUser(token).pipe(
        catchError((err: HttpErrorResponse | any) => {
          if (err instanceof HttpErrorResponse && err.status !== 404 && err.status !== 400) {
            this.logger.error('Failed to fetch current users information', err);
          }
          this.logout(false);
          return ObservableOf({});
        }));
    }
    if (this.users[id]) {
      return ObservableOf(this.users[id]);
    } else if (!this.usersFetch[id]) {
      this.usersFetch[id] = Observable.create((observer: Observer<Person>) => {
        const onComplete = (user: Person) => {
          observer.next(user);
          observer.complete();
          delete this.usersFetch[id];
        };
        this.userService.personFindByUserId(id).pipe(catchError((e) => ObservableOf({})))
          .subscribe(
            (user: Person) => {
              this.addUser(user);
              onComplete(user);
            }
          );
      });
      this.usersFetch[id] = this.usersFetch[id].pipe(share());
    }
    return this.usersFetch[id];
  }

  public doLogin(returnUrl?: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.returnUrl = returnUrl || this.location.path(true);
      this.window.location.href = UserService.getLoginUrl(this.returnUrl, this.translate.currentLang);
    }
  }

  public getReturnUrl(): string {
    const returnTo = this.returnUrl || '/';
    const lang = this.localizeRouterService.getLocationLang(returnTo);
    this.translate.use(lang);
    return this.localizeRouterService.translateRoute(
      this.localizeRouterService.getPathWithoutLocale(returnTo)
    );
  }

  public getDefaultFormData(): Observable<any> {
    if (this.defaultFormData) {
      return ObservableOf(this.defaultFormData);
    } else if (this.formDefaultObservable) {
      return this.formDefaultObservable;
    }
    this.formDefaultObservable = this.getUser().pipe(
      map(data => ({
        'creator': data.id,
        'gatheringEvent': {
          'leg': [data.id]
        }
      }))).pipe(
      tap(data => this.defaultFormData = data),
      share()
    );
    return this.formDefaultObservable;
  }

  public getUserSetting(key): Observable<any> {
    return ObservableOf(this.userSettings && this.userSettings[key] ? this.userSettings[key] : undefined);
  }

  public setUserSetting(key: string, value: any): void {
    if (!this.currentUserId) {
      return;
    }
    this.setItem(this.currentUserId, {...this.userSettings, [key]: value}).pipe(
      tap((settings) => this.userSettings = settings))
      .subscribe(() => {}, () => {});
  }

  private checkLogin() {
    if (isPlatformBrowser(this.platformId) && this.token) {
      if (this.token) {
        this.loadUserInfo(this.token).subscribe(
          value => this.isLoggedIn = !!value,
          () => this.isLoggedIn = false
        );
      } else {
        this.isLoggedIn = true;
      }
    } else {
      // On server render the pages just like the user would have been logged in
      this.isLoggedIn = true;
    }
  }

  private loadUserInfo(token: string): Observable<any> {
    this.token = token;
    return this.getUser(null, token).pipe(
      tap((person: Person) => this.addUser(person, true)),
      switchMap((person: Person) => this.getItem(person.id).pipe(
        tap((settings: any) => this.userSettings = settings),
        switchMap(() => ObservableOf(person))
      )),
      tap(() => this.actionSource.next(USER_INFO)),
      catchError(err => {
        this.logout();
        this.logger.warn('Failed to load user info with token', err);

        return ObservableOf(null);
      })
    );
  }

  private getCurrentUser(token?: string) {
    const userToken = token || this.token;
    if (!userToken) {
      return ObservableOf({});
    }
    if (this.currentUserId && this.users[this.currentUserId]) {
      return ObservableOf(this.users[this.currentUserId]);
    } else if (this.observable) {
      return this.observable;
    }
    this.observable = this.userService.personFindByToken(userToken).pipe(
      tap(u => this.addUser(u, true)),
      share()
    );
    return this.observable;
  }

  private addUser(user: Person, asCurrent = false) {
    if (!user) {
      return;
    }
    if (asCurrent) {
      this.currentUserId = user.id;
    }
    this.users[user.id] = user;
  }
}
