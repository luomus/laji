import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Site, TaxonTypeEnum } from '../../../bsg-shared/models';
import { BsgApi } from '../../../bsg-shared/service/bsg-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { map } from 'rxjs';

@Component({
    selector: 'bsg-site-selection',
    template: `
    <bsg-site-selection-view
      [sites]="(sites$ | async) ?? []"
      (siteSelect)="siteSelect.emit($event)"
    ></bsg-site-selection-view>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SiteSelectionComponent {
  sites$: Observable<Site[]>;

  @Output() siteSelect = new EventEmitter<number[]>();

  constructor(
    private userService: UserService,
    private bsgApi: BsgApi
  ) {
    this.sites$ = this.bsgApi.getSites(
      [TaxonTypeEnum.bird, TaxonTypeEnum.insect, TaxonTypeEnum.frog, TaxonTypeEnum.mammal],
      this.userService.getToken()
    ).pipe(
      map(result => result.results)
    );
  }
}
