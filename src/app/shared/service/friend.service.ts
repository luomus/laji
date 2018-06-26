import { Injectable } from '@angular/core';
import {Autocomplete} from '../model/Autocomplete';
import {Observable} from 'rxjs/Observable';
import {UserService} from './user.service';
import { LajiApi, LajiApiService } from './laji-api.service';

@Injectable()
export class FriendService {

  private friends: Autocomplete[];

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService
  ) { }

  allFriends(): Observable<Autocomplete[]> {
    if (this.friends) {
      return Observable.of(this.friends);
    }
    if (!this.userService.isLoggedIn) {
      return Observable.of([]);
    }
    return this.lajiApi
      .get(LajiApi.Endpoints.autocomplete, 'friends', {
        includeSelf: true,
        personToken: this.userService.getToken()
      })
      .do(data => this.friends = data);
  }

}
