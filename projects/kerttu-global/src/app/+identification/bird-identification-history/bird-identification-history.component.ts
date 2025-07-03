import { Component } from '@angular/core';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IGlobalSite, TaxonTypeEnum } from '../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-bird-identification-history',
  template: `
    <bsg-identification-history
      [sites]="(sites$ | async) ?? []"
    ></bsg-identification-history>
  `
})
export class BirdIdentificationHistoryComponent {
  sites$: Observable<IGlobalSite[]>;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService
  ) {
    this.sites$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getSites(
        [TaxonTypeEnum.bird, TaxonTypeEnum.insect, TaxonTypeEnum.frog],
        this.userService.getToken())
      ),
      map(result => result.results)
    );
  }
}
