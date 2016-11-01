import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { PersonTokenApi } from '../api/PersonTokenApi';
import { Subscription, Observable, Observer } from 'rxjs';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage } from 'angular2-localstorage/dist';
import { Location } from '@angular/common';

const config = require('../../../../config.json');

@Injectable()
export class UserService {

  public isLoggedIn = false;

  @LocalStorage() private token = '';
  @LocalStorage() private returnUrl = '/';
  private user: Person;
  private users: {[id: string]: Person} = {};
  private usersFetch: {[id: string]: Observable<Person>} = {};
  private defaultFormData: any;
  private window;

  private subUser: Subscription;
  private subLogout: Subscription;
  private observable: Observable<Person>;
  private formDefaultObservable: Observable<any>;

  constructor(private tokenService: PersonTokenApi,
              private userService: PersonApi,
              private router: Router,
              private location: Location,
              @Inject('Window') window: Window) {
    this.window = window;
    if (this.token) {
      this.loadUserInfo(this.token);
      this.isLoggedIn = true;
    }
  }

  public login(userToken: string) {
    if (this.user === userToken || this.subUser) {
      return;
    }
    this.isLoggedIn = true;
    this.loadUserInfo(userToken);
  }

  public logout() {
    if (this.token === '' || this.subLogout) {
      return;
    }
    let token = this.token;
    this.token = '';
    this.isLoggedIn = false;
    this.user = undefined;
    this.subLogout = this.tokenService.personTokenDeleteToken(token)
      .subscribe(
        () => {
        },
        err => console.log(err)
      );
  }

  public getToken(): string {
    return this.token;
  }

  public getUser(id?: string): Observable<Person> {
    if (!id) {
      return this.getCurrentUser();
    }
    if (this.users[id]) {
      return Observable.of(this.users[id]);
    } else if (!this.usersFetch[id]) {
      this.usersFetch[id] = Observable.create((observer: Observer<Person>) => {
        const onComplete = (user: Person) => {
          this.users[id] = user;
          observer.next(user);
          observer.complete();
          delete this.usersFetch[id];
        };
        this.userService.personFindByUserId(id)
          .catch((e) => Observable.of({}))
          .subscribe(
            (user: Person) => {
              onComplete(user);
            }
          );
      }).share();
    }
    return this.usersFetch[id];
  }

  public doLogin(): void {
    this.returnUrl = this.location.path(true);
    this.window.location.href = config.login_url;
  }

  public returnToPageBeforeLogin(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  public getDefaultFormData(): Observable<any> {
    if (this.defaultFormData) {
      return Observable.of(this.defaultFormData);
    } else if (this.formDefaultObservable) {
      return this.formDefaultObservable;
    }
    this.formDefaultObservable = this.getUser().map(data => ({
        'editors': [data.id],
        'gatheringEvent': {
          'leg': [data.id]
        }
      }));
    return this.formDefaultObservable;
  }

  private loadUserInfo(token: string) {
    this.token = token;
    this.getUser()
      .subscribe(
        user => this.user = user,
        err => {
          this.logout();
          console.log(err);
        }
      );
  }

  private getCurrentUser() {
    if (this.user) {
      return Observable.of(this.user);
    } else if (this.observable) {
      return this.observable;
    }
    if (!this.token) {
      return Observable.of({});
    }
    this.observable = this.userService.personFindByToken(this.token)
      .do(u => this.users[u.id] = u)
      .share();
    return this.observable;
  }
}
