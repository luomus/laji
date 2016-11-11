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
  private currentUserId: string;
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
    if (this.token === userToken || this.subUser) {
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
    this.currentUserId = undefined;
    this.subLogout = this.tokenService.personTokenDeleteToken(token)
      .subscribe(
        () => {},
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
    this.formDefaultObservable = this.getUser()
      .map(data => ({
        'editors': [data.id],
        'gatheringEvent': {
          'leg': [data.id]
        }
      }))
      .do(data => this.defaultFormData = data)
      .share();
    return this.formDefaultObservable;
  }

  private loadUserInfo(token: string) {
    this.token = token;
    this.getUser()
      .subscribe(
        user => this.addUser(user, true),
        err => {
          this.logout();
          console.log(err);
        }
      );
  }

  private getCurrentUser() {
    if (this.currentUserId && this.users[this.currentUserId]) {
      return Observable.of(this.users[this.currentUserId]);
    } else if (this.observable) {
      return this.observable;
    }
    if (!this.token) {
      return Observable.of({});
    }
    this.observable = this.userService.personFindByToken(this.token)
      .do(u => this.addUser(u, true))
      .share();
    return this.observable;
  }

  private addUser(user: Person, asCurrent: boolean = false) {
    if (asCurrent) {
      this.currentUserId = user.id;
    }
    this.users[user.id] = user;
  }
}
