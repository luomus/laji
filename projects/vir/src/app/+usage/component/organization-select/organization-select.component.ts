import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { VirOrganisationService } from '../../../service/vir-organisation.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-organization-select',
  templateUrl: './organization-select.component.html',
  styleUrls: ['./organization-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSelectComponent {

  readonly organisations$ = this.virOrganisationService.users$.pipe(
      map(data => {
        const organizations = new Set<string>();
        data.forEach(person => {
          person.organisation.forEach(o => organizations.add(o));
        });
        return Array.from(organizations.values());
      })
  );

  @Output() select = new EventEmitter<string>();

  constructor(
      private virOrganisationService: VirOrganisationService
  ) {}
}
