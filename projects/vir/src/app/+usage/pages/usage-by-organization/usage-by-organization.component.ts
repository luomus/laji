import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-by-organization',
  templateUrl: './usage-by-organization.component.html',
  styleUrls: ['./usage-by-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByOrganizationComponent {

  private organization$ = new BehaviorSubject<string | undefined>(undefined);

  allUsers$ = this.virOrganisationService.users$;
  selectedUsers$ = combineLatest([
    this.virOrganisationService.users$,
    this.organization$
  ]).pipe(
    map(([users, organisation]) => organisation
      ? users.filter(u => u?.organisation.some(org => org.value === organisation))
      : users
    ),
  );

  constructor(private virOrganisationService: VirOrganisationService) { }

  organizationSelect(org: string) {
    this.organization$.next(org);
  }
}
