import { Injectable } from '@angular/core';
import {AutocompleteApi} from '../api/AutocompleteApi';
import {Autocomplete} from '../model';
import {Observable} from 'rxjs/Observable';
import {UserService} from './user.service';

@Injectable()
export class FriendService {

  private friends: Autocomplete[];

  constructor(
    private autocompleteApi: AutocompleteApi,
    private userService: UserService
  ) { }

  allFriends(): Observable<Autocomplete[]> {
    if (this.friends) {
      return Observable.of(this.friends);
    }
    if (!this.userService.isLoggedIn) {
      return Observable.of([]);
    }
    return this.autocompleteApi
      .autocompleteFindByField({
        field: 'friends',
        includeSelf: true,
        personToken: this.userService.getToken()
      })
      .do(data => this.friends = data);
  }

}
