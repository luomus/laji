import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IVirUser, VirOrganisationService } from '../../../service/vir-organisation.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { SelectionType } from '@achimha/ngx-datatable';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';
import { Person } from 'projects/laji/src/app/shared/model/Person';

@Component({
  selector: 'vir-usage-admin',
  templateUrl: './usage-admin.component.html',
  styleUrls: ['./usage-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageAdminComponent {

  @ViewChild('addUser', { static: true }) public addUserModal!: ModalComponent;

  private organization$ = new BehaviorSubject<string | undefined>(undefined);
  private addUserEvent$ = new Subject<string>();

  selectByCheckbox = SelectionType.checkbox;

  administrableUsers$ = this.virOrganisationService.administrableUsers$;
  selectedUsers$ = combineLatest([
    this.virOrganisationService.administrableUsers$,
    this.organization$
  ]).pipe(
    map(([users, organisation]) =>!organisation
      ? users
      : users.filter(u => u?.organisation.some(org => org.value === organisation))
    )
  );

  addUserForm = this.formBuilder.group({
    id: this.formBuilder.control<string>(''),
    organisation: this.formBuilder.control<string[]>([]),
    expirationUntil: this.formBuilder.control(this.getDefaultExpirationDate(), [Validators.required, function validator(date) {
      return date.value === 'Invalid date' ? {dateInvalid: true} : null;
    }])
  });

  userModifyReqPending$ = new BehaviorSubject<boolean>(false);
  userAddReqPending: string[] = [];

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
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) { }

  onOrganizationSelect(org: string) {
    this.organization$.next(org);
  }

  onDatatableSelect({selected}: {selected: IVirUser[]}) {
    this.selected$.next(selected);
  }

  onContinueExpirationDateButtonClick() {
    this.selected$.pipe(
      tap(() => this.userModifyReqPending$.next(true)),
      take(1),
      switchMap(selected =>
        this.virOrganisationService.continueExpiration(selected)
      )
    ).subscribe(
      () => {
        this.reloadData();
        this.userModifyReqPending$.next(false);
        this.toastrService.success(this.translate.instant('usage.admin.api.continueExpiration.success'));
      },
      () => {
        this.userModifyReqPending$.next(false);
        this.toastrService.error(this.translate.instant('usage.admin.api.error'));
      }
    );
  }

  onRemoveAccessButtonClick() {
    this.selected$.pipe(
      tap(() => this.userModifyReqPending$.next(true)),
      take(1),
      switchMap(selected =>
        this.virOrganisationService.revokeAccess(selected)
      )
    ).subscribe(
      () => {
        this.reloadData();
        this.userModifyReqPending$.next(false);
        this.toastrService.success(this.translate.instant('usage.admin.api.revokeAccess.success'));
      },
      () => {
        this.userModifyReqPending$.next(false);
        this.toastrService.error(this.translate.instant('usage.admin.api.error'));
      }
    );
  }

  reloadData() {
    this.selected$.next([]);
    this.virOrganisationService.reloadUsers();
  }

  onSelectedAddUser(autocompletePerson: Person) {
    this.addUserEvent$.next(autocompletePerson.id);
  }

  userToFormData(user: IVirUser) {
    return {
        id: user.id,
        organisation: [],
        expirationUntil: this.getDefaultExpirationDate()
      };
  }

  private getDefaultExpirationDate() {
    const expirationYear = new Date().getFullYear()
      + (new Date().getMonth() < 7 ? 1 : 2);
    return new Date(expirationYear + '-01-31').toISOString().split('T')[0];
  }

  onUserFormSubmit({value}: {value: any}) {
    this.userAddReqPending = [...this.userAddReqPending, value.id];
    this.virOrganisationService.grantAccess(value.id, value.organisation, value.expirationUntil).subscribe(
      () => {
        this.userAddReqPending = this.userAddReqPending.filter(id => id !== value.id);
        this.reloadData();
        this.addUserModal.hide();
        this.toastrService.success(this.translate.instant('usage.admin.api.grantAccess.success'));
      },
      () => {
        this.userAddReqPending = this.userAddReqPending.filter(id => id !== value.id);
        this.toastrService.error(this.translate.instant('usage.admin.api.error'));
      }
    );
  }
}
