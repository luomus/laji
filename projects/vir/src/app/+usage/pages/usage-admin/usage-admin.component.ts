import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IVirUser, VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'vir-usage-admin',
  templateUrl: './usage-admin.component.html',
  styleUrls: ['./usage-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageAdminComponent {

  private organization$ = new BehaviorSubject<string | undefined>(undefined);

  selectByCheckbox = SelectionType.checkbox;

  users$ = combineLatest([
    this.virOrganisationService.administrableUsers$,
    this.organization$
  ]).pipe(
    map(([users, organisation]) => !organisation
      ? users
      : users.filter(u => u?.organisation.includes(organisation))
    )
  );

  selected$ = new BehaviorSubject<IVirUser[]>([]);

  constructor(
    private virOrganisationService: VirOrganisationService
  ) { }

  onOrganizationSelect(org: string) {
    this.organization$.next(org);
  }

  onDatatableSelect({selected}: {selected: IVirUser[]}) {
    this.selected$.next(selected);
  }

  onContinueExpirationDateButtonClick() {
  }

  onRemoveAccessButtonClick() {
  }
}
