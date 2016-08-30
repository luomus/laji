import {Injectable, Inject} from "@angular/core";
import { LocalStorage } from "angular2-localstorage/WebStorage";
import {PersonTokenApi} from "../api/PersonTokenApi";
import {Subscription} from "rxjs";
import {Person} from "../model/Person";
import {PersonApi} from "../api/PersonApi";

var config = require('../../../../config.json');

@Injectable()
export class UserService {

  @LocalStorage() private token = '';
  private user:Person;

  private subUser:Subscription;
  private subLogout:Subscription;

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
    this.subUser = this.userService.personFindByToken(token)
      .subscribe(
        user => {
          this.token = token;
          this.user = user;
          console.log(this.user);
        },
        err => {
          this.token = '';
          console.log(err);
        }
      );
  }

  public logout() {
    if (this.token === '' || this.subLogout) {
      console.log('not login out!');
      return;
    }
    let token = this.token;
    this.token = '';
    console.log('loggin out!!!!');
    this.subLogout = this.tokenService.personTokenDeleteToken(token)
      .subscribe(
        () => {},
        err => console.log(err)
      )
  }

  public getUser():Person|boolean {
    return this.user || false;
  }

  public isLoggedIn() {
    return this.token !== '';
  }

  public getLoginUrl():string {
    return config.login_url;
  }
}
