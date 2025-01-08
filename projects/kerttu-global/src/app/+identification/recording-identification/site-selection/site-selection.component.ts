import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSite } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bsg-site-selection',
  template: `
    <bsg-site-selection-view
      [sites]="(sites$ | async) ?? []"
      (siteSelect)="siteSelect.emit($event)"
    ></bsg-site-selection-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionComponent {
  sites$: Observable<IGlobalSite[]>;

  @Output() siteSelect = new EventEmitter<number[]>();

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi
  ) {
    this.sites$ = this.kerttuGlobalApi.getSites(this.userService.getToken()).pipe(
      map(result => result.results)
    );
  }
}
