import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, shareReplay, switchMap, map, share } from 'rxjs/operators';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';

export interface IVirUser {
  id: string;
  fullName: string;
  emailAddress: string;
  organisation: {id: string; value: string}[];
  organisationAdmin: {id: string; value: string}[];
}

@Injectable({providedIn: 'root'})
export class VirOrganisationService {
  readonly users$: Observable<IVirUser[]>;
  readonly administrableUsers$: Observable<IVirUser[]>;
  readonly virUser$ = this.userService.user$.pipe(switchMap(user => this.getUser$(user.id)), shareReplay());
  readonly updateUsers$ = new BehaviorSubject<void>(undefined);
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {
    const getUsers = (params?: Record<string, string | boolean | number>) => this.updateUsers$.pipe(
      switchMap(() =>
      this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<IVirUser[]>('/api/authorities', {params: {token: this.userService.getToken(), ...(params || {})}})),
        share()
    )),
      share()
    );

    this.users$ = getUsers();

    this.administrableUsers$ = this.virUser$.pipe(
      filter(user => !!user.organisationAdmin?.length),
      switchMap(user => getUsers({includeExpired: true}).pipe(
        map(users => users.filter(u => u.organisation.some(o => user.organisationAdmin.some(({value}) => o.value === value)))),
      )),
      share()
    );

    this.getUser$ = this.getUser$.bind(this);
  }

  reloadUsers = () => this.updateUsers$.next();

  getUser$(id: string) {
    return this.httpClient.get<IVirUser>(`/api/authorities/${id}`, {params: {token: this.userService.getToken()}});
  }

  continueExpiration(users: IVirUser[]) {
    return this.httpClient.put(`/api/admin/${users.map(({id}) => id).join('+')}`, undefined);
  }

  revokeAccess(users: IVirUser[]) {
    return this.httpClient.delete(`/api/admin/${users.map(({id}) => id).join('+')}`);
  }

  grantAccess(userID: string, organisations: string[], expireDate: string) {
    return this.httpClient.post(`/api/admin/${userID}?organisations=${organisations.join('+')}&expireDate=${expireDate}`, undefined);
  }
}
