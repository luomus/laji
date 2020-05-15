import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  IVirUser,
  VirOrganisationService
} from '../../../service/vir-organisation.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-by-person',
  templateUrl: './usage-by-person.component.html',
  styleUrls: ['./usage-by-person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByPersonComponent {

  organisation: string;
  users$: Observable<IVirUser[]>;

  constructor(
      private virOrganisationService: VirOrganisationService
  ) {}

  organizationSelect(org: string) {
    this.organisation = org;
    this.users$ = this.virOrganisationService.users$.pipe(
      map(users => users.filter(u => u?.organisation.includes(org)))
    );
  }
}
