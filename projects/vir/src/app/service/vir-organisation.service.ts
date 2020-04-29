import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../../src/app/shared/service/user.service';

export interface IOrganizationPerson {
  id: string;
  fullName: string;
  emailAddress: string;
}

export interface IColOrganization {
  id: string;
  collectionName: {
    fi: string;
    sv: string;
    en: string;
  };
  person?: IOrganizationPerson[];
  children?: IColOrganization[];
}

@Injectable({providedIn: 'root'})
export class VirOrganisationService {
  readonly organisations$: Observable<IColOrganization[]>;
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {
    this.organisations$ = this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<IColOrganization[]>('/api/authorities', {params: {token: this.userService.getToken()}})),
        shareReplay(1)
    )
  }

}
