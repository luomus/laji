import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { UserService } from './user.service';
import { map, switchMap, take, tap } from 'rxjs';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import type { paths } from 'projects/laji-api-client/generated/api';

type FriendsAutocompleteResponse = paths['/autocomplete/friends']['get']['responses']['200']['content']['application/json']['results'];

@Injectable({providedIn: 'root'})
export class FriendService {

  private friends?: FriendsAutocompleteResponse;

  constructor(
    private api: LajiApiClientService,
    private userService: UserService
  ) { }

  allFriends(): Observable<FriendsAutocompleteResponse> {
    if (this.friends) {
      return ObservableOf(this.friends);
    }
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!login) {
          return ObservableOf([]);
        }
        return this.api.get('/autocomplete/friends', { query: {
          query: '', limit: 1000
        } }).pipe(map(({results}) => results), tap(data => this.friends = data));
      })
    );
  }

}
