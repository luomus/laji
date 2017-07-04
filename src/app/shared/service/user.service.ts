import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { PersonTokenApi } from '../api/PersonTokenApi';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage } from 'ng2-webstorage';
import { Location } from '@angular/common';
import { Logger } from '../logger/logger.service';
import { AppConfig } from '../../app.config';
import { WindowRef } from '../windows-ref';
import { ToastsService } from './toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LocalDb } from '../local-db/local-db.abstract';

export const USER_INFO = '[user]: info';
export const USER_LOGOUT_ACTION = '[user]: logout';

@Injectable()
export class UserService extends LocalDb {

  public static readonly UNKOWN_USER = 'unknown';

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

  constructor(private tokenService: PersonTokenApi,
              private userService: PersonApi,
              private router: Router,
              private location: Location,
              private logger: Logger,
              private appConfig: AppConfig,
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
    if (this.token === userToken || this.subUser) {
      return;
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
    this.subLogout = this.tokenService.personTokenDeleteToken(this.token)
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
          return Observable.of({});
        });
    }
    if (this.users[id]) {
      return Observable.of(this.users[id]);
    } else if (!this.usersFetch[id]) {
      this.usersFetch[id] = Observable.create((observer: Observer<Person>) => {
        const onComplete = (user: Person) => {
          observer.next(user);
          observer.complete();
          delete this.usersFetch[id];
        };
        this.userService.personFindByUserId(id)
          .catch((e) => Observable.of({}))
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

  public doLogin(): void {
    this.returnUrl = this.location.path(true);
    this.winRef.nativeWindow.location.href = this.appConfig.getLoginUrl();
  }

  public returnToPageBeforeLogin(): void {
    this.router.navigateByUrl(
      this.localizeRouterService.translateRoute(this.returnUrl || '/')
    );
  }

  public getDefaultFormData(): Observable<any> {
    if (this.defaultFormData) {
      return Observable.of(this.defaultFormData);
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
    return Observable.of(this.userSettings && this.userSettings[key] ? this.userSettings[key] : undefined);
  }

  public setUserSetting(key: string, value: any) {
    const userId = this.currentUserId ? this.currentUserId : UserService.UNKOWN_USER;
    this.setItem(userId, {...this.userSettings, [key]: value})
      .do((settings) => this.userSettings = settings)
      .subscribe();
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
      return Observable.of({});
    }
    if (this.currentUserId && this.users[this.currentUserId]) {
      return Observable.of(this.users[this.currentUserId]);
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
