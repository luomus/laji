import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, shareReplay, switchMap, map } from 'rxjs/operators';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';

export interface IVirUser {
  id: string;
  fullName: string;
  emailAddress: string;
  organisation: string[];
}

@Injectable({providedIn: 'root'})
export class VirOrganisationService {
  readonly users$: Observable<IVirUser[]>;
  readonly administrableUsers$: Observable<IVirUser[]>;
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {
    const getUsers = (params?: Record<string, string | boolean | number>) => this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<IVirUser[]>('/api/authorities', {params: {token: this.userService.getToken(), ...(params || {})}})),
      shareReplay(1)
    );
    this.users$ = getUsers();

    this.administrableUsers$ = this.userService.user$.pipe(
      filter(user => !!user.organisationAdmin?.length),
      switchMap(user => getUsers({includeExpired: true}).pipe(map(
        users => users.filter(u => u.organisation.some(o => user.organisationAdmin.includes(o)))
      )))
    );
  }

}
