
import {throwError as observableThrowError,  Observer ,  Observable ,  Subscription ,  Subject, of as ObservableOf } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage } from 'ng2-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { WindowRef } from '../windows-ref';
import { ToastsService } from './toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LocalDb } from '../local-db/local-db.abstract';
import { environment } from '../../../environments/environment';
import { LajiApi, LajiApiService } from './laji-api.service';

export const USER_INFO = '[user]: info';
export const USER_LOGOUT_ACTION = '[user]: logout';

@Injectable({providedIn: 'root'})
export class UserService extends LocalDb {

  public static readonly UNKOWN_USER = 'unknown';
  public static readonly SETTINGS_RESULT_LIST = 'result-list';
  public static readonly SETTINGS_TAXONOMY_LIST = 'taxonomy-list';

  private actionSource = new Subject<any>();
  public action$ = this.actionSource.asObservable();
  public isLoggedIn = false;

  @LocalStorage() private token;
  @LocalStorage() private returnUrl;
  private userSettings: {[key: string]: any};
  private currentUserId: string;
  private users: {[id: string]: Person} = {};
  private usersFetch: {[id: string]: Observable<Person>} = {};
  private defaultFormData: any;

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

  constructor(private lajiApi: LajiApiService,
              private userService: PersonApi,
              private router: Router,
              private location: Location,
              private logger: Logger,
              private toastsService: ToastsService,
              private translate: TranslateService,
              private localizeRouterService: LocalizeRouterService,
              private winRef: WindowRef) {
    super('settings');
    if (this.token) {
      this.loadUserInfo(this.token);
      this.isLoggedIn = true;
    }
  }

  public login(userToken: string) {
    if (this.token === userToken) {
      return;
    }
    if (this.subUser) {
      this.subUser.unsubscribe();
    }
    setTimeout(() => {
      this.isLoggedIn = true;
      this.loadUserInfo(userToken);
    }, 10);
  }

  public logout(showError = true) {
    if (this.token === '' || this.subLogout) {
      return;
    }
    this.subLogout = this.lajiApi.remove(LajiApi.Endpoints.personToken, this.token)
      .catch(err => {
        if (err.status === 404) {
          return ObservableOf(null);
        }
        return observableThrowError(err);
      })
      .retry(5)
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

  public getUser(id?: string): Observable<Person> {
    if (!id) {
      return this.getCurrentUser()
        .catch((err: Response | any) => {
          if (err instanceof Response && err.status !== 404) {
            this.logger.error('Failed to fetch current users information', err);
          }
          this.logout(false);
          return ObservableOf({});
        });
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
        this.userService.personFindByUserId(id)
          .catch((e) => ObservableOf({}))
          .subscribe(
            (user: Person) => {
              this.addUser(user);
              onComplete(user);
            }
          );
      }).share();
    }
    return this.usersFetch[id];
  }

  public doLogin(returnUrl?: string): void {
    this.returnUrl = returnUrl || this.location.path(true);
    this.winRef.nativeWindow.location.href = UserService.getLoginUrl(this.returnUrl, this.translate.currentLang);
  }

  public returnToPageBeforeLogin(): void {
    const returnTo = this.returnUrl || '/';
    const lang = this.localizeRouterService.getLocationLang(returnTo);
    setTimeout(() => {
      this.translate.use(lang);
      this.router.navigateByUrl(
        this.localizeRouterService.translateRoute(
          this.localizeRouterService.getPathWithoutLocale(returnTo)
        )
      );
    }, 10);
  }

  public getDefaultFormData(): Observable<any> {
    if (this.defaultFormData) {
      return ObservableOf(this.defaultFormData);
    } else if (this.formDefaultObservable) {
      return this.formDefaultObservable;
    }
    this.formDefaultObservable = this.getUser()
      .map(data => ({
        'creator': data.id,
        'gatheringEvent': {
          'leg': [data.id]
        }
      }))
      .do(data => this.defaultFormData = data)
      .share();
    return this.formDefaultObservable;
  }

  public getUserSetting(key): Observable<any> {
    return ObservableOf(this.userSettings && this.userSettings[key] ? this.userSettings[key] : undefined);
  }

  public setUserSetting(key: string, value: any): void {
    if (!this.currentUserId) {
      return;
    }
    this.setItem(this.currentUserId, {...this.userSettings, [key]: value})
      .do((settings) => this.userSettings = settings)
      .subscribe(() => {}, () => {});
  };

  private loadUserInfo(token: string) {
    this.token = token;
    this.subUser = this.getUser()
      .do((person: Person) => this.addUser(person, true))
      .switchMap((person: Person) => this.getItem(person.id))
      .subscribe(settings => {
          this.userSettings = settings;
          this.actionSource.next(USER_INFO);
        },
        err => {
          this.logout();
          this.logger.warn('Failed to load user info with token', err);
        }
      );
  }

  private getCurrentUser() {
    if (!this.token) {
      return ObservableOf({});
    }
    if (this.currentUserId && this.users[this.currentUserId]) {
      return ObservableOf(this.users[this.currentUserId]);
    } else if (this.observable) {
      return this.observable;
    }
    this.observable = this.userService.personFindByToken(this.token)
      .do(u => this.addUser(u, true))
      .share();
    return this.observable;
  }

  private addUser(user: Person, asCurrent = false) {
    if (asCurrent) {
      this.currentUserId = user.id;
    }
    this.users[user.id] = user;
  }
}
