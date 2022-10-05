import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

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
    this.organization$,
    this.userService.user$.pipe(map(u => u.organisationAdmin))
  ]).pipe(
    map(([users, organisation, organisationAdmin]) => organisation
      ? organisationAdmin.includes(organisation)
        ? users.filter(u => u?.organisation.includes(organisation))
        : users
      : []),
  );

    // this.users$ = this.virOrganisationService.administrableUsers$.pipe(
    //   map(users => org ? users.filter(u => u?.organisation.includes(org)) : users)
    // );

  constructor(
    private virOrganisationService: VirOrganisationService,
    private userService: UserService
  ) { }

  organizationSelect(org: string) {
    this.organization$.next(org);
  }
}
