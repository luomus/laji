import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-admin',
  templateUrl: './usage-admin.component.html',
  styleUrls: ['./usage-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageAdminComponent {

  private organization$ = new BehaviorSubject<string | undefined>(undefined);

  users$ = combineLatest([
    this.virOrganisationService.administrableUsers$,
    this.organization$
  ]).pipe(
    map(([users, organisation]) => !organisation
      ? users
      : users.filter(u => u?.organisation.includes(organisation))
    )
  );

  constructor(
    private virOrganisationService: VirOrganisationService
  ) { }

  organizationSelect(org: string) {
    this.organization$.next(org);
  }
}
