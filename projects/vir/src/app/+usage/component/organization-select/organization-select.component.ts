import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IVirUser, VirOrganisationService } from '../../../service/vir-organisation.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'vir-organization-select',
  templateUrl: './organization-select.component.html',
  styleUrls: ['./organization-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSelectComponent implements OnInit {

  /**
   *  Filter the organizations to include only the ones that that user is admin of.
   */
  @Input() filterByAdmin = false;

  @Input() users$: Observable<IVirUser[]>;

  organisations$: Observable<string[]>;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() select = new EventEmitter<string>();

  constructor(
      private virOrganisationService: VirOrganisationService
  ) {}

  ngOnInit(): void {
    this.organisations$ = this.users$.pipe(
      switchMap(data => {
        const organizations = new Set<string>();
        data.forEach(person => {
          person.organisation.forEach(o => organizations.add(o));
        });
        if (!this.filterByAdmin) {
          return of(Array.from(organizations.values()));
        }
        return this.virOrganisationService.virUser$.pipe(map(user =>
          Array.from(organizations.values()).filter(org => user.organisationAdmin.some(({label}) => label === org))
        ));
      })
    );
  }
}
