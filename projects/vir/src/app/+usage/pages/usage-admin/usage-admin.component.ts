import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IVirUser, VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, switchMap, tap, startWith } from 'rxjs/operators';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Person } from 'projects/laji-api-client/src/lib/models/person';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'vir-usage-admin',
  templateUrl: './usage-admin.component.html',
  styleUrls: ['./usage-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageAdminComponent {

  @ViewChild('addUser', { static: true }) public addUserModal: ModalDirective;

  private organization$ = new BehaviorSubject<string | undefined>(undefined);
  private addUserEvent$ = new Subject<string>();

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

  addUserForm = this.formBuilder.group({
    organisations: this.formBuilder.control<string[]>([]),
    expirationUntil: this.formBuilder.control(this.getDefaultExpirationDate())
  });

  addUserSubmitDisabled$ = this.addUserForm.valueChanges.pipe(map(addUser => !addUser?.organisations.length), startWith(true));

  selected$ = new BehaviorSubject<IVirUser[]>([]);
  addUser$ = this.addUserEvent$.pipe(
    switchMap(this.virOrganisationService.getUser$),
    tap((u) => {
      this.addUserForm.patchValue(this.userToFormData(u));
      this.addUserModal.show();
    }));
  administratableOrganisations$ = this.virOrganisationService.virUser$.pipe(map(user => user.organisationAdmin));

  constructor(
    private virOrganisationService: VirOrganisationService,
    private formBuilder: FormBuilder
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

  onSelectedAddUser(autocompletePerson: Person) {
    this.addUserEvent$.next(autocompletePerson.id);
  }

  userToFormData(user: IVirUser) {
    return {
        organisations: user.organisationAdmin?.map(({id}) => id) || [],
        expirationUntil: this.getDefaultExpirationDate()
      };
  }

  private getDefaultExpirationDate() {
    const expirationYear = new Date().getFullYear()
      + (new Date().getMonth() < 7 ? 1 : 2);
    return new Date(expirationYear + '-01-31').toISOString().split('T')[0];
  }

  onUserFormSubmit({value}: {value: any}) {
  }
}
