import { Injectable } from '@angular/core';
import { PersonTokenApi } from '../api/PersonTokenApi';
import { Subscription, Observable, Observer } from 'rxjs';
import { Person } from '../model/Person';
import { PersonApi } from '../api/PersonApi';
import { LocalStorage } from 'angular2-localstorage/dist';

var config = require('../../../../config.json');

@Injectable()
export class UserService {

  @LocalStorage() private token = '';
  private user: Person;
  private users: {[id: string]: Person} = {};
  private usersFetch: {[id: string]: Observable<Person>} = {};
  private defaultFormData: any;

  private subUser: Subscription;
  private subLogout: Subscription;
  private observable: Observable<Person>;
  private formDefaultObservable: Observable<any>;

  constructor(private tokenService: PersonTokenApi,
              private userService: PersonApi) {
    if (this.token) {
      this.loadUserInfo(this.token);
    }
  }

  public login(userToken: string) {
    if (this.user === userToken || this.subUser) {
      return;
    }
    this.loadUserInfo(userToken);
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

  public logout() {
    if (this.token === '' || this.subLogout) {
      return;
    }
    let token = this.token;
    this.token = '';
    this.user = undefined;
    this.subLogout = this.tokenService.personTokenDeleteToken(token)
      .subscribe(
        () => {
        },
        err => console.log(err)
      )
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
        var onComplete = (user: Person) => {
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

  public isLoggedIn() {
    return this.token !== '';
  }

  public getLoginUrl(): string {
    return config.login_url;
  }

  public getDefaultFormData(): Observable<any> {
    if (this.defaultFormData) {
      return Observable.of(this.defaultFormData);
    } else if (this.formDefaultObservable) {
      return this.formDefaultObservable;
    }
    this.formDefaultObservable = this.getUser().map(data => {
      return {
        'editors': [data.id],
        'gatheringEvent': {
          'leg': [data.id]
        }
      }
    }).share();
    return this.formDefaultObservable;
  }

}
