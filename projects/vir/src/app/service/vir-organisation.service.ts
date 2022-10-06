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
  organisationAdmin: string[];
}

@Injectable({providedIn: 'root'})
export class VirOrganisationService {
  readonly users$: Observable<IVirUser[]>;
  readonly administrableUsers$: Observable<IVirUser[]>;
  readonly virUser$: Observable<IVirUser>;
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

    // PAP backend returns organisationAdmin as labels but lajiapi return user organisationAdmin as a code,
    // so we need to dig the admin user from the PAP backend result so we can later compare the organisationAdmin
    // of the PAP results to the user's organisationAdmin. There is no API for organisation  code -> label conversion.
    this.virUser$ = this.userService.user$.pipe(
      filter(user => !!user.organisationAdmin?.length),
      switchMap(user => this.users$.pipe(map(users => users.find(u => u.id === user.id))))
    );

    this.administrableUsers$ = this.virUser$.pipe(
      filter(user => !!user.organisationAdmin?.length),
      switchMap(user => getUsers({includeExpired: true}).pipe(
        map(users => users.filter(u => u.organisation.some(o => user.organisationAdmin.includes(o)))),
      ))
    );
  }
}
