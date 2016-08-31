import {Injectable, Inject} from "@angular/core";
import { LocalStorage } from "angular2-localstorage/WebStorage";
import {PersonTokenApi} from "../api/PersonTokenApi";
import {Subscription, Observable} from "rxjs";
import {Person} from "../model/Person";
import {PersonApi} from "../api/PersonApi";

var config = require('../../../../config.json');

@Injectable()
export class UserService {

  @LocalStorage() private token = '';
  private user:Person;

  private subUser:Subscription;
  private subLogout:Subscription;
  private observable: Observable<Person>;

  constructor(
    private tokenService:PersonTokenApi,
    private userService:PersonApi
  ) {
    if (this.token) {
      this.loadUserInfo(this.token);
    }
  }

  public login(userToken:string) {
    if (this.user === userToken || this.subUser) {
      return;
    }
    this.loadUserInfo(userToken);
  }

  private loadUserInfo(token:string) {
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
    if (this.token === '' || this.subLogout) {
      return;
    }
    let token = this.token;
    this.token = '';
    this.user = undefined;
    this.subLogout = this.tokenService.personTokenDeleteToken(token)
      .subscribe(
        () => {},
        err => console.log(err)
      )
  }

  public getToken():string {
    return this.token;
  }

  public getUser():Observable<Person> {
    if (this.user) {
      return Observable.of(this.user);
    } else if (this.observable) {
      return this.observable;
    }
    this.observable = this.userService.personFindByToken(this.token).share();
    return this.observable;
  }

  public isLoggedIn() {
    return this.token !== '';
  }

  public getLoginUrl():string {
    return config.login_url;
  }
}
