import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IVirUser, VirOrganisationService } from '../../../service/vir-organisation.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-by-organization',
  templateUrl: './usage-by-organization.component.html',
  styleUrls: ['./usage-by-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByOrganizationComponent {

  organisation: string;
  users$: Observable<IVirUser[]>;

  constructor(
      private virOrganisationService: VirOrganisationService
  ) {
    this.users$ = this.virOrganisationService.users$;
  }

  organizationSelect(org: string) {
    this.organisation = org;
    this.users$ = this.virOrganisationService.users$.pipe(
      map(users => org ? users.filter(u => u?.organisation.includes(org)) : users)
    );
  }
}
