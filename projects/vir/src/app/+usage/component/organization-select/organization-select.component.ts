import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IVirUser } from '../../../service/vir-organisation.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

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

  readonly organisations$: Observable<string[]>;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() select = new EventEmitter<string>();

  constructor(
      private userService: UserService
  ) {}

  ngOnInit(): void {
    this.users$.pipe(
      switchMap(data => {
        const organizations = new Set<string>();
        data.forEach(person => {
          person.organisation.forEach(o => organizations.add(o));
        });
        const arr = Array.from(organizations.values());
        if (!this.filterByAdmin) {
          return of(arr);
        }
        return this.userService.user$.pipe(map(user =>
          arr.filter(org => user.organisationAdmin.includes(org))
        ));
      })
    );
  }
}
