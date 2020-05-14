import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../../src/app/shared/service/user.service';

export interface IVirUser {
  id: string;
  fullName: string;
  emailAddress: string;
  organisation: string[];
}

@Injectable({providedIn: 'root'})
export class VirOrganisationService {
  readonly users$: Observable<IVirUser[]>;
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {
    this.users$ = this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<IVirUser[]>('/api/authorities', {params: {token: this.userService.getToken()}})),
        shareReplay(1)
    );
  }

}
