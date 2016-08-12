import {Injectable} from "@angular/core";
var config = require('../../../../config.json');

@Injectable()
export class UserService {

  private _isLoggedIn:boolean = false;
  private _token:string;

  public get isLoggedIn() {
    return this._isLoggedIn;
  }

  public set isLoggedIn(value) {
    throw new Error('Set user token to login!');
  }

  public get token() {
    return this._token;
  }

  public set token(token) {
    this._isLoggedIn = true;
    this._token = token;
  }

  public getLoginUrl():string {
    return config.login_url;
  }

}
