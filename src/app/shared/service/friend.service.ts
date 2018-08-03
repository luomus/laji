import { Injectable } from '@angular/core';
import {Autocomplete} from '../model/Autocomplete';
import {Observable, of as ObservableOf} from 'rxjs';
import {UserService} from './user.service';
import { LajiApi, LajiApiService } from './laji-api.service';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class FriendService {

  private friends: Autocomplete[];

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService
  ) { }

  allFriends(): Observable<Autocomplete[]> {
    if (this.friends) {
      return ObservableOf(this.friends);
    }
    return this.userService.isLoggedIn$.pipe(
      switchMap(login => {
        if (!login) {
          return ObservableOf([]);
        }
        return this.lajiApi
          .get(LajiApi.Endpoints.autocomplete, 'friends', {includeSelf: true,personToken: this.userService.getToken()})
          .pipe(tap(data => this.friends = data))
      })
    );
  }

}
